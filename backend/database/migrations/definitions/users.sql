CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(64) NOT NULL,
    email VARCHAR(255),
    email_verified_at TIMESTAMP(0) WITHOUT TIME ZONE,
    password VARCHAR(255) NOT NULL,
    dapukan_id BIGINT,
    jamaah_id BIGINT,
    wilayah_fung_pusat_id BIGINT,
    wilayah_fung_daerah_id BIGINT,
    wilayah_fung_desa_id BIGINT,
    wilayah_fung_kelompok_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    login_remember_minutes INTEGER,
    login_remember_until_logout BOOLEAN NOT NULL DEFAULT FALSE,
    remember_token VARCHAR(100),
    path_tanda_tangan VARCHAR(255),
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE
);

CREATE UNIQUE INDEX users_username_unique ON users (username);
CREATE UNIQUE INDEX users_email_unique ON users (email);
CREATE UNIQUE INDEX users_jamaah_id_unique ON users (jamaah_id);
CREATE INDEX users_is_demo_index ON users (is_demo);
CREATE INDEX users_dapukan_id_index ON users (dapukan_id);
CREATE INDEX users_wilayah_fung_pusat_id_index ON users (wilayah_fung_pusat_id);
CREATE INDEX users_wilayah_fung_daerah_id_index ON users (wilayah_fung_daerah_id);
CREATE INDEX users_wilayah_fung_desa_id_index ON users (wilayah_fung_desa_id);
CREATE INDEX users_wilayah_fung_kelompok_id_index ON users (wilayah_fung_kelompok_id);
