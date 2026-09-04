CREATE TABLE wilayah_adm_kabupaten_kota_m (
    id BIGSERIAL PRIMARY KEY,
    wilayah_adm_provinsi_id BIGINT NOT NULL,
    kode VARCHAR(16) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    jenis VARCHAR(16) NOT NULL,
    singkatan VARCHAR(3),
    singkatan_kawasan_metropolitan VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT wilayah_adm_kabupaten_kota_m_wilayah_adm_provinsi_id_foreign
        FOREIGN KEY (wilayah_adm_provinsi_id) REFERENCES wilayah_adm_provinsi_m (id) ON DELETE RESTRICT,
    CONSTRAINT wilayah_adm_kabupaten_kota_m_jenis_check
        CHECK (jenis IN ('kabupaten', 'kota'))
);

CREATE UNIQUE INDEX wilayah_adm_kabupaten_kota_m_kode_unique ON wilayah_adm_kabupaten_kota_m (kode);
CREATE INDEX wilayah_adm_kabupaten_kota_m_singkatan_index
    ON wilayah_adm_kabupaten_kota_m (singkatan)
    WHERE singkatan IS NOT NULL;
CREATE INDEX wilayah_adm_kabupaten_kota_m_wilayah_adm_provinsi_id_index
    ON wilayah_adm_kabupaten_kota_m (wilayah_adm_provinsi_id);
CREATE INDEX wilayah_adm_kabupaten_kota_m_jenis_index ON wilayah_adm_kabupaten_kota_m (jenis);
CREATE INDEX wilayah_adm_kabupaten_kota_m_singkatan_kawasan_metropolitan_index
    ON wilayah_adm_kabupaten_kota_m (singkatan_kawasan_metropolitan)
    WHERE singkatan_kawasan_metropolitan IS NOT NULL;
