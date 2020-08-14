<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        foreach ([
            ['kode' => 'superadmin', 'nama' => 'Super Admin', 'urutan' => 1],
            ['kode' => 'admin', 'nama' => 'Admin', 'urutan' => 2],
            ['kode' => '5s', 'nama' => '5S', 'urutan' => 3],
        ] as $dapukan) {
            DB::table('dapukan')->updateOrInsert(
                ['kode' => $dapukan['kode']],
                [
                    'nama' => $dapukan['nama'],
                    'deskripsi' => null,
                    'urutan' => $dapukan['urutan'],
                    'is_system' => true,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('dapukan_id')->nullable()->after('password')->constrained('dapukan')->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('dapukan_id');
        });

        if (Schema::hasColumn('users', 'role')) {
            $superadminDapukanId = DB::table('dapukan')->where('kode', 'superadmin')->value('id');
            $adminDapukanId = DB::table('dapukan')->where('kode', 'admin')->value('id');
            $fiveSDapukanId = DB::table('dapukan')->where('kode', '5s')->value('id');

            if ($superadminDapukanId) {
                DB::table('users')->where('role', 'superadmin')->update(['dapukan_id' => $superadminDapukanId]);
            }

            if ($adminDapukanId) {
                DB::table('users')->where('role', 'admin')->update(['dapukan_id' => $adminDapukanId]);
            }

            if ($fiveSDapukanId) {
                DB::table('users')->where('role', 'pengurus')->update(['dapukan_id' => $fiveSDapukanId]);
            }

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('pengurus')->after('password');
        });

        $adminDapukanId = DB::table('dapukan')->where('kode', 'admin')->value('id');
        $fiveSDapukanId = DB::table('dapukan')->where('kode', '5s')->value('id');

        if ($adminDapukanId) {
            DB::table('users')->where('dapukan_id', $adminDapukanId)->update(['role' => 'admin']);
        }

        if ($fiveSDapukanId) {
            DB::table('users')->where('dapukan_id', $fiveSDapukanId)->update(['role' => 'pengurus']);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('dapukan_id');
            $table->dropColumn('is_active');
        });
    }
};
