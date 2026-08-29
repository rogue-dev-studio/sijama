<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 16:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 16:10:00
 */

namespace App\Support;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class JamaahContactRules
{
    public static function prepareEmptyContacts(FormRequest $request): void
    {
        foreach (['no_hp', 'email'] as $field) {
            if ($request->has($field) && $request->input($field) === '') {
                $request->merge([$field => null]);
            }
        }
    }

    /** @return list<mixed> */
    public static function noHp(?int $jamaahId = null): array
    {
        $unique = Rule::unique('jamaah', 'no_hp')->whereNull('deleted_at');
        if ($jamaahId) {
            $unique->ignore($jamaahId);
        }

        return ['nullable', 'string', 'max:20', $unique];
    }

    /** @return list<mixed> */
    public static function email(?int $jamaahId = null): array
    {
        $jamaahUnique = Rule::unique('jamaah', 'email')->whereNull('deleted_at');
        if ($jamaahId) {
            $jamaahUnique->ignore($jamaahId);
        }

        $linkedUserId = $jamaahId
            ? User::query()->where('jamaah_id', $jamaahId)->value('id')
            : null;

        return [
            'nullable',
            'email',
            'max:255',
            $jamaahUnique,
            Rule::unique('users', 'email')->ignore($linkedUserId),
        ];
    }
}
