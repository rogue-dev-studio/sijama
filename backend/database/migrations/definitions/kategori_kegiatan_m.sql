CREATE TABLE kategori_kegiatan_m (
    id BIGSERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    calendar_color VARCHAR(7) NOT NULL DEFAULT '#2563eb',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);
