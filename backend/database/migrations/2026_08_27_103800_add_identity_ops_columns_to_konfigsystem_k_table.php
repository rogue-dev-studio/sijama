<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:38:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:38:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->string('app_nama', 200)->nullable()->after('dash_logo');
            $table->string('nama_instansi', 200)->nullable()->after('app_nama');
            $table->text('alamat')->nullable()->after('nama_instansi');
            $table->string('telepon', 50)->nullable()->after('alamat');
            $table->string('email_kontak', 200)->nullable()->after('telepon');
            $table->string('timezone', 64)->nullable()->after('email_kontak');
            $table->string('locale', 20)->nullable()->after('timezone');
            $table->string('path_favicon', 500)->nullable()->after('locale');
            $table->string('path_logofooter', 500)->nullable()->after('path_favicon');
            $table->boolean('maintenance_mode')->default(false)->after('path_logofooter');
            $table->text('maintenance_message')->nullable()->after('maintenance_mode');
            $table->string('mail_reply_to', 200)->nullable()->after('mail_from_name');
        });
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn([
                'app_nama',
                'nama_instansi',
                'alamat',
                'telepon',
                'email_kontak',
                'timezone',
                'locale',
                'path_favicon',
                'path_logofooter',
                'maintenance_mode',
                'maintenance_message',
                'mail_reply_to',
            ]);
        });
    }
};
