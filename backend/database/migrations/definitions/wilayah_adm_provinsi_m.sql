CREATE TABLE wilayah_adm_provinsi_m (
    id BIGSERIAL PRIMARY KEY,
    wilayah_adm_negara_id BIGINT NOT NULL,
    kode VARCHAR(8) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    singkatan VARCHAR(8),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT wilayah_adm_provinsi_m_wilayah_adm_negara_id_foreign
        FOREIGN KEY (wilayah_adm_negara_id) REFERENCES wilayah_adm_negara_m (id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX wilayah_adm_provinsi_m_kode_unique ON wilayah_adm_provinsi_m (kode);
CREATE UNIQUE INDEX wilayah_adm_provinsi_m_singkatan_unique
    ON wilayah_adm_provinsi_m (singkatan)
    WHERE singkatan IS NOT NULL;
CREATE INDEX wilayah_adm_provinsi_m_wilayah_adm_negara_id_index ON wilayah_adm_provinsi_m (wilayah_adm_negara_id);
