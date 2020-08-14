<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jamaah', function (Blueprint $table) {
            $table->id();
            $table->string('nik')->nullable()->unique();
            $table->string('nama');
            $table->string('gender', 1);
            $table->date('tanggal_lahir')->nullable();
            $table->text('alamat')->nullable();
            $table->string('rt');
            $table->string('rw');
            $table->string('no_hp');
            $table->string('email')->nullable();
            $table->string('status')->default('aktif');
            $table->string('foto_path')->nullable();
            $table->jsonb('face_descriptor')->nullable();
            $table->timestamp('enrolled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jamaah');
    }
};
