CREATE TABLE jamaah_keluarga_mp (
    id BIGSERIAL PRIMARY KEY,
    keluarga_id BIGINT NOT NULL,
    jamaah_id BIGINT NOT NULL,
    hubungan_keluarga VARCHAR(32) NOT NULL,
    is_kepala_keluarga BOOLEAN NOT NULL DEFAULT FALSE,
    catatan TEXT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT jamaah_keluarga_mp_keluarga_id_foreign
        FOREIGN KEY (keluarga_id) REFERENCES keluarga_r (id) ON DELETE CASCADE,
    CONSTRAINT jamaah_keluarga_mp_jamaah_id_foreign
        FOREIGN KEY (jamaah_id) REFERENCES jamaah_r (id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX jamaah_keluarga_mp_jamaah_id_unique ON jamaah_keluarga_mp (jamaah_id);
CREATE UNIQUE INDEX jamaah_keluarga_mp_keluarga_id_jamaah_id_unique
    ON jamaah_keluarga_mp (keluarga_id, jamaah_id);
CREATE INDEX jamaah_keluarga_mp_keluarga_id_is_kepala_keluarga_index
    ON jamaah_keluarga_mp (keluarga_id, is_kepala_keluarga);
