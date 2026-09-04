<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 18:10:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 18:10:00
 */

namespace App\Http\Requests;

class UpdateKegiatanJadwalRutinRequest extends StoreKegiatanJadwalRutinRequest
{
    public function rules(): array
    {
        $rules = $this->baseRules();
        foreach (['judul', 'frekuensi', 'scope_level', 'effective_from'] as $field) {
            if (isset($rules[$field][0]) && $rules[$field][0] === 'required') {
                $rules[$field][0] = 'sometimes';
            }
        }

        return $rules;
    }
}
