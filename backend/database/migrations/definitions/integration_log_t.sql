CREATE TABLE integration_log_t (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    level VARCHAR(16) NOT NULL DEFAULT 'info',
    event_type VARCHAR(48) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    context_json TEXT,
    occurred_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    CONSTRAINT integration_log_t_created_by_foreign
        FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX integration_log_t_occurred_at_index ON integration_log_t (occurred_at DESC);
CREATE INDEX integration_log_t_provider_index ON integration_log_t (provider);
CREATE INDEX integration_log_t_level_index ON integration_log_t (level);
CREATE INDEX integration_log_t_event_type_index ON integration_log_t (event_type);
CREATE INDEX integration_log_t_created_by_index ON integration_log_t (created_by);
