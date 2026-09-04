CREATE TABLE jamaah_dapukan_mp (
    id BIGSERIAL PRIMARY KEY,
    jamaah_id BIGINT NOT NULL,
    dapukan_id BIGINT NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT jamaah_dapukan_mp_jamaah_id_foreign
        FOREIGN KEY (jamaah_id) REFERENCES jamaah_r (id) ON DELETE CASCADE,
    CONSTRAINT jamaah_dapukan_mp_dapukan_id_foreign
        FOREIGN KEY (dapukan_id) REFERENCES dapukan_m (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX jamaah_dapukan_mp_jamaah_id_dapukan_id_unique
    ON jamaah_dapukan_mp (jamaah_id, dapukan_id);
