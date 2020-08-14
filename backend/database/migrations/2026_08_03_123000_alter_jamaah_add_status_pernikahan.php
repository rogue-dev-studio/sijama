<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-03 12:30:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-03 12:30:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->string('status_pernikahan', 32)->nullable()->after('pendidikan');
            $table->index('status_pernikahan');
        });
    }

    public function down(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropIndex(['status_pernikahan']);
            $table->dropColumn('status_pernikahan');
        });
    }
};
