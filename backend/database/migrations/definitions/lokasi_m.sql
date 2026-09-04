CREATE TABLE lokasi_m (
    id BIGSERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    jenis VARCHAR(32) NOT NULL DEFAULT 'masjid',
    kota VARCHAR(100),
    wilayah_adm_desa_id BIGINT,
    alamat TEXT,
    lat DECIMAL(10, 7),
    lng DECIMAL(10, 7),
    maps_place_id VARCHAR(120),
    maps_place_name VARCHAR(255),
    maps_url TEXT,
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT lokasi_m_wilayah_adm_desa_id_foreign
        FOREIGN KEY (wilayah_adm_desa_id) REFERENCES wilayah_adm_desa_m (id) ON DELETE SET NULL
);

CREATE INDEX lokasi_m_jenis_is_active_index ON lokasi_m (jenis, is_active);
CREATE INDEX lokasi_m_kota_index ON lokasi_m (kota);
