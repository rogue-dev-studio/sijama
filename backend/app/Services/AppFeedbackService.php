<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 17:20:00
 */

namespace App\Services;

use App\Models\AppFeedback;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use App\Support\UploadStorage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AppFeedbackService
{
    public const KINDS = ['idea', 'testimonial'];

    public const STATUSES = ['baru', 'diproses', 'selesai', 'ditolak'];

    public const MAX_IMAGES = 5;

    /**
     * @param  array{reporter_name: string, title: string, body: string, rating?: int|null, role_label?: string|null, contact?: string|null}  $data
     * @param  list<UploadedFile>  $images
     */
    public function store(string $kind, array $data, User $user, array $images = []): AppFeedback
    {
        $this->assertKind($kind);

        $reporterName = trim((string) ($data['reporter_name'] ?? ''));
        if ($reporterName === '') {
            throw ValidationException::withMessages([
                'reporter_name' => ['Nama pengirim wajib diisi.'],
            ]);
        }

        $title = trim((string) ($data['title'] ?? ''));
        if ($title === '') {
            throw ValidationException::withMessages([
                'title' => ['Judul wajib diisi.'],
            ]);
        }

        $body = trim((string) ($data['body'] ?? ''));
        if ($body === '') {
            throw ValidationException::withMessages([
                'body' => ['Isi masukan wajib diisi.'],
            ]);
        }

        $rating = $data['rating'] ?? null;
        if ($rating !== null && $rating !== '') {
            $rating = (int) $rating;
            if ($rating < 1 || $rating > 5) {
                throw ValidationException::withMessages([
                    'rating' => ['Rating harus antara 1 sampai 5.'],
                ]);
            }
        } else {
            $rating = null;
        }

        if ($kind === 'testimonial' && $rating === null) {
            throw ValidationException::withMessages([
                'rating' => ['Rating wajib diisi untuk testimoni.'],
            ]);
        }

        $feedback = AppFeedback::query()->create([
            'kind' => $kind,
            'reporter_name' => $reporterName,
            'reporter_username' => $user->username,
            'user_id' => $user->id,
            'jamaah_id' => $user->jamaah_id,
            'contact' => $this->resolveContact($data['contact'] ?? null, $user),
            'title' => $title,
            'body' => $body,
            'rating' => $rating,
            'role_label' => filled($data['role_label'] ?? null) ? trim((string) $data['role_label']) : null,
            'images_json' => null,
            'is_published' => $kind === 'testimonial',
            'status' => $kind === 'testimonial' ? 'selesai' : 'baru',
        ]);

        $paths = $this->storeImages($images, 'app-feedback/'.$feedback->id);
        if ($paths !== []) {
            $feedback->forceFill([
                'images_json' => json_encode($paths, JSON_UNESCAPED_SLASHES),
            ])->save();
        }

        return $feedback->load(['user:id,name,username', 'jamaah:id,nama']);
    }

    public function listAdmin(
        ?string $kind = null,
        ?string $q = null,
        ?string $status = null,
        ?bool $isPublished = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = AppFeedback::query()->with(['user:id,name,username', 'jamaah:id,nama']);

        if (filled($kind)) {
            $kind = $this->normalizeKind((string) $kind);
            $this->assertKind($kind);
            $builder->where('kind', $kind);
        } else {
            $builder->where('kind', 'idea');
        }

        if (filled($status)) {
            $this->assertStatus($status);
            $builder->where('status', $status);
        }

        if ($isPublished !== null) {
            $builder->where('is_published', $isPublished);
        }

        if (filled($q)) {
            $term = '%'.trim($q).'%';
            $builder->where(function ($query) use ($term) {
                $query->where('title', 'ilike', $term)
                    ->orWhere('body', 'ilike', $term)
                    ->orWhere('reporter_name', 'ilike', $term)
                    ->orWhere('reporter_username', 'ilike', $term)
                    ->orWhere('role_label', 'ilike', $term);
            });
        }

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['created_at', 'status', 'kind', 'title', 'reporter_name', 'is_published', 'rating'],
            'created_at',
            'desc',
        );

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function listMine(
        User $user,
        string $kind = 'idea',
        ?string $q = null,
        ?string $status = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $kind = $this->normalizeKind($kind);
        $this->assertKind($kind);

        $builder = AppFeedback::query()
            ->with(['user:id,name,username', 'jamaah:id,nama'])
            ->where('user_id', $user->id)
            ->where('kind', $kind);

        if (filled($status)) {
            $this->assertStatus($status);
            $builder->where('status', $status);
        }

        if (filled($q)) {
            $term = '%'.trim($q).'%';
            $builder->where(function ($query) use ($term) {
                $query->where('title', 'ilike', $term)
                    ->orWhere('body', 'ilike', $term)
                    ->orWhere('reporter_name', 'ilike', $term);
            });
        }

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['created_at', 'status', 'title', 'reporter_name'],
            'created_at',
            'desc',
        );

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    public function listPublishedTestimonials(int $limit = 100): Collection
    {
        return AppFeedback::query()
            ->where('kind', 'testimonial')
            ->where('is_published', true)
            ->orderByDesc('created_at')
            ->limit(max(1, min($limit, 200)))
            ->get();
    }

    /**
     * @param  array{status?: string, is_published?: bool, admin_notes?: string|null}  $data
     */
    public function updateAdmin(int $id, array $data): AppFeedback
    {
        $feedback = AppFeedback::query()->find($id);
        if (! $feedback) {
            throw new ModelNotFoundException('Masukan tidak ditemukan.');
        }

        if (array_key_exists('status', $data) && filled($data['status'])) {
            $this->assertStatus((string) $data['status']);
            $feedback->status = (string) $data['status'];
        }

        if (array_key_exists('is_published', $data)) {
            $feedback->is_published = (bool) $data['is_published'];
        }

        if (array_key_exists('admin_notes', $data)) {
            $feedback->admin_notes = filled($data['admin_notes']) ? trim((string) $data['admin_notes']) : null;
        }

        $feedback->save();

        return $feedback->load(['user:id,name,username', 'jamaah:id,nama']);
    }

    public function findById(int $id): ?AppFeedback
    {
        return AppFeedback::query()->find($id);
    }

    private function resolveContact(mixed $input, User $user): ?string
    {
        if (filled($input)) {
            return trim((string) $input);
        }

        $user->loadMissing('jamaah:id,no_hp,email');
        foreach ([$user->email, $user->jamaah?->no_hp, $user->jamaah?->email] as $value) {
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

    private function normalizeKind(string $kind): string
    {
        return match ($kind) {
            'ide' => 'idea',
            'testimoni' => 'testimonial',
            default => $kind,
        };
    }

    private function assertKind(string $kind): void
    {
        if (! in_array($kind, self::KINDS, true)) {
            throw ValidationException::withMessages([
                'kind' => ['Jenis masukan tidak valid.'],
            ]);
        }
    }

    private function assertStatus(string $status): void
    {
        if (! in_array($status, self::STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => ['Status masukan tidak valid.'],
            ]);
        }
    }
}
