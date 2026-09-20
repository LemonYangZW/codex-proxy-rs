# 被动捕获 State

该能力与 [动态代理主动刷新](session-keepalive-design.md) 完全独立：不新增代理依赖，不主动发探针，只是从真实业务响应里顺手观测已经结构合法的 `x-codex-turn-state`，在其 TTL 内复用给同账号同模型的后续请求。全局开关和账号开关均默认关闭。

## 1. 与主动刷新的关系

两条路径共享同一套判定表和同一份 Redis 票据存储（`ProviderSessionTicketPort`），但产品语义不同：

| | 动态代理主动刷新 | 被动捕获 |
| --- | --- | --- |
| State 来源 | 独立运维 Client 主动探测 | 真实业务响应顺带观测 |
| 缺票时的行为 | fail-closed，选号阶段排除该账号/模型 | fail-open，原样放行业务请求，不阻塞、不报错 |
| 全局开关 | `sessionKeepaliveEnabled` | `passiveStateCaptureEnabled`（独立字段） |
| 账号开关 | `enableSessionKeepalive` | `enablePassiveStateCapture`（独立字段） |
| 风险确认 | `sessionKeepaliveRiskConfirmed` | `passiveStateCaptureRiskConfirmed`（独立确认，各自一次性生效，互不替代） |
| 模型范围 | `sessionKeepaliveModels` | 复用同一个 `sessionKeepaliveModels`，不新增清单 |
| 是否依赖动态代理 | 是，唯一且测试通过 | 否 |

两个开关可以独立开启、独立关闭。同一账号+模型如果两者都命中，业务请求覆盖逻辑（`SessionManager::rewrite`）以主动刷新为准（fail-closed 语义更强）；只有主动刷新未接管时，被动捕获才会尝试覆盖。

底层机制本质仍是跨轮次复用 `x-codex-turn-state`，与官方 Codex 合同 "must not send it between different turns" 的已知偏离并未因为触发方式更温和而消失，因此同样要求显式开关加风险确认，而不是默认静默生效。

## 2. "未降智"判定

与主动刷新共用同一张按账号 `plan_type` 查表的精确长度基准（代码 `PLAN_STATE_LENGTHS`，详见[动态代理设计说明](session-keepalive-design.md#4-心跳重写与重试)），不是宽松区间匹配：现网数据证明同一账号在没有其他信号变化的情况下也会在"非降智"与"降智"两个长度之间漂移（例如 Pro 套餐的 292/312），放宽为区间会把已知的降智信号一并放行，因此判定口径保持与主动刷新完全一致——不匹配就跳过，不当作错误处理，也不清除已有的合法票据，只是留一条 `debug` 级别的观测日志供后续标定新套餐。

## 3. 写入时机与节流

业务响应（HTTP 与 WebSocket 共用同一套 `CodexResponseMetadataUpdates` 抽象，因此只需一处挂钩）确认最终 `turn_state` 后，若全局与账号开关均命中、且该请求所在的租约允许写回账号状态（`allows_account_state_mutation`，与用量统计、限流观测等既有的账号状态写入共用同一判断），则调用 `SessionManager::observe_passive_state`：

1. 复用 `passive_managed()` 校验账号开关与模型范围（与主动刷新的 `managed()` 完全独立，互不影响 fail-open/fail-closed 语义）。
2. 复用共享的 `valid_state()` 按 `plan_type` 校验长度与前缀；不匹配则记录观测并跳过。
3. 若已有票据仍新鲜（未临近 `REFRESH_BEFORE_SECONDS`），跳过写入，避免每次业务响应都触发一次 Redis 写入。
4. 通过 `CodexCredentialRepository::load_runtime_credential` 重新获取一次完整凭据用于计算 `credential_binding`——不能复用业务 `lease` 里拆分出来的鉴权字段，因为 `lease` 不携带 `principal`，直接复用会导致与主动刷新写入的绑定哈希公式不一致，破坏凭据变更检测。
5. 写入 `ProviderSessionTicket`，`source` 标记为 `PassiveObservation`，`expires_at = now + 3600`，其余字段（`credential_revision`、`credential_binding`）与主动刷新写入的票据完全同构，读取侧（`load_ticket`/`available`/`rewrite`）无需区分来源。

被动写入不做主动刷新那种代次（generation）/互斥锁校验：这是绑定单次已完成请求的即时操作，`account`/凭据本来就是当次请求的最新值，不存在多秒探测期间配置中途变化需要取消的顾虑。

## 4. 业务请求覆盖

`SessionManager::rewrite()` 未被主动刷新接管时，若被动捕获对该账号+模型生效：有可用票据就覆盖 State（与主动刷新同一段 Header/WS metadata 写入逻辑），没有可用票据就原样放行，返回值恒为 `true`，绝不导致该次业务请求被拒绝或该账号在选号阶段被排除。`available()`（选号阶段的 fail-closed 判断）不读取被动捕获开关，只服务主动刷新。

## 5. 数据模型

- 迁移 `0021_passive_state_capture.sql`：`runtime_settings.passive_state_capture_enabled`、`provider_accounts.enable_passive_state_capture`，均默认 `false`，不新增代理相关列，不新增模型清单列。
- `ProviderSessionTicket` 增加 `source: TicketSource`（`ActiveProbe` / `PassiveObservation`），`#[serde(default)]` 保证 Redis 中的历史票据（全部来自主动刷新）按 `ActiveProbe` 解释。`source` 只用于内部审计区分，不出现在任何管理接口或响应中。

完整 wire 合同见 [API 文档](api.md#被动捕获)。
