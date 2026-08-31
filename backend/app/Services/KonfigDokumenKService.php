<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 16:06:32
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 16:14:05
 */

namespace App\Services;

use App\Http\Resources\KonfigDokumenKResource;
use App\Models\KonfigDokumenK;
use App\Models\LookupM;
use App\Support\DocumentKonfig;
use App\Support\DocumentHeaderStyle;
use App\Support\LookupKonfigDokumenMeta;
use App\Support\LookupTypes;
use App\Support\UploadStorage;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class KonfigDokumenKService
{
    public function list(
        ?string $query = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = LookupM::query()
            ->notDeleted()
            ->active()
            ->byType(LookupTypes::KONFIG_DOKUMEN);

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['lookup_name', 'lookup_value', 'lookup_urutan'],
            'lookup_urutan',
        );

        if ($query) {
            $like = "%{$query}%";
            $builder->where(function ($q) use ($like) {
                $q->where('lookup_name', 'ilike', $like)
                    ->orWhere('lookup_value', 'ilike', $like)
                    ->orWhere('lookup_kode', 'ilike', $like);
            });
        }

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function mapPage(LengthAwarePaginator $paginator): array
    {
        $lookups = collect($paginator->items());
        $configs = KonfigDokumenK::query()
            ->notDeleted()
            ->whereIn('lookup_id', $lookups->pluck('lookup_id'))
            ->get()
            ->keyBy('lookup_id');

        $items = [];
        foreach ($lookups as $lookup) {
            /** @var LookupM $lookup */
            $items[] = DocumentKonfig::mapRow($lookup, $configs->get($lookup->lookup_id));
        }

        return $items;
    }

    /** @return array<string, mixed> */
    public function show(int $lookupId): array
    {
        $lookup = LookupM::query()
            ->notDeleted()
            ->active()
            ->byType(LookupTypes::KONFIG_DOKUMEN)
            ->where('lookup_id', $lookupId)
            ->first();

        if (! $lookup) {
            throw ValidationException::withMessages([
                'lookup_id' => ['Lookup konfig_dokumen tidak ditemukan atau tidak aktif.'],
            ]);
        }

        $config = KonfigDokumenK::query()
            ->notDeleted()
            ->where('lookup_id', $lookup->lookup_id)
            ->first();

        return DocumentKonfig::mapRow($lookup, $config);
    }

    public function upsert(array $data): KonfigDokumenKResource
    {
        $lookupId = (int) ($data['lookup_id'] ?? 0);
        $lookup = LookupM::query()
            ->notDeleted()
            ->active()
            ->byType(LookupTypes::KONFIG_DOKUMEN)
            ->where('lookup_id', $lookupId)
            ->first();

        if (! $lookup) {
            throw ValidationException::withMessages([
                'lookup_id' => ['Lookup konfig_dokumen tidak ditemukan atau tidak aktif.'],
            ]);
        }

        $model = KonfigDokumenK::query()
            ->notDeleted()
            ->where('lookup_id', $lookup->lookup_id)
            ->first();

        $payload = $this->prepare($data);
        unset($payload['lookup_id']);

        if ($model) {
            $payload['last_modified_date'] = now();
            $payload['last_modified_by'] = Auth::id();
            $payload['modified_count'] = ((int) $model->modified_count) + 1;
            $model->update($payload);
        } else {
            $model = KonfigDokumenK::query()->create(array_merge($payload, [
                'lookup_id' => $lookup->lookup_id,
                'created_date' => now(),
                'created_by' => Auth::id(),
                'modified_count' => 0,
                'is_deleted' => false,
                'is_active' => array_key_exists('is_active', $payload) ? (bool) $payload['is_active'] : true,
            ]));
        }

        DocumentKonfig::forgetCache();

        return new KonfigDokumenKResource($model->fresh()->loadMissing('lookup'));
    }

    public function uploadAsset(int $lookupId, string $asset, UploadedFile $file): KonfigDokumenKResource
    {
        $column = $this->resolveAssetColumn($asset);
        $model = $this->findOrCreateForLookup($lookupId);

        $this->deleteStoredAsset($model->{$column});

        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'png');
        $filename = str_replace('-', '_', $asset).'_'.now()->format('YmdHis').'.'.$extension;
        $publicPath = UploadStorage::storeUploadedAs($file, 'konfig/dokumen/'.$lookupId, $filename);

        $model->update([
            $column => $publicPath,
            'last_modified_date' => now(),
            'last_modified_by' => Auth::id(),
            'modified_count' => ((int) $model->modified_count) + 1,
        ]);

        DocumentKonfig::forgetCache();

        return new KonfigDokumenKResource($model->fresh()->loadMissing('lookup'));
    }

    public function removeAsset(int $lookupId, string $asset): KonfigDokumenKResource
    {
        $column = $this->resolveAssetColumn($asset);
        $model = $this->findOrCreateForLookup($lookupId);

        $this->deleteStoredAsset($model->{$column});

        $model->update([
            $column => null,
            'last_modified_date' => now(),
            'last_modified_by' => Auth::id(),
            'modified_count' => ((int) $model->modified_count) + 1,
        ]);

        DocumentKonfig::forgetCache();

        return new KonfigDokumenKResource($model->fresh()->loadMissing('lookup'));
    }

    private function findOrCreateForLookup(int $lookupId): KonfigDokumenK
    {
        $lookup = LookupM::query()
            ->notDeleted()
            ->active()
            ->byType(LookupTypes::KONFIG_DOKUMEN)
            ->where('lookup_id', $lookupId)
            ->first();

        if (! $lookup) {
            throw ValidationException::withMessages([
                'lookup_id' => ['Lookup konfig_dokumen tidak ditemukan atau tidak aktif.'],
            ]);
        }

        $model = KonfigDokumenK::query()
            ->notDeleted()
            ->where('lookup_id', $lookup->lookup_id)
            ->first();

        if ($model) {
            return $model;
        }

        $lookupPaper = LookupKonfigDokumenMeta::parse($lookup->additional_data);

        return KonfigDokumenK::query()->create([
            'lookup_id' => $lookup->lookup_id,
            'layout_mode' => DocumentHeaderStyle::LAYOUT_KOP_GANDA,
            'header_style' => DocumentHeaderStyle::defaults(),
            'paper_size' => $lookupPaper['paper_size'],
            'paper_orientation' => $lookupPaper['paper_orientation'],
            'apply_pdf' => true,
            'apply_excel' => true,
            'apply_csv' => false,
            'show_print_date' => true,
            'show_print_row_count' => true,
            'show_generated_by' => true,
            'show_user_signature' => false,
            'show_user_name' => false,
            'show_user_phone' => false,
            'created_date' => now(),
            'created_by' => Auth::id(),
            'modified_count' => 0,
            'is_deleted' => false,
            'is_active' => true,
        ]);
    }

    private function resolveAssetColumn(string $asset): string
    {
        return match ($asset) {
            'logo-kiri' => 'path_logo_kiri',
            'logo-kanan' => 'path_logo_kanan',
            default => throw new InvalidArgumentException('Jenis aset konfig dokumen tidak valid.'),
        };
    }

    private function deleteStoredAsset(?string $path): void
    {
        UploadStorage::delete($path, 'konfig/dokumen/');
    }

    private function prepare(array $data): array
    {
        unset($data['is_deleted'], $data['deleted_date'], $data['deleted_by'], $data['path_logo_kiri'], $data['path_logo_kanan']);

        if (array_key_exists('layout_mode', $data)) {
            $data['layout_mode'] = DocumentHeaderStyle::normalizeLayoutMode(
                is_string($data['layout_mode'] ?? null) ? $data['layout_mode'] : null,
            );
        }

        if (array_key_exists('header_style', $data)) {
            $style = is_array($data['header_style']) ? $data['header_style'] : [];
            unset($style['paper_size'], $style['paper_orientation']);
            $data['header_style'] = DocumentHeaderStyle::normalize($style);
        }

        if (array_key_exists('paper_size', $data)) {
            $data['paper_size'] = LookupKonfigDokumenMeta::normalizePaperSize($data['paper_size']);
        }

        if (array_key_exists('paper_orientation', $data)) {
            $data['paper_orientation'] = LookupKonfigDokumenMeta::normalizePaperOrientation(
                $data['paper_orientation'],
            );
        }

        if (array_key_exists('print_date_label', $data)) {
            $label = is_string($data['print_date_label']) ? trim($data['print_date_label']) : '';
            $data['print_date_label'] = $label !== '' ? $label : null;
        }

        return $data;
    }
}
