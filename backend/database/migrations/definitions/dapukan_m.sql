CREATE TABLE dapukan_m (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tingkat VARCHAR(255),
    urutan INTEGER NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);

CREATE UNIQUE INDEX dapukan_m_slug_unique ON dapukan_m (slug);
