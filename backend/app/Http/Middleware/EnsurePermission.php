<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if ($user?->isSuperAdmin()) {
            return $next($request);
        }

        if (! $user || ! $user->hasPermission($permission)) {
            return ApiResponse::error('Akses ditolak.', null, 403);
        }

        return $next($request);
    }
}
