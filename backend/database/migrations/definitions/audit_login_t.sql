CREATE TABLE audit_login_t (
    id BIGSERIAL PRIMARY KEY,
    event VARCHAR(32) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    username VARCHAR(255) NOT NULL,
    user_id BIGINT,
    failure_reason VARCHAR(64),
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    remember_me BOOLEAN,
    device_key VARCHAR(128),
    personal_access_token_id BIGINT,
    attempted_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT audit_login_t_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX audit_login_t_attempted_at_index ON audit_login_t (attempted_at DESC);
CREATE INDEX audit_login_t_username_index ON audit_login_t (username);
CREATE INDEX audit_login_t_user_id_index ON audit_login_t (user_id);
CREATE INDEX audit_login_t_event_index ON audit_login_t (event);
CREATE INDEX audit_login_t_success_index ON audit_login_t (success);
