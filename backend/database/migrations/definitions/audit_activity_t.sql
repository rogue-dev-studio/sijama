CREATE TABLE audit_activity_t (
    id BIGSERIAL PRIMARY KEY,
    module VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id BIGINT,
    entity_label VARCHAR(255),
    actor_user_id BIGINT,
    actor_username VARCHAR(255),
    summary TEXT NOT NULL,
    meta TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    occurred_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT audit_activity_t_actor_user_id_foreign
        FOREIGN KEY (actor_user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX audit_activity_t_occurred_at_index ON audit_activity_t (occurred_at DESC);
CREATE INDEX audit_activity_t_module_index ON audit_activity_t (module);
CREATE INDEX audit_activity_t_action_index ON audit_activity_t (action);
CREATE INDEX audit_activity_t_entity_type_index ON audit_activity_t (entity_type);
CREATE INDEX audit_activity_t_actor_user_id_index ON audit_activity_t (actor_user_id);
