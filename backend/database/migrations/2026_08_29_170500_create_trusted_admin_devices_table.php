<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:05:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:05:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trusted_admin_devices', function (Blueprint $table) {
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

    public function down(): void
    {
        Schema::dropIfExists('trusted_admin_devices');
    }
};
