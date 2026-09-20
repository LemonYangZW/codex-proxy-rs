# v3.12.1-exp.3

## 实验说明

本版本以 upstream `v3.12.1` 为正式版基线，保留本 fork 的 Codex State 重写能力与上游传输策略实验。实验功能仍需结合实际使用验证，不保证改善模型质量，也不承诺进入主版本。

## 本次变化

- 同步 upstream `v3.12.1`：统一 OpenAI 与 xAI 客户端身份配置，补充 xAI 版本与预览请求选项。
- 密钥配置页支持复制 Codex 配置并选择 WebSocket；表格列支持拖动排序、方向键调整及浏览器内保存偏好。
- 修复 OpenAI 账号池额度耗尽时的 `429 / usage_limit_reached` 行为、额度窗口重置后的旧用量显示，以及 Responses 输入和 system 消息的兼容转换。
- 改进密钥名称、长上下文计费标识、主题对比度和用量页面布局，并更新 OpenAI TLS 依赖。
- 普通 OpenAI Responses 请求默认跟随客户端传输：HTTP 请求使用 HTTP/SSE，WebSocket 请求优先使用上游 WS；可在「系统设置 → 上游配置 → OpenAI 上游传输」切换为「WS 优先」。
- 保留显式传输选择、HTTP-only 账号限制、必须使用 WS 的续写要求和原有 HTTP 回退边界；API Key 账号需要配置 `prefer_websocket` 才允许选择 WS。
- 更新器按发行线筛选可用版本，实验版只接收同一轮实验的后续版本。
- 修复跨平台构建中的 Unix 文件权限扩展导入问题，确保 Linux amd64、arm64 和 macOS arm64 构建均可通过 CI。
- 对齐 upstream 的 Responses 字符串 `input` 消息数组规范，并补充同一会话在 HTTP、WebSocket 间切换时的回归覆盖。

## 安装与使用

```bash
docker pull ghcr.io/lemonyangzw/codex-proxy-rs:3.12.1-exp.3
```

- Docker 镜像支持 Linux amd64、arm64；二进制归档提供 Linux amd64、Linux arm64、macOS arm64，并包含管理端静态资源。
- 已有实例升级时保留原有 Compose 文件组合、端口、凭据和数据目录，仅将应用镜像更新为本版本；实验版与正式实例应使用独立目录、配置和数据。
- 上游传输默认「跟随客户端」。需要让普通 HTTP 请求也优先尝试上游 WS 时，升级后在设置页选择「WS 优先」并保存。
- 原有 State 重写开关与账号模型配置保持原值；使用范围及限制见 [State 重写说明](https://github.com/LemonYangZW/codex-proxy-rs/blob/v3.12.1-exp.3/docs/session-keepalive-design.md)。

归档提供 SHA-256 校验和及 GitHub 构建产物证明；镜像附带 SBOM、构建来源证明和签名。

## 升级与使用须知

- 从 `v3.11.0-exp.3` 升级时保留实验线已有的 `0017`～`0020` 数据库迁移；从未运行实验迁移的实例会在监听请求前自动执行。upstream `v3.12.1` 相对 `v3.11.0` 不新增正式迁移。
- `openai.wire_profile.residency` 应迁移到 `openai.residency`；旧的 `openai.wire_profile` 与 `xai.wire_profile` 不再读取。旧环境变量 `CPR_UPDATE_CHANNEL` 不再参与版本选择。
- 升级前备份数据库、部署配置与应用数据，并保留 `3.11.0-exp.3` 镜像。若需要回退，按迁移状态核对兼容性，必要时恢复升级前备份；不要修改已应用迁移的 checksum 绕过校验。
- 仍是单进程、单副本实验构建。State 重写会发起真实上游探测，可能消耗额度；本次未改变其刷新、票据有效性和请求准入规则。
- 本版本为 Pre-release，不设为 GitHub Latest，也不覆盖 Docker `latest`。这是新的 `v3.12.1` 实验线，升级使用手动部署，不依赖旧实验实例的一键更新。
