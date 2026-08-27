<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 12:28:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 12:28:00
 */

use App\Support\LookupTypes;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            $table->string('golongan_darah', 20)->nullable()->after('pendidikan');
        });

        if (! Schema::hasTable('pekerjaan')) {
            return;
        }

        Schema::table('jamaah', function (Blueprint $table) {
            $table->dropForeign(['pekerjaan_id']);
        });

        $pekerjaanRows = DB::table('pekerjaan')->orderBy('id')->get();
        $idMap = [];

        foreach ($pekerjaanRows as $index => $row) {
            $existing = DB::table('lookup_m')
                ->where('lookup_type', LookupTypes::PEKERJAAN)
                ->where('is_deleted', false)
                ->where(function ($query) use ($row) {
                    $query->where('lookup_name', $row->nama)
                        ->orWhere('lookup_value', $row->nama);
                })
                ->first();

            if ($existing) {
                $idMap[(int) $row->id] = (int) $existing->lookup_id;
                continue;
            }

            $slug = $this->slugify((string) $row->nama);
            $lookupId = DB::table('lookup_m')->insertGetId([
                'lookup_type' => LookupTypes::PEKERJAAN,
                'lookup_name' => $row->nama,
                'lookup_value' => $slug !== '' ? $slug : 'pekerjaan_'.$row->id,
                'lookup_urutan' => $index + 1,
                'lookup_kode' => null,
                'created_date' => now(),
                'modified_count' => 0,
                'is_deleted' => false,
                'is_active' => (bool) ($row->is_active ?? true),
            ], 'lookup_id');

            $idMap[(int) $row->id] = (int) $lookupId;
        }

        foreach ($idMap as $oldId => $newId) {
            DB::table('jamaah')->where('pekerjaan_id', $oldId)->update(['pekerjaan_id' => $newId]);
        }

        Schema::table('jamaah', function (Blueprint $table) {
            $table->foreign('pekerjaan_id')
                ->references('lookup_id')
                ->on('lookup_m')
                ->nullOnDelete();
        });

        Schema::dropIfExists('pekerjaan');
    }

    public function down(): void
    {
        Schema::table('jamaah', function (Blueprint $table) {
            if (Schema::hasColumn('jamaah', 'pekerjaan_id')) {
                $table->dropForeign(['pekerjaan_id']);
            }
        });

        Schema::create('pekerjaan', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $lookups = DB::table('lookup_m')
            ->where('lookup_type', LookupTypes::PEKERJAAN)
            ->where('is_deleted', false)
            ->orderBy('lookup_urutan')
            ->get();

        $idMap = [];
        foreach ($lookups as $row) {
            $newId = DB::table('pekerjaan')->insertGetId([
                'nama' => $row->lookup_name ?: $row->lookup_value,
                'is_active' => (bool) $row->is_active,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $idMap[(int) $row->lookup_id] = (int) $newId;
        }

        foreach ($idMap as $oldId => $newId) {
            DB::table('jamaah')->where('pekerjaan_id', $oldId)->update(['pekerjaan_id' => $newId]);
        }

        Schema::table('jamaah', function (Blueprint $table) {
            $table->foreign('pekerjaan_id')->references('id')->on('pekerjaan')->nullOnDelete();
            if (Schema::hasColumn('jamaah', 'golongan_darah')) {
                $table->dropColumn('golongan_darah');
            }
        });
    }

    private function slugify(string $value): string
    {
        $slug = strtolower(trim($value));
        $slug = preg_replace('/[^a-z0-9]+/i', '_', $slug) ?? '';

        return trim($slug, '_');
    }
};
