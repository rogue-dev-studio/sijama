CREATE TABLE trusted_admin_device_r (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    device_key VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    last_seen_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT trusted_admin_device_r_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX trusted_admin_device_r_user_id_device_key_unique
    ON trusted_admin_device_r (user_id, device_key);
CREATE INDEX trusted_admin_device_r_ip_address_last_seen_at_index
    ON trusted_admin_device_r (ip_address, last_seen_at);
CREATE INDEX trusted_admin_device_r_device_key_index ON trusted_admin_device_r (device_key);
