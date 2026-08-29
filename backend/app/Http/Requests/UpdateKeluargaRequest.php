<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

namespace App\Http\Requests;

class UpdateKeluargaRequest extends StoreKeluargaRequest
{
    public function rules(): array
    {
        return $this->baseRules();
    }
}
