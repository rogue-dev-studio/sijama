<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:20:00
 */

namespace App\Services;

use App\Models\AppReport;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use App\Support\UploadStorage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AppReportService
{
    public const CATEGORIES = ['teknis', 'nonteknis'];

    public const STATUSES = ['baru', 'diproses', 'selesai', 'ditolak'];

    public const MAX_IMAGES = 5;

    /**
     * @param  array{reporter_name: string, subject: string, description: string, contact?: string|null}  $data
     * @param  list<UploadedFile>  $images
     */
    public function store(string $category, array $data, User $user, array $images = []): AppReport
    {
        $this->assertCategory($category);

        $reporterName = trim((string) ($data['reporter_name'] ?? ''));
        if ($reporterName === '') {
            throw ValidationException::withMessages([
                'reporter_name' => ['Nama pelapor wajib diisi.'],
            ]);
        }

        $subject = trim((string) ($data['subject'] ?? ''));
        if ($subject === '') {
            throw ValidationException::withMessages([
                'subject' => ['Subjek laporan wajib diisi.'],
            ]);
        }

        $description = trim((string) ($data['description'] ?? ''));
        if ($description === '') {
            throw ValidationException::withMessages([
                'description' => ['Deskripsi laporan wajib diisi.'],
            ]);
        }

        $report = AppReport::query()->create([
            'category' => $category,
            'reporter_name' => $reporterName,
            'reporter_username' => $user->username,
            'user_id' => $user->id,
            'jamaah_id' => $user->jamaah_id,
            'subject' => $subject,
            'description' => $description,
            'contact' => $this->resolveContact($data['contact'] ?? null, $user),
            'images_json' => null,
            'status' => 'baru',
        ]);

        $paths = $this->storeImages($images, 'app-reports/'.$report->id);
        if ($paths !== []) {
            $report->forceFill([
                'images_json' => json_encode($paths, JSON_UNESCAPED_SLASHES),
            ])->save();
        }

        return $report->load(['user:id,name,username', 'jamaah:id,nama']);
    }

    public function listMine(
        User $user,
        ?string $q = null,
        ?string $category = null,
        ?string $status = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = AppReport::query()
            ->with(['user:id,name,username', 'jamaah:id,nama'])
            ->where('user_id', $user->id);

        $this->applyFilters($builder, $q, $category, $status);

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['created_at', 'status', 'category', 'subject', 'reporter_name'],
            'created_at',
            'desc',
        );

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function listAll(
        ?string $q = null,
        ?string $category = null,
        ?string $status = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = AppReport::query()->with(['user:id,name,username', 'jamaah:id,nama']);

        $this->applyFilters($builder, $q, $category, $status);

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['created_at', 'status', 'category', 'subject', 'reporter_name'],
            'created_at',
            'desc',
        );

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function updateStatus(int $id, string $status, ?string $adminNotes = null): AppReport
    {
        $this->assertStatus($status);

        $report = AppReport::query()->find($id);
        if (! $report) {
            throw new ModelNotFoundException('Laporan tidak ditemukan.');
        }

        $report->fill([
            'status' => $status,
            'admin_notes' => $adminNotes,
        ])->save();

        return $report->load(['user:id,name,username', 'jamaah:id,nama']);
    }

    private function applyFilters($builder, ?string $q, ?string $category, ?string $status): void
    {
        if (filled($category)) {
            $this->assertCategory($category);
            $builder->where('category', $category);
        }

        if (filled($status)) {
            $this->assertStatus($status);
            $builder->where('status', $status);
        }

        if (filled($q)) {
            $term = '%'.trim($q).'%';
            $builder->where(function ($query) use ($term) {
                $query->where('subject', 'ilike', $term)
                    ->orWhere('description', 'ilike', $term)
                    ->orWhere('reporter_name', 'ilike', $term)
                    ->orWhere('reporter_username', 'ilike', $term)
                    ->orWhere('contact', 'ilike', $term);
            });
        }
    }

    private function resolveContact(mixed $input, User $user): ?string
    {
        if (filled($input)) {
            return trim((string) $input);
        }

        $user->loadMissing('jamaah:id,no_hp,email');
        $candidates = [
            $user->email,
            $user->jamaah?->no_hp,
            $user->jamaah?->email,
        ];

        foreach ($candidates as $value) {
            if (filled($value)) {
                return trim((string) $value);
            }
        }

        return null;
    }

    /**
     * @param  list<UploadedFile|null>  $images
     * @return list<string>
     */
    private function storeImages(array $images, string $directory): array
    {
        $paths = [];
        foreach (array_values($images) as $index => $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }
            if (count($paths) >= self::MAX_IMAGES) {
                break;
            }
            if (! $file->isValid()) {
                throw ValidationException::withMessages([
                    'images' => ['Unggahan gambar gagal: '.$file->getErrorMessage()],
                ]);
            }
            $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            if (! in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
                $ext = 'jpg';
            }
            $filename = Str::uuid()->toString().'_'.$index.'.'.$ext;
            try {
                $paths[] = UploadStorage::storeUploadedAs($file, $directory, $filename);
            } catch (\Throwable $e) {
                report($e);
                throw ValidationException::withMessages([
                    'images' => ['Gagal menyimpan gambar. Coba format JPG/PNG/WebP dan ukuran maks. 5 MB.'],
                ]);
            }
        }

        return $paths;
    }

    private function assertCategory(string $category): void
    {
        if (! in_array($category, self::CATEGORIES, true)) {
            throw ValidationException::withMessages([
                'category' => ['Kategori laporan tidak valid.'],
            ]);
        }
    }

    private function assertStatus(string $status): void
    {
        if (! in_array($status, self::STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => ['Status laporan tidak valid.'],
            ]);
        }
    }
}
