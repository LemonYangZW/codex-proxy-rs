ALTER TABLE runtime_settings
    ADD COLUMN session_keepalive_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- 全局与账号保活默认关闭，模型选择直接使用完整上游 ID。
ALTER TABLE provider_accounts
    ADD COLUMN enable_session_keepalive BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN session_keepalive_models TEXT[] NOT NULL DEFAULT ARRAY['gpt-5.6-sol', 'gpt-6-astra'];

-- 动态代理仅供重写；唯一索引防止并发创建第二个全局出口。
ALTER TABLE outbound_proxies
    ADD COLUMN is_dynamic BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX outbound_proxies_single_dynamic ON outbound_proxies (is_dynamic) WHERE is_dynamic;
