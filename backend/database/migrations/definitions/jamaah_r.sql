CREATE TABLE jamaah_r (
    id BIGSERIAL PRIMARY KEY,
    wilayah_fung_kelompok_id BIGINT,
    wilayah_adm_desa_id BIGINT,
    nik VARCHAR(255),
    nama VARCHAR(255) NOT NULL,
    gender VARCHAR(1) NOT NULL,
    tanggal_lahir DATE,
    kategori_umur VARCHAR(32),
    pekerjaan VARCHAR(100),
    pekerjaan_id INTEGER,
    pendidikan VARCHAR(50),
    golongan_darah VARCHAR(20),
    status_pernikahan VARCHAR(32),
    alamat TEXT,
    rt VARCHAR(255),
    rw VARCHAR(255),
    kode_pos VARCHAR(10),
    no_hp VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(255) NOT NULL DEFAULT 'aktif',
    foto_path VARCHAR(255),
    face_descriptor JSONB,
    enrolled_at TIMESTAMP(0) WITHOUT TIME ZONE,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    deleted_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT jamaah_r_wilayah_fung_kelompok_id_foreign
        FOREIGN KEY (wilayah_fung_kelompok_id) REFERENCES wilayah_fung_kelompok_m (id) ON DELETE RESTRICT,
    CONSTRAINT jamaah_r_wilayah_adm_desa_id_foreign
        FOREIGN KEY (wilayah_adm_desa_id) REFERENCES wilayah_adm_desa_m (id) ON DELETE SET NULL,
    CONSTRAINT jamaah_r_pekerjaan_id_foreign
        FOREIGN KEY (pekerjaan_id) REFERENCES lookup_m (lookup_id) ON DELETE SET NULL
);

CREATE INDEX jamaah_r_kategori_umur_index ON jamaah_r (kategori_umur);
CREATE INDEX jamaah_r_status_pernikahan_index ON jamaah_r (status_pernikahan);
CREATE INDEX jamaah_r_kode_pos_index ON jamaah_r (kode_pos);
CREATE INDEX jamaah_r_status_index ON jamaah_r (status);
CREATE INDEX jamaah_r_wilayah_fung_kelompok_id_index ON jamaah_r (wilayah_fung_kelompok_id);
CREATE INDEX jamaah_r_wilayah_adm_desa_id_index ON jamaah_r (wilayah_adm_desa_id);

CREATE UNIQUE INDEX jamaah_r_nik_active_unique
    ON jamaah_r (nik) WHERE deleted_at IS NULL AND nik IS NOT NULL;
CREATE UNIQUE INDEX jamaah_r_no_hp_active_unique
    ON jamaah_r (no_hp)
    WHERE deleted_at IS NULL AND no_hp IS NOT NULL AND no_hp <> '';
CREATE UNIQUE INDEX jamaah_r_email_active_unique
    ON jamaah_r (email)
    WHERE deleted_at IS NULL AND email IS NOT NULL AND email <> '';

CREATE INDEX jamaah_r_status_wilayah_fung_kelompok_idx ON jamaah_r (status, wilayah_fung_kelompok_id);
CREATE INDEX jamaah_r_status_kategori_umur_idx ON jamaah_r (status, kategori_umur);
