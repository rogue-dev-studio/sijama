CREATE TABLE kegiatan_jadwal_rutin_materi_mp (
    kegiatan_jadwal_rutin_id BIGINT NOT NULL,
    materi_id BIGINT NOT NULL,
    PRIMARY KEY (kegiatan_jadwal_rutin_id, materi_id),
    CONSTRAINT kegiatan_jadwal_rutin_materi_mp_kegiatan_jadwal_rutin_id_foreign
        FOREIGN KEY (kegiatan_jadwal_rutin_id) REFERENCES kegiatan_jadwal_rutin_t (id) ON DELETE CASCADE,
    CONSTRAINT kegiatan_jadwal_rutin_materi_mp_materi_id_foreign
        FOREIGN KEY (materi_id) REFERENCES materi_m (id) ON DELETE CASCADE
);
