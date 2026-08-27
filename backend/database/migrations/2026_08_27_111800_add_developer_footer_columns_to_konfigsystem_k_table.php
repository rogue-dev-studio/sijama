<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 11:18:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 11:18:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->string('website', 500)->nullable()->after('footer');
            $table->string('footer_link', 500)->nullable()->after('website');
            $table->string('footer_detail', 500)->nullable()->after('footer_link');
            $table->string('footer_detail_link', 500)->nullable()->after('footer_detail');
        });
    }

    public function down(): void
    {
        Schema::table('konfigsystem_k', function (Blueprint $table) {
            $table->dropColumn([
                'website',
                'footer_link',
                'footer_detail',
                'footer_detail_link',
            ]);
        });
    }
};
