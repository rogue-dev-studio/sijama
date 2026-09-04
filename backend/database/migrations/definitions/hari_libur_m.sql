CREATE TABLE hari_libur_m (
    id BIGSERIAL PRIMARY KEY,
    tanggal DATE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    jenis VARCHAR(32) NOT NULL DEFAULT 'nasional',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);

CREATE UNIQUE INDEX hari_libur_m_tanggal_unique ON hari_libur_m (tanggal);
