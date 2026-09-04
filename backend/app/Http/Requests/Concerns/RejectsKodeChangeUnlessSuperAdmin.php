<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-09-02 14:45:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-09-02 14:50:00
 */

namespace App\Http\Requests\Concerns;

trait RejectsKodeChangeUnlessSuperAdmin
{
    abstract protected function columnPermissionPrefix(): string;

    /**
     * @param  array-key|null  $key
     * @return ($key is null ? array<string, mixed> : mixed)
     */
    public function validated($key = null, $default = null): mixed
    {
        $data = parent::validated($key, $default);

        if ($key !== null || ! is_array($data)) {
            return $data;
        }

        $user = $this->user();
        if ($user?->isSuperAdmin() || $user?->hasPermission($this->columnPermissionPrefix().'.col.kode.update')) {
            return $data;
        }

        unset($data['kode']);

        return $data;
    }
}
