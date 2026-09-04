<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-04 16:55:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-04 16:55:00
 */

namespace App\Services;

use App\Models\AppPoll;
use App\Models\AppPollOption;
use App\Models\AppPollVote;
use App\Models\User;
use App\Support\PaginationHelper;
use App\Support\SortHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AppPollService
{
    public function listActive(?User $user = null): Collection
    {
        $now = now();

        $polls = AppPoll::query()
            ->with(['options'])
            ->withCount('votes')
            ->where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->orderByDesc('created_at')
            ->get();

        if ($user) {
            $votes = AppPollVote::query()
                ->where('user_id', $user->id)
                ->whereIn('poll_id', $polls->pluck('id'))
                ->get()
                ->keyBy('poll_id');

            $polls->each(function (AppPoll $poll) use ($votes) {
                $poll->setAttribute('my_vote', $votes->get($poll->id));
            });
        }

        return $polls;
    }

    public function vote(int $pollId, int $optionId, User $user): AppPollVote
    {
        $poll = AppPoll::query()->find($pollId);
        if (! $poll) {
            throw new ModelNotFoundException('Polling tidak ditemukan.');
        }

        if (! $this->isCurrentlyActive($poll)) {
            throw ValidationException::withMessages([
                'poll_id' => ['Polling tidak aktif.'],
            ]);
        }

        $option = AppPollOption::query()
            ->where('poll_id', $pollId)
            ->where('id', $optionId)
            ->first();

        if (! $option) {
            throw ValidationException::withMessages([
                'option_id' => ['Opsi polling tidak valid.'],
            ]);
        }

        if (AppPollVote::query()->where('poll_id', $pollId)->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages([
                'poll_id' => ['Anda sudah memberikan suara pada polling ini.'],
            ]);
        }

        return AppPollVote::query()->create([
            'poll_id' => $pollId,
            'option_id' => $optionId,
            'user_id' => $user->id,
        ]);
    }

    public function listAdmin(
        ?string $q = null,
        ?bool $isActive = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $sortBy = null,
        ?string $sortDir = null,
    ): LengthAwarePaginator {
        $builder = AppPoll::query()
            ->with(['creator:id,name,username'])
            ->withCount('votes')
            ->with(['options' => function ($query) {
                $query->withCount('votes');
            }]);

        if ($isActive !== null) {
            $builder->where('is_active', $isActive);
        }

        if (filled($q)) {
            $term = '%'.trim($q).'%';
            $builder->where(function ($query) use ($term) {
                $query->where('title', 'ilike', $term)
                    ->orWhere('description', 'ilike', $term);
            });
        }

        SortHelper::apply(
            $builder,
            $sortBy,
            $sortDir,
            ['created_at', 'title', 'is_active', 'starts_at', 'ends_at'],
            'created_at',
            'desc',
        );

        return PaginationHelper::paginate($builder, $perPage, $page);
    }

    /**
     * @param  array{title: string, description?: string|null, is_active?: bool, starts_at?: string|null, ends_at?: string|null, options: list<array{label: string, urutan?: int}>}  $data
     */
    public function store(array $data, User $user): AppPoll
    {
        $title = trim((string) ($data['title'] ?? ''));
        if ($title === '') {
            throw ValidationException::withMessages([
                'title' => ['Judul polling wajib diisi.'],
            ]);
        }

        $options = $data['options'] ?? [];
        if (! is_array($options) || count($options) < 2) {
            throw ValidationException::withMessages([
                'options' => ['Polling minimal memiliki 2 opsi.'],
            ]);
        }

        return DB::transaction(function () use ($data, $user, $title, $options) {
            $poll = AppPoll::query()->create([
                'title' => $title,
                'description' => filled($data['description'] ?? null) ? trim((string) $data['description']) : null,
                'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true,
                'starts_at' => $data['starts_at'] ?? null,
                'ends_at' => $data['ends_at'] ?? null,
                'created_by' => $user->id,
            ]);

            $this->syncOptions($poll, $options);

            return $poll->load(['options', 'creator:id,name,username'])->loadCount('votes');
        });
    }

    /**
     * @param  array{title?: string, description?: string|null, is_active?: bool, starts_at?: string|null, ends_at?: string|null, options?: list<array{id?: int, label: string, urutan?: int}>}  $data
     */
    public function update(int $id, array $data): AppPoll
    {
        $poll = AppPoll::query()->find($id);
        if (! $poll) {
            throw new ModelNotFoundException('Polling tidak ditemukan.');
        }

        return DB::transaction(function () use ($poll, $data) {
            if (array_key_exists('title', $data)) {
                $title = trim((string) $data['title']);
                if ($title === '') {
                    throw ValidationException::withMessages([
                        'title' => ['Judul polling wajib diisi.'],
                    ]);
                }
                $poll->title = $title;
            }

            if (array_key_exists('description', $data)) {
                $poll->description = filled($data['description']) ? trim((string) $data['description']) : null;
            }

            if (array_key_exists('is_active', $data)) {
                $poll->is_active = (bool) $data['is_active'];
            }

            if (array_key_exists('starts_at', $data)) {
                $poll->starts_at = $data['starts_at'];
            }

            if (array_key_exists('ends_at', $data)) {
                $poll->ends_at = $data['ends_at'];
            }

            $poll->save();

            if (array_key_exists('options', $data)) {
                $options = $data['options'] ?? [];
                if (! is_array($options) || count($options) < 2) {
                    throw ValidationException::withMessages([
                        'options' => ['Polling minimal memiliki 2 opsi.'],
                    ]);
                }
                $this->syncOptions($poll, $options);
            }

            return $poll->fresh(['options', 'creator:id,name,username'])->loadCount('votes')->load(['options' => function ($query) {
                $query->withCount('votes');
            }]);
        });
    }

    /**
     * @param  list<array{id?: int, label: string, urutan?: int}>  $options
     */
    private function syncOptions(AppPoll $poll, array $options): void
    {
        $keepIds = [];
        foreach (array_values($options) as $index => $option) {
            $label = trim((string) ($option['label'] ?? ''));
            if ($label === '') {
                throw ValidationException::withMessages([
                    'options' => ['Label opsi wajib diisi.'],
                ]);
            }

            $urutan = array_key_exists('urutan', $option) ? (int) $option['urutan'] : $index + 1;
            $optionId = isset($option['id']) ? (int) $option['id'] : null;

            if ($optionId) {
                $existing = AppPollOption::query()
                    ->where('poll_id', $poll->id)
                    ->where('id', $optionId)
                    ->first();
                if (! $existing) {
                    throw ValidationException::withMessages([
                        'options' => ['Opsi polling tidak valid.'],
                    ]);
                }
                $existing->fill(['label' => $label, 'urutan' => $urutan])->save();
                $keepIds[] = $existing->id;
                continue;
            }

            $created = AppPollOption::query()->create([
                'poll_id' => $poll->id,
                'label' => $label,
                'urutan' => $urutan,
            ]);
            $keepIds[] = $created->id;
        }

        $removable = AppPollOption::query()
            ->where('poll_id', $poll->id)
            ->whereNotIn('id', $keepIds)
            ->get();

        foreach ($removable as $option) {
            if ($option->votes()->exists()) {
                throw ValidationException::withMessages([
                    'options' => ['Opsi yang sudah memiliki suara tidak dapat dihapus.'],
                ]);
            }
            $option->delete();
        }
    }

    private function isCurrentlyActive(AppPoll $poll): bool
    {
        if (! $poll->is_active) {
            return false;
        }

        $now = now();
        if ($poll->starts_at && $poll->starts_at->gt($now)) {
            return false;
        }
        if ($poll->ends_at && $poll->ends_at->lt($now)) {
            return false;
        }

        return true;
    }
}
