CREATE MATERIALIZED VIEW jamaah_kategori_umur_mv AS
SELECT
    kategori_umur,
    COALESCE(wilayah_fung_kelompok_id, 0) AS wilayah_fung_kelompok_id,
    COALESCE(wilayah_fung_desa_id, 0) AS wilayah_fung_desa_id,
    COALESCE(wilayah_fung_daerah_id, 0) AS wilayah_fung_daerah_id,
    COALESCE(wilayah_fung_pusat_id, 0) AS wilayah_fung_pusat_id,
    COUNT(*)::bigint AS total
FROM jamaah_wilayah_v
WHERE status = 'aktif'
  AND kategori_umur IS NOT NULL
GROUP BY kategori_umur, COALESCE(wilayah_fung_kelompok_id, 0), COALESCE(wilayah_fung_desa_id, 0), COALESCE(wilayah_fung_daerah_id, 0), COALESCE(wilayah_fung_pusat_id, 0);

CREATE UNIQUE INDEX jamaah_kategori_umur_mv_uidx
    ON jamaah_kategori_umur_mv (kategori_umur, wilayah_fung_kelompok_id, wilayah_fung_desa_id, wilayah_fung_daerah_id, wilayah_fung_pusat_id);

REFRESH MATERIALIZED VIEW jamaah_kategori_umur_mv;
