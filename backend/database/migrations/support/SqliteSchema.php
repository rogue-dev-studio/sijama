<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 10:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 10:50:00
 */

namespace Database\Migrations\Support;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

final class SqliteSchema
{
    public static function create(string $table): void
    {
        match ($table) {
            'users' => self::createUsers(),
            'password_reset_tokens' => self::createPasswordResetTokens(),
            'sessions' => self::createSessions(),
            'cache' => self::createCache(),
            'cache_locks' => self::createCacheLocks(),
            'jobs' => self::createJobs(),
            'job_batches' => self::createJobBatches(),
            'failed_jobs' => self::createFailedJobs(),
            'personal_access_tokens' => self::createPersonalAccessTokens(),
            'wilayah_adm_negara_m' => self::createAdmNegaraM(),
            'wilayah_adm_provinsi_m' => self::createAdmProvinsiM(),
            'wilayah_adm_kabupaten_kota_m' => self::createAdmKabupatenKotaM(),
            'wilayah_adm_kecamatan_m' => self::createAdmKecamatanM(),
            'wilayah_adm_desa_m' => self::createAdmDesaKelurahanM(),
            'wilayah_adm_kode_pos_m' => self::createAdmKodePosM(),
            'wilayah_fung_pusat_m' => self::createPusatM(),
            'wilayah_fung_daerah_m' => self::createDaerahM(),
            'wilayah_fung_desa_m' => self::createDesaM(),
            'wilayah_fung_kelompok_m' => self::createKelompokM(),
            'wilayah_fung_sub_kelompok_m' => self::createSubKelompokM(),
            'dapukan_m' => self::createDapukanM(),
            'menu_m' => self::createMenuM(),
            'fitur_m' => self::createFiturM(),
            'hak_akses_m' => self::createHakAksesM(),
            'dapukan_hak_akses_mp' => self::createDapukanHakAksesMp(),
            'lookup_m' => self::createLookupM(),
            'konfigsystem_k' => self::createKonfigsystemK(),
            'konfigdokumen_k' => self::createKonfigdokumenK(),
            'jamaah_r' => self::createJamaahR(),
            'jamaah_dapukan_mp' => self::createJamaahDapukanMp(),
            'keluarga_r' => self::createKeluargaR(),
            'jamaah_keluarga_mp' => self::createJamaahKeluargaMp(),
            'lokasi_m' => self::createLokasiM(),
            'pemateri_m' => self::createPemateriM(),
            'materi_m' => self::createMateriM(),
            'kategori_kegiatan_m' => self::createKategoriKegiatanM(),
            'hari_libur_m' => self::createHariLiburM(),
            'kegiatan_jadwal_rutin_t' => self::createKegiatanJadwalRutinT(),
            'kegiatan_t' => self::createKegiatanT(),
            'kegiatan_materi_mp' => self::createKegiatanMateriMp(),
            'kegiatan_jadwal_rutin_materi_mp' => self::createKegiatanJadwalRutinMateriMp(),
            'absensi_sesi_t' => self::createAbsensiSesiT(),
            'absensi_t' => self::createAbsensiT(),
            'password_reset_request_t' => self::createPasswordResetRequestT(),
            'trusted_admin_device_r' => self::createTrustedAdminDeviceR(),
            'audit_login_t' => self::createAuditLoginT(),
            'app_error_log_t' => self::createAppErrorLogT(),
            'integration_log_t' => self::createIntegrationLogT(),
            'audit_activity_t' => self::createAuditActivityT(),
            default => throw new \InvalidArgumentException("Unknown sqlite table definition: {$table}"),
        };
    }

    public static function applyAlter(string $name): void
    {
        throw new \InvalidArgumentException(
            "Alter definitions removed for remigrate baseline. Unknown: {$name}"
        );
    }

    public static function reverseAlter(string $name): void
    {
        throw new \InvalidArgumentException(
            "Alter definitions removed for remigrate baseline. Unknown: {$name}"
        );
    }

