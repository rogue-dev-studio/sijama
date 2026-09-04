CREATE TABLE app_error_log_t (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(16) NOT NULL DEFAULT 'error',
    status VARCHAR(32) NOT NULL DEFAULT 'baru',
    status_note TEXT,
    status_updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    status_updated_by BIGINT,
    exception_class VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    file VARCHAR(512),
    line INTEGER,
    stack_trace TEXT,
    request_method VARCHAR(16),
    request_path VARCHAR(512),
    user_id BIGINT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    occurred_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT app_error_log_t_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT app_error_log_t_status_updated_by_foreign
        FOREIGN KEY (status_updated_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX app_error_log_t_occurred_at_index ON app_error_log_t (occurred_at DESC);
CREATE INDEX app_error_log_t_level_index ON app_error_log_t (level);
CREATE INDEX app_error_log_t_status_index ON app_error_log_t (status);
CREATE INDEX app_error_log_t_exception_class_index ON app_error_log_t (exception_class);
CREATE INDEX app_error_log_t_user_id_index ON app_error_log_t (user_id);
