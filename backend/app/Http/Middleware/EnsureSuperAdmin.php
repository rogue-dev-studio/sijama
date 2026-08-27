<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-27 10:48:42
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-27 10:48:42
 */

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $user?->loadMissing('dapukan');

        if (! $user || ! $user->isSuperAdmin()) {
            return ApiResponse::error('Hanya Super Admin yang dapat mengakses.', null, 403);
        }

        return $next($request);
    }
}
