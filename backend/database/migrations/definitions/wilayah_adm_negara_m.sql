CREATE TABLE wilayah_adm_negara_m (
    id BIGSERIAL PRIMARY KEY,
    kode VARCHAR(8) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    iso3 VARCHAR(3),
    singkatan VARCHAR(8),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);

CREATE UNIQUE INDEX wilayah_adm_negara_m_kode_unique ON wilayah_adm_negara_m (kode);
CREATE UNIQUE INDEX wilayah_adm_negara_m_singkatan_unique
    ON wilayah_adm_negara_m (singkatan)
    WHERE singkatan IS NOT NULL;
