CREATE TABLE wilayah_adm_desa_m (
    id BIGSERIAL PRIMARY KEY,
    wilayah_adm_kecamatan_id BIGINT NOT NULL,
    kode VARCHAR(32) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    jenis VARCHAR(16) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT wilayah_adm_desa_m_wilayah_adm_kecamatan_id_foreign
        FOREIGN KEY (wilayah_adm_kecamatan_id) REFERENCES wilayah_adm_kecamatan_m (id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX wilayah_adm_desa_m_kode_unique ON wilayah_adm_desa_m (kode);
CREATE INDEX wilayah_adm_desa_m_wilayah_adm_kecamatan_id_index ON wilayah_adm_desa_m (wilayah_adm_kecamatan_id);
CREATE INDEX wilayah_adm_desa_m_jenis_index ON wilayah_adm_desa_m (jenis);
