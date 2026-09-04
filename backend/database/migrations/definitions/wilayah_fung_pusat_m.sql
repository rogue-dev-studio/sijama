CREATE TABLE wilayah_fung_pusat_m (
    id BIGSERIAL PRIMARY KEY,
    kode VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    singkatan VARCHAR(8),
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);

CREATE UNIQUE INDEX wilayah_fung_pusat_m_kode_unique ON wilayah_fung_pusat_m (kode);
CREATE INDEX wilayah_fung_pusat_m_singkatan_index
    ON wilayah_fung_pusat_m (singkatan)
    WHERE singkatan IS NOT NULL;
