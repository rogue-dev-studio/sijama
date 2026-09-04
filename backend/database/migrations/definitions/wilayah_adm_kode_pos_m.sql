CREATE TABLE wilayah_adm_kode_pos_m (
    id BIGSERIAL PRIMARY KEY,
    kode VARCHAR(10) NOT NULL,
    wilayah_adm_desa_id BIGINT,
    wilayah_adm_kecamatan_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT wilayah_adm_kode_pos_m_wilayah_adm_desa_id_foreign
        FOREIGN KEY (wilayah_adm_desa_id) REFERENCES wilayah_adm_desa_m (id) ON DELETE SET NULL,
    CONSTRAINT wilayah_adm_kode_pos_m_wilayah_adm_kecamatan_id_foreign
        FOREIGN KEY (wilayah_adm_kecamatan_id) REFERENCES wilayah_adm_kecamatan_m (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX wilayah_adm_kode_pos_m_kode_wilayah_adm_desa_id_unique
    ON wilayah_adm_kode_pos_m (kode, wilayah_adm_desa_id);
CREATE INDEX wilayah_adm_kode_pos_m_wilayah_adm_kecamatan_id_index ON wilayah_adm_kode_pos_m (wilayah_adm_kecamatan_id);
CREATE INDEX wilayah_adm_kode_pos_m_kode_index ON wilayah_adm_kode_pos_m (kode);
