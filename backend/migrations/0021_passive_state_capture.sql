-- 被动捕获与动态代理主动刷新（session keepalive）完全独立：不依赖动态代理，
-- 从真实业务响应里读取已合法的 State，fail-open，开关与风险确认单独维护。
alter table runtime_settings
    add column passive_state_capture_enabled boolean not null default false;
alter table provider_accounts
    add column enable_passive_state_capture boolean not null default false;
