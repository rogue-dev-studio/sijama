CREATE MATERIALIZED VIEW absensi_harian_stats_mv AS
SELECT
    a.recorded_at::date AS hari,
    COALESCE(j.kategori_umur, '') AS kategori_umur,
    COALESCE(j.wilayah_fung_kelompok_id, 0) AS wilayah_fung_kelompok_id,
    COALESCE(d.id, 0) AS wilayah_fung_desa_id,
    COALESCE(dr.id, 0) AS wilayah_fung_daerah_id,
    COALESCE(dr.wilayah_fung_pusat_id, 0) AS wilayah_fung_pusat_id,
    COUNT(*)::bigint AS total
FROM absensi_t a
INNER JOIN jamaah_r j ON j.id = a.jamaah_id AND j.deleted_at IS NULL
INNER JOIN wilayah_fung_kelompok_m k ON k.id = j.wilayah_fung_kelompok_id
INNER JOIN wilayah_fung_desa_m d ON d.id = k.wilayah_fung_desa_id
INNER JOIN wilayah_fung_daerah_m dr ON dr.id = d.wilayah_fung_daerah_id
GROUP BY a.recorded_at::date, COALESCE(j.kategori_umur, ''), COALESCE(j.wilayah_fung_kelompok_id, 0), COALESCE(d.id, 0), COALESCE(dr.id, 0), COALESCE(dr.wilayah_fung_pusat_id, 0);

CREATE UNIQUE INDEX absensi_harian_stats_mv_uidx
    ON absensi_harian_stats_mv (hari, kategori_umur, wilayah_fung_kelompok_id, wilayah_fung_desa_id, wilayah_fung_daerah_id, wilayah_fung_pusat_id);

REFRESH MATERIALIZED VIEW absensi_harian_stats_mv;
