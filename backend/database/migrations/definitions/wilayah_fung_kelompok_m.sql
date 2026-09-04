CREATE TABLE wilayah_fung_kelompok_m (
    id BIGSERIAL PRIMARY KEY,
    wilayah_fung_desa_id BIGINT NOT NULL,
    kode VARCHAR(255),
    nama VARCHAR(255) NOT NULL,
    singkatan VARCHAR(8),
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT wilayah_fung_kelompok_m_wilayah_fung_desa_id_foreign
        FOREIGN KEY (wilayah_fung_desa_id) REFERENCES wilayah_fung_desa_m (id) ON DELETE RESTRICT
);

CREATE INDEX wilayah_fung_kelompok_m_wilayah_fung_desa_id_index ON wilayah_fung_kelompok_m (wilayah_fung_desa_id);
CREATE INDEX wilayah_fung_kelompok_m_singkatan_index
    ON wilayah_fung_kelompok_m (singkatan)
    WHERE singkatan IS NOT NULL;
