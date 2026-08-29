<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 17:41:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 17:41:32
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigdokumen_k', function (Blueprint $table) {
            $table->string('path_logo_kiri', 500)->nullable()->after('footer_detail');
            $table->string('path_logo_kanan', 500)->nullable()->after('path_logo_kiri');
            $table->string('layout_mode', 20)->default('kop')->after('path_logo_kanan');
            $table->json('header_style')->nullable()->after('layout_mode');
        });
    }

    public function down(): void
    {
        Schema::table('konfigdokumen_k', function (Blueprint $table) {
            $table->dropColumn(['path_logo_kiri', 'path_logo_kanan', 'layout_mode', 'header_style']);
        });
    }
};