    private static function createUsers(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username', 64)->unique();
            $table->string('email')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->unsignedBigInteger('dapukan_id')->nullable()->index();
            $table->unsignedBigInteger('jamaah_id')->nullable()->unique();
            $table->unsignedBigInteger('wilayah_fung_pusat_id')->nullable()->index();
            $table->unsignedBigInteger('wilayah_fung_daerah_id')->nullable()->index();
            $table->unsignedBigInteger('wilayah_fung_desa_id')->nullable()->index();
            $table->unsignedBigInteger('wilayah_fung_kelompok_id')->nullable()->index();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_demo')->default(false);
            $table->unsignedInteger('login_remember_minutes')->nullable();
            $table->boolean('login_remember_until_logout')->default(false);
            $table->rememberToken();
            $table->string('path_tanda_tangan')->nullable();
            $table->timestamps();
            $table->index('is_demo');
        });
    }

    private static function createPasswordResetTokens(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    private static function createSessions(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    private static function createCache(): void
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });
    }

    private static function createCacheLocks(): void
    {
        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    private static function createJobs(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });
    }

    private static function createJobBatches(): void
    {
        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });
    }

    private static function createFailedJobs(): void
    {
        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    private static function createPersonalAccessTokens(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    private static function createAdmNegaraM(): void
    {
        Schema::create('wilayah_adm_negara_m', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 8)->unique();
            $table->string('nama');
            $table->string('iso3', 3)->nullable();
            $table->string('singkatan', 8)->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private static function createAdmProvinsiM(): void
    {
        Schema::create('wilayah_adm_provinsi_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_adm_negara_id')->constrained('wilayah_adm_negara_m')->restrictOnDelete();
            $table->string('kode', 8)->unique();
            $table->string('nama');
            $table->string('singkatan', 8)->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('wilayah_adm_negara_id');
        });
    }

    private static function createAdmKabupatenKotaM(): void
    {
        Schema::create('wilayah_adm_kabupaten_kota_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_adm_provinsi_id')->constrained('wilayah_adm_provinsi_m')->restrictOnDelete();
            $table->string('kode', 16)->unique();
            $table->string('nama');
            $table->string('jenis', 16);
            $table->string('singkatan', 3)->nullable()->index();
            $table->string('singkatan_kawasan_metropolitan', 64)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('wilayah_adm_provinsi_id');
            $table->index('jenis');
            $table->index('singkatan_kawasan_metropolitan');
        });
    }

    private static function createAdmKecamatanM(): void
    {
        Schema::create('wilayah_adm_kecamatan_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_adm_kabupaten_kota_id')->constrained('wilayah_adm_kabupaten_kota_m')->restrictOnDelete();
            $table->string('kode', 24)->unique();
            $table->string('nama');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('wilayah_adm_kabupaten_kota_id');
        });
    }

    private static function createAdmDesaKelurahanM(): void
    {
        Schema::create('wilayah_adm_desa_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_adm_kecamatan_id')->constrained('wilayah_adm_kecamatan_m')->restrictOnDelete();
            $table->string('kode', 32)->unique();
            $table->string('nama');
            $table->string('jenis', 16);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('wilayah_adm_kecamatan_id');
            $table->index('jenis');
        });
    }

    private static function createAdmKodePosM(): void
    {
        Schema::create('wilayah_adm_kode_pos_m', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 10);
            $table->foreignId('wilayah_adm_desa_id')->nullable()->constrained('wilayah_adm_desa_m')->nullOnDelete();
            $table->foreignId('wilayah_adm_kecamatan_id')->nullable()->constrained('wilayah_adm_kecamatan_m')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['kode', 'wilayah_adm_desa_id']);
            $table->index('wilayah_adm_kecamatan_id');
            $table->index('kode');
        });
    }

    private static function createPusatM(): void
    {
        Schema::create('wilayah_fung_pusat_m', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->string('singkatan', 8)->nullable()->index();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private static function createDaerahM(): void
    {
        Schema::create('wilayah_fung_daerah_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_fung_pusat_id')->constrained('wilayah_fung_pusat_m')->restrictOnDelete();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->string('singkatan', 8)->nullable()->index();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private static function createDesaM(): void
    {
        Schema::create('wilayah_fung_desa_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_fung_daerah_id')->constrained('wilayah_fung_daerah_m')->restrictOnDelete();
            $table->foreignId('wilayah_adm_desa_id')
                ->nullable()
                ->constrained('wilayah_adm_desa_m')
                ->nullOnDelete();
            $table->string('kode');
            $table->string('nama');
            $table->string('singkatan', 8)->nullable()->index();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['wilayah_fung_daerah_id', 'kode']);
            $table->index('wilayah_fung_daerah_id');
        });
    }

    private static function createKelompokM(): void
    {
        Schema::create('wilayah_fung_kelompok_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_fung_desa_id')->constrained('wilayah_fung_desa_m')->restrictOnDelete();
            $table->string('kode')->nullable();
            $table->string('nama');
            $table->string('singkatan', 8)->nullable()->index();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('wilayah_fung_desa_id');
        });
    }

    private static function createSubKelompokM(): void
    {
        Schema::create('wilayah_fung_sub_kelompok_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_fung_kelompok_id')->constrained('wilayah_fung_kelompok_m')->cascadeOnDelete();
            $table->string('kode')->nullable();
            $table->string('nama');
            $table->string('singkatan', 8)->nullable()->index();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('wilayah_fung_kelompok_id');
        });
    }

    private static function createDapukanM(): void
    {
        Schema::create('dapukan_m', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->string('tingkat')->nullable();
            $table->integer('urutan')->default(0);
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private static function createMenuM(): void
    {
        Schema::create('menu_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('menu_m')->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('nama');
            $table->string('path')->nullable();
            $table->string('icon')->nullable();
            $table->integer('urutan')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('parent_id');
        });
    }

    private static function createFiturM(): void
    {
        Schema::create('fitur_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('menu_m')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('menu_id');
        });
    }

    private static function createHakAksesM(): void
    {
        Schema::create('hak_akses_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fitur_id')->constrained('fitur_m')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('nama');
            $table->string('aksi');
            $table->timestamps();
            $table->index('fitur_id');
        });
    }

    private static function createDapukanHakAksesMp(): void
    {
        Schema::create('dapukan_hak_akses_mp', function (Blueprint $table) {
            $table->foreignId('dapukan_id')->constrained('dapukan_m')->cascadeOnDelete();
            $table->foreignId('hak_akses_id')->constrained('hak_akses_m')->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['dapukan_id', 'hak_akses_id']);
        });
    }

    private static function createLookupM(): void
    {
        Schema::create('lookup_m', function (Blueprint $table) {
            $table->increments('lookup_id');
            $table->string('lookup_type', 100);
            $table->string('lookup_name', 200)->nullable();
            $table->string('lookup_value', 200)->nullable();
            $table->integer('lookup_urutan')->nullable();
            $table->string('lookup_kode', 50)->nullable();
            $table->text('additional_data')->nullable();
            $table->timestamp('created_date', 6);
            $table->integer('created_by')->nullable();
            $table->integer('modified_count')->nullable();
            $table->timestamp('last_modified_date', 6)->nullable();
            $table->integer('last_modified_by')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('deleted_date', 6)->nullable();
            $table->integer('deleted_by')->nullable();
        });

        Schema::table('lookup_m', function (Blueprint $table) {
            $table->index('lookup_type', 'idx_lookup_type_text');
        });
    }

    private static function createKonfigsystemK(): void
    {
        Schema::create('konfigsystem_k', function (Blueprint $table) {
            $table->increments('konfigsystem_id');
            $table->text('additional_data')->nullable();
            $table->timestamp('created_date', 6);
            $table->integer('created_by')->nullable();
            $table->integer('modified_count')->nullable();
            $table->timestamp('last_modified_date', 6)->nullable();
            $table->integer('last_modified_by')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('deleted_date', 6)->nullable();
            $table->integer('deleted_by')->nullable();
            $table->string('mail_protocol', 50)->nullable();
            $table->string('smtp_hostname', 200)->nullable();
            $table->string('mail_parameter', 255)->nullable();
            $table->string('smtp_username', 200)->nullable();
            $table->string('smtp_password', 255)->nullable();
            $table->integer('smtp_port')->nullable();
            $table->integer('smtp_timeout')->nullable();
            $table->string('smtp_encryption', 20)->nullable();
            $table->string('mail_from_address', 200)->nullable();
            $table->string('mail_from_name', 200)->nullable();
            $table->string('mail_reply_to', 200)->nullable();
            $table->boolean('password_reset_email_enabled')->default(true);
            $table->boolean('password_reset_phone_enabled')->default(false);
            $table->string('sms_driver', 30)->nullable();
            $table->string('sms_country_code', 8)->nullable();
            $table->text('fonnte_token')->nullable();
            $table->string('fonnte_endpoint', 500)->nullable();
            $table->boolean('telegram_enabled')->default(false);
            $table->text('telegram_bot_token')->nullable();
            $table->string('telegram_bot_username', 100)->nullable();
            $table->string('telegram_default_chat_id', 64)->nullable();
            $table->boolean('n8n_enabled')->default(false);
            $table->string('n8n_base_url', 500)->nullable();
            $table->string('n8n_webhook_url', 500)->nullable();
            $table->text('n8n_api_key')->nullable();
            $table->boolean('api_co_id_holiday_enabled')->default(true);
            $table->text('api_co_id_api_key')->nullable();
            $table->string('api_co_id_holiday_base_url', 500)->nullable();
            $table->timestamp('api_co_id_holiday_last_synced_at', 6)->nullable();
            $table->integer('api_co_id_holiday_last_sync_count')->nullable();
            $table->boolean('db_enabled')->default(false);
            $table->string('db_driver', 32)->nullable();
            $table->string('db_project', 120)->nullable();
            $table->string('db_service_name', 120)->nullable();
            $table->string('db_plan', 64)->nullable();
            $table->string('db_region', 120)->nullable();
            $table->string('db_host', 255)->nullable();
            $table->integer('db_port')->nullable();
            $table->string('db_database', 120)->nullable();
            $table->date('db_valid_until')->nullable();
            $table->text('db_notes')->nullable();
            $table->timestamp('db_last_checked_at', 6)->nullable();
            $table->string('db_last_check_status', 32)->nullable();
            $table->text('db_last_check_message')->nullable();
            $table->date('smtp_valid_until')->nullable();
            $table->date('fonnte_valid_until')->nullable();
            $table->date('telegram_valid_until')->nullable();
            $table->date('n8n_valid_until')->nullable();
            $table->date('api_co_id_valid_until')->nullable();
            $table->string('font_family_display', 64)->nullable();
            $table->string('font_family_body', 64)->nullable();
            $table->text('header')->nullable();
            $table->text('footer')->nullable();
            $table->string('website', 500)->nullable();
            $table->string('footer_link', 500)->nullable();
            $table->string('footer_detail', 500)->nullable();
            $table->string('footer_detail_link', 500)->nullable();
            $table->text('header_detail')->nullable();
            $table->string('path_logoheader', 500)->nullable();
            $table->string('app_nama', 200)->nullable();
            $table->string('nama_instansi', 200)->nullable();
            $table->text('alamat')->nullable();
            $table->string('telepon', 50)->nullable();
            $table->string('email_kontak', 200)->nullable();
            $table->string('timezone', 64)->nullable();
            $table->string('locale', 20)->nullable();
            $table->string('path_favicon', 500)->nullable();
            $table->string('path_logofooter', 500)->nullable();
            $table->string('path_background', 500)->nullable();
            $table->string('background_style', 20)->default('cover');
            $table->string('background_repeat_size', 20)->default('28px');
            $table->string('color_bg', 7)->nullable();
            $table->string('color_surface', 7)->nullable();
            $table->string('color_ink', 7)->nullable();
            $table->string('color_accent', 7)->nullable();
            $table->string('color_accent_soft', 7)->nullable();
            $table->string('color_muted', 7)->nullable();
            $table->string('color_border', 7)->nullable();
            $table->string('theme_color', 7)->nullable();
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();
            $table->string('path_maintenance_background', 500)->nullable();
            $table->string('maintenance_background_style', 20)->default('cover');
            $table->string('maintenance_background_repeat_size', 20)->default('28px');
        });

        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->index(['is_active', 'is_deleted'], 'idx_konfigsystem_k_active');
        });
    }

    private static function createKonfigdokumenK(): void
    {
        Schema::create('konfigdokumen_k', function (Blueprint $table) {
            $table->increments('konfigdokumen_id');
            $table->unsignedInteger('lookup_id')->nullable();
            $table->text('additional_data')->nullable();
            $table->timestamp('created_date', 6);
            $table->integer('created_by')->nullable();
            $table->integer('modified_count')->nullable();
            $table->timestamp('last_modified_date', 6)->nullable();
            $table->integer('last_modified_by')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('deleted_date', 6)->nullable();
            $table->integer('deleted_by')->nullable();
            $table->text('header')->nullable();
            $table->text('header_detail')->nullable();
            $table->text('footer')->nullable();
            $table->text('footer_detail')->nullable();
            $table->string('path_logo_kiri', 500)->nullable();
            $table->string('path_logo_kanan', 500)->nullable();
            $table->string('layout_mode', 20)->default('kop_ganda');
            $table->json('header_style')->nullable();
            $table->string('paper_size', 20)->default('a4');
            $table->string('paper_orientation', 20)->default('portrait');
            $table->boolean('apply_pdf')->default(true);
            $table->boolean('apply_excel')->default(true);
            $table->boolean('apply_csv')->default(false);
            $table->boolean('show_print_date')->default(true);
            $table->string('print_date_label', 120)->nullable()->default('Dicetak');
            $table->boolean('show_print_row_count')->default(true);
            $table->boolean('show_generated_by')->default(true);
            $table->json('column_visibility')->nullable();
            $table->boolean('show_user_signature')->default(false);
            $table->boolean('show_user_name')->default(false);
            $table->boolean('show_user_phone')->default(false);
        });

        Schema::table('konfigdokumen_k', function (Blueprint $table) {
            $table->index(['is_active', 'is_deleted'], 'idx_konfigdokumen_k_active');
            $table->unique('lookup_id', 'uq_konfigdokumen_k_lookup_id');
            $table->foreign('lookup_id', 'fk_konfigdokumen_k_lookup')
                ->references('lookup_id')
                ->on('lookup_m');
        });
    }

    private static function createJamaahR(): void
    {
        Schema::create('jamaah_r', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_fung_kelompok_id')->nullable()->constrained('wilayah_fung_kelompok_m')->restrictOnDelete();
            $table->foreignId('wilayah_adm_desa_id')
                ->nullable()
                ->constrained('wilayah_adm_desa_m')
                ->nullOnDelete();
            $table->string('nik')->nullable();
            $table->string('nama');
            $table->string('gender', 1);
            $table->date('tanggal_lahir')->nullable();
            $table->string('kategori_umur', 32)->nullable()->index();
            $table->string('pekerjaan', 100)->nullable();
            $table->unsignedInteger('pekerjaan_id')->nullable();
            $table->string('pendidikan', 50)->nullable();
            $table->string('golongan_darah', 20)->nullable();
            $table->string('status_pernikahan', 32)->nullable()->index();
            $table->text('alamat')->nullable();
            $table->string('rt')->nullable();
            $table->string('rw')->nullable();
            $table->string('kode_pos', 10)->nullable()->index();
            $table->string('no_hp')->nullable();
            $table->string('email')->nullable();
            $table->string('status')->default('aktif')->index();
            $table->string('foto_path')->nullable();
            $table->json('face_descriptor')->nullable();
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('wilayah_fung_kelompok_id');
            $table->index('wilayah_adm_desa_id');
        });

        Schema::table('jamaah_r', function (Blueprint $table) {
            $table->unique('nik');
            $table->unique('no_hp');
            $table->unique('email');
            $table->foreign('pekerjaan_id')
                ->references('lookup_id')
                ->on('lookup_m')
                ->nullOnDelete();
            $table->index(['status', 'wilayah_fung_kelompok_id'], 'jamaah_r_status_wilayah_fung_kelompok_idx');
            $table->index(['status', 'kategori_umur'], 'jamaah_r_status_kategori_umur_idx');
        });
    }

    private static function createJamaahDapukanMp(): void
    {
        Schema::create('jamaah_dapukan_mp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jamaah_id')->constrained('jamaah_r')->cascadeOnDelete();
            $table->foreignId('dapukan_id')->constrained('dapukan_m')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['jamaah_id', 'dapukan_id']);
        });
    }

    private static function createKeluargaR(): void
    {
        Schema::create('keluarga_r', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wilayah_fung_kelompok_id')->constrained('wilayah_fung_kelompok_m')->restrictOnDelete();
            $table->foreignId('kepala_jamaah_id')->nullable()->constrained('jamaah_r')->nullOnDelete();
            $table->string('no_kk', 16)->nullable()->index();
            $table->text('alamat')->nullable();
            $table->string('rt', 10)->nullable();
            $table->string('rw', 10)->nullable();
            $table->foreignId('wilayah_adm_desa_id')
                ->nullable()
                ->constrained('wilayah_adm_desa_m')
                ->nullOnDelete();
            $table->string('kode_pos', 10)->nullable()->index();
            $table->text('catatan')->nullable();
            $table->string('status', 20)->default('aktif')->index();
            $table->timestamps();
            $table->softDeletes();
            $table->index('wilayah_fung_kelompok_id');
        });
    }

    private static function createJamaahKeluargaMp(): void
    {
        Schema::create('jamaah_keluarga_mp', function (Blueprint $table) {
            $table->id();
            $table->foreignId('keluarga_id')->constrained('keluarga_r')->cascadeOnDelete();
            $table->foreignId('jamaah_id')->constrained('jamaah_r')->restrictOnDelete();
            $table->string('hubungan_keluarga', 32);
            $table->boolean('is_kepala_keluarga')->default(false);
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->unique('jamaah_id');
            $table->unique(['keluarga_id', 'jamaah_id']);
            $table->index(['keluarga_id', 'is_kepala_keluarga']);
        });
    }

    private static function createIntegrationLogT(): void
    {
        Schema::create('integration_log_t', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 32);
            $table->string('level', 16)->default('info');
            $table->string('event_type', 48);
            $table->string('title', 255);
            $table->text('message');
            $table->text('context_json')->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->index('occurred_at');
            $table->index('provider');
            $table->index('level');
            $table->index('event_type');
            $table->index('created_by');
        });
    }

    private static function createLokasiM(): void
    {
        Schema::create('lokasi_m', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('jenis', 32)->default('masjid');
            $table->string('kota', 100)->nullable();
            $table->foreignId('wilayah_adm_desa_id')
                ->nullable()
                ->constrained('wilayah_adm_desa_m')
                ->nullOnDelete();
            $table->text('alamat')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('maps_place_id', 120)->nullable();
            $table->string('maps_place_name', 255)->nullable();
            $table->text('maps_url')->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['jenis', 'is_active']);
            $table->index('kota');
        });
    }

    private static function createPemateriM(): void
    {
        Schema::create('pemateri_m', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jamaah_id')->nullable()->constrained('jamaah_r')->nullOnDelete();
            $table->string('nama');
            $table->string('kontak', 50)->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique('jamaah_id');
        });
    }

    private static function createMateriM(): void
    {
        Schema::create('materi_m', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private static function createKategoriKegiatanM(): void
    {
        Schema::create('kategori_kegiatan_m', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->string('calendar_color', 7)->default('#2563eb');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private static function createHariLiburM(): void
    {
        Schema::create('hari_libur_m', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal')->unique();
            $table->string('nama');
            $table->string('jenis', 32)->default('nasional');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    private static function createKegiatanJadwalRutinT(): void
    {
        Schema::create('kegiatan_jadwal_rutin_t', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('pemateri')->nullable();
            $table->foreignId('pemateri_id')->nullable()->constrained('pemateri_m')->nullOnDelete();
            $table->foreignId('kategori_kegiatan_id')->nullable()->constrained('kategori_kegiatan_m')->nullOnDelete();
            $table->string('lokasi')->nullable();
            $table->foreignId('lokasi_id')->nullable()->constrained('lokasi_m')->nullOnDelete();
            $table->text('deskripsi')->nullable();
            $table->string('frekuensi', 20);
            $table->unsignedTinyInteger('day_of_week')->nullable();
            $table->unsignedTinyInteger('day_of_month')->nullable();
            $table->unsignedTinyInteger('month_of_year')->nullable();
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();
            $table->string('scope_level', 20);
            $table->foreignId('wilayah_fung_daerah_id')->nullable()->constrained('wilayah_fung_daerah_m')->nullOnDelete();
            $table->foreignId('wilayah_fung_desa_id')->nullable()->constrained('wilayah_fung_desa_m')->nullOnDelete();
            $table->foreignId('wilayah_fung_kelompok_id')->nullable()->constrained('wilayah_fung_kelompok_m')->nullOnDelete();
            $table->date('effective_from');
            $table->date('effective_until')->nullable();
            $table->unsignedSmallInteger('generate_horizon_days')->default(90);
            $table->date('last_generated_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['is_active', 'effective_from']);
            $table->index(['scope_level', 'wilayah_fung_daerah_id', 'wilayah_fung_desa_id', 'wilayah_fung_kelompok_id']);
        });
    }

    private static function createKegiatanT(): void
    {
        Schema::create('kegiatan_t', function (Blueprint $table) {
            $table->id();
            $table->string('judul');
            $table->string('pemateri')->nullable();
            $table->foreignId('pemateri_id')->nullable()->constrained('pemateri_m')->nullOnDelete();
            $table->string('jenis')->nullable();
            $table->foreignId('kategori_kegiatan_id')->nullable()->constrained('kategori_kegiatan_m')->nullOnDelete();
            $table->date('tanggal');
            $table->time('jam_mulai')->nullable();
            $table->time('jam_selesai')->nullable();
            $table->string('lokasi')->nullable();
            $table->foreignId('lokasi_id')->nullable()->constrained('lokasi_m')->nullOnDelete();
            $table->text('deskripsi')->nullable();
            $table->text('catatan')->nullable();
            $table->string('status')->default('planned');
            $table->foreignId('jadwal_rutin_id')->nullable()->constrained('kegiatan_jadwal_rutin_t')->nullOnDelete();
            $table->foreignId('wilayah_fung_daerah_id')->nullable()->constrained('wilayah_fung_daerah_m')->nullOnDelete();
            $table->foreignId('wilayah_fung_desa_id')->nullable()->constrained('wilayah_fung_desa_m')->nullOnDelete();
            $table->foreignId('wilayah_fung_kelompok_id')->nullable()->constrained('wilayah_fung_kelompok_m')->nullOnDelete();
            $table->timestamps();
            $table->unique(['jadwal_rutin_id', 'tanggal']);
            $table->index(['status', 'tanggal']);
            $table->index(['wilayah_fung_daerah_id', 'wilayah_fung_desa_id', 'wilayah_fung_kelompok_id', 'tanggal']);
            $table->index(['tanggal', 'kategori_kegiatan_id'], 'kegiatan_t_tanggal_kategori_idx');
            $table->index(['tanggal', 'status'], 'kegiatan_t_tanggal_status_idx');
        });
    }

    private static function createKegiatanMateriMp(): void
    {
        Schema::create('kegiatan_materi_mp', function (Blueprint $table) {
            $table->foreignId('kegiatan_id')->constrained('kegiatan_t')->cascadeOnDelete();
            $table->foreignId('materi_id')->constrained('materi_m')->cascadeOnDelete();
            $table->primary(['kegiatan_id', 'materi_id']);
        });

        Schema::table('kegiatan_materi_mp', function (Blueprint $table) {
            $table->index('materi_id', 'kegiatan_materi_mp_materi_id_idx');
        });
    }

    private static function createKegiatanJadwalRutinMateriMp(): void
    {
        Schema::create('kegiatan_jadwal_rutin_materi_mp', function (Blueprint $table) {
            $table->foreignId('kegiatan_jadwal_rutin_id')
                ->constrained('kegiatan_jadwal_rutin_t')
                ->cascadeOnDelete();
            $table->foreignId('materi_id')->constrained('materi_m')->cascadeOnDelete();
            $table->primary(['kegiatan_jadwal_rutin_id', 'materi_id'], 'kegiatan_jadwal_rutin_materi_mp_primary');
        });
    }

    private static function createAbsensiSesiT(): void
    {
        Schema::create('absensi_sesi_t', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->unsignedBigInteger('ref_id');
            $table->string('title');
            $table->foreignId('opened_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->string('status')->default('open');
            $table->timestamps();
            $table->index(['type', 'ref_id']);
            $table->index('status');
            $table->index('opened_at', 'absensi_sesi_t_opened_at_idx');
        });
    }

    private static function createAbsensiT(): void
    {
        Schema::create('absensi_t', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('absensi_sesi_t')->cascadeOnDelete();
            $table->foreignId('jamaah_id')->constrained('jamaah_r')->restrictOnDelete();
            $table->string('method');
            $table->float('matched_distance')->nullable();
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('recorded_at');
            $table->timestamps();
            $table->unique(['session_id', 'jamaah_id']);
            $table->index('jamaah_id');
            $table->index('recorded_at');
            $table->index('recorded_by');
            $table->index(['recorded_at', 'jamaah_id'], 'absensi_t_recorded_jamaah_idx');
            $table->index('method', 'absensi_t_method_idx');
        });
    }

    private static function createPasswordResetRequestT(): void
    {
        Schema::create('password_reset_request_t', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('channel', 16);
            $table->string('identifier', 255);
            $table->string('token_hash', 64);
            $table->timestamp('expires_at');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['identifier', 'channel']);
            $table->index('expires_at');
        });
    }

    private static function createTrustedAdminDeviceR(): void
    {
        Schema::create('trusted_admin_device_r', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('device_key', 64);
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('last_seen_at');
            $table->timestamps();
            $table->unique(['user_id', 'device_key']);
            $table->index(['ip_address', 'last_seen_at']);
            $table->index('device_key');
        });
    }

    private static function createAuditLoginT(): void
    {
        Schema::create('audit_login_t', function (Blueprint $table) {
            $table->id();
            $table->string('event', 32);
            $table->boolean('success')->default(false);
            $table->string('username', 255);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('failure_reason', 64)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->boolean('remember_me')->nullable();
            $table->string('device_key', 128)->nullable();
            $table->unsignedBigInteger('personal_access_token_id')->nullable();
            $table->timestamp('attempted_at')->useCurrent();
            $table->index('attempted_at');
            $table->index('username');
            $table->index('user_id');
            $table->index('event');
            $table->index('success');
        });
    }

    private static function createAppErrorLogT(): void
    {
        Schema::create('app_error_log_t', function (Blueprint $table) {
            $table->id();
            $table->string('level', 16)->default('error');
            $table->string('status', 32)->default('baru');
            $table->text('status_note')->nullable();
            $table->timestamp('status_updated_at')->nullable();
            $table->foreignId('status_updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('exception_class', 255);
            $table->text('message');
            $table->string('file', 512)->nullable();
            $table->integer('line')->nullable();
            $table->text('stack_trace')->nullable();
            $table->string('request_method', 16)->nullable();
            $table->string('request_path', 512)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->index('occurred_at');
            $table->index('level');
            $table->index('status');
            $table->index('exception_class');
            $table->index('user_id');
        });
    }

    private static function createAuditActivityT(): void
    {
        Schema::create('audit_activity_t', function (Blueprint $table) {
            $table->id();
            $table->string('module', 32);
            $table->string('action', 64);
            $table->string('entity_type', 64);
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('entity_label', 255)->nullable();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_username', 255)->nullable();
            $table->text('summary');
            $table->text('meta')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->index('occurred_at');
            $table->index('module');
            $table->index('action');
            $table->index('entity_type');
            $table->index('actor_user_id');
        });
    }

    public static function createFeedbackModule(): void
    {
        Schema::create('app_report_t', function (Blueprint $table) {
            $table->id();
            $table->string('category', 32);
            $table->string('reporter_name', 150);
            $table->string('reporter_username', 100)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('jamaah_id')->nullable()->constrained('jamaah_r')->nullOnDelete();
            $table->string('subject', 255);
            $table->text('description');
            $table->string('contact', 120)->nullable();
            $table->text('images_json')->nullable();
            $table->string('status', 32)->default('baru');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->index('category');
            $table->index('status');
            $table->index('user_id');
            $table->index('jamaah_id');
            $table->index('created_at');
        });

        Schema::create('app_feedback_t', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 32);
            $table->string('reporter_name', 150);
            $table->string('reporter_username', 100)->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('jamaah_id')->nullable()->constrained('jamaah_r')->nullOnDelete();
            $table->string('contact', 120)->nullable();
            $table->string('title', 255);
            $table->text('body');
            $table->smallInteger('rating')->nullable();
            $table->string('role_label', 120)->nullable();
            $table->text('images_json')->nullable();
            $table->boolean('is_published')->default(false);
            $table->string('status', 32)->default('baru');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->index('kind');
            $table->index('status');
            $table->index('is_published');
            $table->index('user_id');
            $table->index('created_at');
        });

        Schema::create('app_poll_t', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index('is_active');
        });

        Schema::create('app_poll_option_t', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained('app_poll_t')->cascadeOnDelete();
            $table->string('label', 255);
            $table->integer('urutan')->default(0);
            $table->index('poll_id');
        });

        Schema::create('app_poll_vote_t', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained('app_poll_t')->cascadeOnDelete();
            $table->foreignId('option_id')->constrained('app_poll_option_t')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['poll_id', 'user_id']);
            $table->index('poll_id');
            $table->index('option_id');
        });
    }
}
