-- 上游 turn-state 令牌的密文字节数；用于用量页按长度启发式提示疑似降智请求。
-- 令牌本体从不落库；历史记录无此事实，不做回填。
alter table model_requests
    add column turn_state_bytes bigint
        check (turn_state_bytes between 1 and 8192);
