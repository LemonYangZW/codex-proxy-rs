# v3.11.0-exp.3

## 实验说明

本版本基于本 fork 的 `v3.11.0-exp.2`，保留现有 Codex State 重写实验能力，新增可切换的 OpenAI 上游传输策略。实验功能仍需结合实际使用验证，不保证改善模型质量。

## 本次变化

- 普通 OpenAI Responses 请求默认跟随本次客户端连接：HTTP 请求使用 HTTP/SSE，WebSocket 请求优先使用上游 WS。已有 WS 连接或账号支持 WS 不再自动把后续 HTTP 请求升级为 WS。
- 在「系统设置 → 上游配置 → OpenAI 上游传输」增加「跟随客户端 / WS 优先」切换。选择 WS 优先后，普通 HTTP 请求也会优先尝试上游 WS；点击「保存基础设置」后对后续请求生效，无需重启，正在执行的请求与内部重试保留原策略。
- 保留请求的显式传输选择、HTTP-only 账号限制、必须使用 WS 的续写要求及原有 HTTP 回退边界。API Key 账号需要配置 `prefer_websocket` 才允许选择 WS。
- 使用记录与诊断区分 WebSocket 传输下的 turn-state 缺失和无法判断的情况，减少把不同传输产生的数据差异混为一谈。
- 切换控件支持键盘操作、撤销、加载失败保护和窄屏布局；补充设置接口、请求快照及真实 HTTP/WS 连接选择的回归测试。

## 安装与使用

```bash
docker pull ghcr.io/lemonyangzw/codex-proxy-rs:3.11.0-exp.3
```

- Docker 镜像支持 Linux amd64、arm64；二进制归档提供 Linux amd64、Linux arm64、macOS arm64，包含管理端静态资源。
- 首次安装使用本页附件中的部署文件与配置模板。已有实例保持原有 Compose 文件组合、端口、凭据和数据目录，仅将应用镜像更新为本版本。
- 上游传输默认「跟随客户端」。需要维持普通 HTTP 请求也优先尝试上游 WS 的行为时，升级后在设置页选择「WS 优先」并保存。
- 原有 State 重写开关与账号模型配置保持原值；使用范围及限制见 [State 重写说明](https://github.com/LemonYangZW/codex-proxy-rs/blob/v3.11.0-exp.3/docs/session-keepalive-design.md)。

归档提供 SHA-256 校验和及 GitHub 构建产物证明；镜像附带 SBOM、构建来源证明和签名。

## 升级与使用须知

- 从本 fork 的 `v3.11.0-exp.2` 升级时新增迁移 `0020_openai_websocket_preference.sql`，增加默认值为 `false` 的上游 WS 偏好字段；`0001`～`0019` 内容保持不变。应用会在监听请求前自动迁移。
- 升级前备份数据库、部署配置与应用数据，并保留原镜像。若需要回退，按迁移状态核对兼容性，必要时恢复升级前备份；不要修改已应用迁移的 checksum 绕过校验。
- 仍是单进程、单副本实验构建。State 重写会发起真实上游探测，可能消耗额度；本次未改变其刷新、票据有效性和请求准入规则。
- 本版本为 Pre-release，不设为 GitHub Latest，也不覆盖 Docker `latest`。实验构建使用手动升级，不依赖管理端一键更新。
