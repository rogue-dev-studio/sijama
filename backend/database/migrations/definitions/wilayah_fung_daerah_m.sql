CREATE TABLE wilayah_fung_daerah_m (
    id BIGSERIAL PRIMARY KEY,
    wilayah_fung_pusat_id BIGINT NOT NULL,
    kode VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    singkatan VARCHAR(8),
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT wilayah_fung_daerah_m_wilayah_fung_pusat_id_foreign
        FOREIGN KEY (wilayah_fung_pusat_id) REFERENCES wilayah_fung_pusat_m (id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX wilayah_fung_daerah_m_kode_unique ON wilayah_fung_daerah_m (kode);
CREATE INDEX wilayah_fung_daerah_m_singkatan_index
    ON wilayah_fung_daerah_m (singkatan)
    WHERE singkatan IS NOT NULL;
