# v3.12.1-exp.4

## 实验说明

本版本以 upstream `v3.12.1` 为正式版基线，保留本 fork 的 Codex State 重写能力与上游传输策略实验。本次新增「被动捕获 State」实验能力。实验功能仍需结合实际使用验证，不保证改善模型质量，也不承诺进入主版本。

## 本次变化

- 新增「被动捕获 State」：不发送任何探针，仅从真实业务响应里读取已经合法的 State 并在有效期内复用给同账号同模型的后续请求。缺票时按原样放行（fail-open），不拒绝、不阻塞业务请求，也不依赖动态代理。
- 被动捕获与原有「State 重写」完全独立：全局开关与账号开关各自一套，两者可单独启用；同时启用时以 State 重写的 fail-closed 规则为准。
- 被动捕获默认关闭。需要在「系统设置」开启全局开关，并在账号编辑中单独开启对应账号，两者都开启后才会生效。
- 账号的模型清单由两种模式共用，字段名称与说明改为中性描述，并按实际启用的模式显示行为说明。
- 修复被动捕获在正常完成的业务响应上不触发的问题：捕获时机与终态事件判定对齐，HTTP/SSE 与 WebSocket 两条路径都会在流内完成捕获。
- 修复两个全局开关未彼此隔离的问题：关闭全局 State 重写后，账号级开关不再因缺票拒绝请求；关闭全局被动捕获后，账号级开关不再覆盖 State。
- 修复仅启用被动捕获的账号在 Cookie 更新（凭据 revision 变化）后无法复用既有票据的问题；凭据通用校验与主动保活资格判定已拆分。
- 修复 Windows 签出（`core.autocrlf=true`）导致迁移文件行尾变为 CRLF、sqlx 校验和不匹配而拒绝启动的问题，构建期统一归一化为 LF。

## 安装与使用

```bash
docker pull ghcr.io/lemonyangzw/codex-proxy-rs:3.12.1-exp.4
```

- Docker 镜像支持 Linux amd64、arm64；二进制归档提供 Linux amd64、Linux arm64、macOS arm64，并包含管理端静态资源。
- 已有实例升级时保留原有 Compose 文件组合、端口、凭据和数据目录，仅将应用镜像更新为本版本；实验版与正式实例应使用独立目录、配置和数据。
- 原有 State 重写开关、账号模型配置和上游传输选择保持原值，升级后行为不变；被动捕获需要手动开启。
- 使用范围及限制见 [State 重写说明](https://github.com/LemonYangZW/codex-proxy-rs/blob/v3.12.1-exp.4/docs/session-keepalive-design.md) 与 [被动捕获说明](https://github.com/LemonYangZW/codex-proxy-rs/blob/v3.12.1-exp.4/docs/passive-state-capture-design.md)。

归档提供 SHA-256 校验和及 GitHub 构建产物证明；镜像附带 SBOM、构建来源证明和签名。

## 升级与使用须知

- 本版本新增数据库迁移 `0021_passive_state_capture.sql`，为 `runtime_settings` 与 `provider_accounts` 各增加一个布尔列，默认值均为 `false`。从未运行该迁移的实例会在监听请求前自动执行，既有数据不受影响，升级后被动捕获保持关闭。
- 从 `v3.12.1-exp.3` 升级时保留实验线已有的 `0017`～`0020` 迁移。实验库不能原地降级到稳定版；回退请改用升级前的镜像，并按迁移状态核对兼容性，不要修改已应用迁移的 checksum 绕过校验。
- 升级前备份数据库、部署配置与应用数据，并保留 `3.12.1-exp.3` 镜像。
- 仍是单进程、单副本实验构建。State 重写会发起真实上游探测，可能消耗额度；被动捕获不会产生额外上游请求。
- State 票据保存在该实验实例的 Redis 中，TTL 为 60 分钟；Redis 数据丢失需要重新获取。被动捕获在缺票时不阻塞请求。
- 本版本为 Pre-release，不设为 GitHub Latest，也不覆盖 Docker `latest`。
