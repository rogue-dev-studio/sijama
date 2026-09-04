CREATE TABLE pemateri_m (
    id BIGSERIAL PRIMARY KEY,
    jamaah_id BIGINT,
    nama VARCHAR(255) NOT NULL,
    kontak VARCHAR(50),
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT pemateri_m_jamaah_id_foreign
        FOREIGN KEY (jamaah_id) REFERENCES jamaah_r (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX pemateri_m_jamaah_id_unique ON pemateri_m (jamaah_id);
