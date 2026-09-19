-- 普通 OpenAI 请求默认跟随客户端传输，可在上游设置中显式启用 WS 优先。
alter table runtime_settings
    add column openai_prefer_websocket boolean not null default false;
