CREATE TABLE menu_m (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT,
    slug VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    path VARCHAR(255),
    icon VARCHAR(255),
    urutan INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT menu_m_parent_id_foreign
        FOREIGN KEY (parent_id) REFERENCES menu_m (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX menu_m_slug_unique ON menu_m (slug);
CREATE INDEX menu_m_parent_id_index ON menu_m (parent_id);
