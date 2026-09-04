CREATE TABLE wilayah_fung_desa_m (
    id BIGSERIAL PRIMARY KEY,
    wilayah_fung_daerah_id BIGINT NOT NULL,
    wilayah_adm_desa_id BIGINT,
    kode VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    singkatan VARCHAR(8),
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT wilayah_fung_desa_m_wilayah_fung_daerah_id_foreign
        FOREIGN KEY (wilayah_fung_daerah_id) REFERENCES wilayah_fung_daerah_m (id) ON DELETE RESTRICT,
    CONSTRAINT wilayah_fung_desa_m_wilayah_adm_desa_id_foreign
        FOREIGN KEY (wilayah_adm_desa_id) REFERENCES wilayah_adm_desa_m (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX wilayah_fung_desa_m_wilayah_fung_daerah_id_kode_unique ON wilayah_fung_desa_m (wilayah_fung_daerah_id, kode);
CREATE INDEX wilayah_fung_desa_m_wilayah_fung_daerah_id_index ON wilayah_fung_desa_m (wilayah_fung_daerah_id);
CREATE INDEX wilayah_fung_desa_m_singkatan_index
    ON wilayah_fung_desa_m (singkatan)
    WHERE singkatan IS NOT NULL;
