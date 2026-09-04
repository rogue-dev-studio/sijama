CREATE OR REPLACE FUNCTION refresh_reporting_fn()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY jamaah_kelompok_aktif_mv;
    REFRESH MATERIALIZED VIEW CONCURRENTLY jamaah_kategori_umur_mv;
    REFRESH MATERIALIZED VIEW CONCURRENTLY absensi_harian_stats_mv;
END;
$$;
