<?php

namespace App\Http\Middleware;

use App\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $user?->loadMissing('dapukan');

        if (! $user || ! $user->dapukan || ! in_array($user->dapukan->slug, $roles, true)) {
            return ApiResponse::error('Akses ditolak.', null, 403);
        }

        return $next($request);
    }
}
