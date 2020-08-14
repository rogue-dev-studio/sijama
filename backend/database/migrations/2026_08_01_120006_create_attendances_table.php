<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('attendance_sessions')->cascadeOnDelete();
            $table->foreignId('jamaah_id')->constrained('jamaah');
            $table->string('method');
            $table->float('matched_distance')->nullable();
            $table->foreignId('recorded_by')->constrained('users');
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->unique(['session_id', 'jamaah_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
