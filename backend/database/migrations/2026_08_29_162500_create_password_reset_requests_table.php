<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:25:00
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_requests', function (Blueprint $table) {
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

    public function down(): void
    {
        Schema::dropIfExists('password_reset_requests');
    }
};
