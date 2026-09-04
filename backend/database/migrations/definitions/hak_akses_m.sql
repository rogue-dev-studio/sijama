CREATE TABLE hak_akses_m (
    id BIGSERIAL PRIMARY KEY,
    fitur_id BIGINT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    aksi VARCHAR(255) NOT NULL,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT hak_akses_m_fitur_id_foreign
        FOREIGN KEY (fitur_id) REFERENCES fitur_m (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX hak_akses_m_slug_unique ON hak_akses_m (slug);
CREATE INDEX hak_akses_m_fitur_id_index ON hak_akses_m (fitur_id);
