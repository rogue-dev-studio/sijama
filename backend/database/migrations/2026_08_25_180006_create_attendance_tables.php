<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-25 17:59:30
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 17:59:30
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_sessions', function (Blueprint $table) {
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
        });

        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('attendance_sessions')->cascadeOnDelete();
            $table->foreignId('jamaah_id')->constrained('jamaah')->restrictOnDelete();
            $table->string('method');
            $table->float('matched_distance')->nullable();
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('recorded_at');
            $table->timestamps();
            $table->unique(['session_id', 'jamaah_id']);
            $table->index('jamaah_id');
            $table->index('recorded_at');
            $table->index('recorded_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('attendance_sessions');
    }
};
