CREATE TABLE fitur_m (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL,
    slug VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT fitur_m_menu_id_foreign
        FOREIGN KEY (menu_id) REFERENCES menu_m (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX fitur_m_slug_unique ON fitur_m (slug);
CREATE INDEX fitur_m_menu_id_index ON fitur_m (menu_id);
