CREATE TABLE kegiatan_t (
    id BIGSERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    pemateri VARCHAR(255),
    pemateri_id BIGINT,
    jenis VARCHAR(255),
    kategori_kegiatan_id BIGINT,
    tanggal DATE NOT NULL,
    jam_mulai TIME(0) WITHOUT TIME ZONE,
    jam_selesai TIME(0) WITHOUT TIME ZONE,
    lokasi VARCHAR(255),
    lokasi_id BIGINT,
    deskripsi TEXT,
    catatan TEXT,
    status VARCHAR(255) NOT NULL DEFAULT 'planned',
    jadwal_rutin_id BIGINT,
    wilayah_fung_daerah_id BIGINT,
    wilayah_fung_desa_id BIGINT,
    wilayah_fung_kelompok_id BIGINT,
    created_at TIMESTAMP(0) WITHOUT TIME ZONE,
    updated_at TIMESTAMP(0) WITHOUT TIME ZONE,
    CONSTRAINT kegiatan_t_pemateri_id_foreign
        FOREIGN KEY (pemateri_id) REFERENCES pemateri_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_t_kategori_kegiatan_id_foreign
        FOREIGN KEY (kategori_kegiatan_id) REFERENCES kategori_kegiatan_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_t_lokasi_id_foreign
        FOREIGN KEY (lokasi_id) REFERENCES lokasi_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_t_jadwal_rutin_id_foreign
        FOREIGN KEY (jadwal_rutin_id) REFERENCES kegiatan_jadwal_rutin_t (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_t_wilayah_fung_daerah_id_foreign
        FOREIGN KEY (wilayah_fung_daerah_id) REFERENCES wilayah_fung_daerah_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_t_wilayah_fung_desa_id_foreign
        FOREIGN KEY (wilayah_fung_desa_id) REFERENCES wilayah_fung_desa_m (id) ON DELETE SET NULL,
    CONSTRAINT kegiatan_t_wilayah_fung_kelompok_id_foreign
        FOREIGN KEY (wilayah_fung_kelompok_id) REFERENCES wilayah_fung_kelompok_m (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX kegiatan_t_jadwal_rutin_id_tanggal_unique
    ON kegiatan_t (jadwal_rutin_id, tanggal);
CREATE INDEX kegiatan_t_status_tanggal_index ON kegiatan_t (status, tanggal);
CREATE INDEX kegiatan_t_wilayah_fung_daerah_id_wilayah_fung_desa_id_wilayah_fung_kelompok_id_tanggal_index
    ON kegiatan_t (wilayah_fung_daerah_id, wilayah_fung_desa_id, wilayah_fung_kelompok_id, tanggal);
CREATE INDEX kegiatan_t_tanggal_kategori_idx ON kegiatan_t (tanggal, kategori_kegiatan_id);
CREATE INDEX kegiatan_t_tanggal_status_idx ON kegiatan_t (tanggal, status);
