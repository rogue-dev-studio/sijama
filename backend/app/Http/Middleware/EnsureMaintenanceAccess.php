<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-29 17:00:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-29 17:00:00
 */

namespace App\Http\Middleware;

use App\Support\SystemKonfig;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

class EnsureMaintenanceAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $konfig = SystemKonfig::active();

        if (! $konfig?->maintenance_mode) {
            return $next($request);
        }

        $user = $request->user();

        if ($user?->isSuperAdmin()) {
            return $next($request);
        }

        if ($request->is('api/logout') && $request->isMethod('POST')) {
            return $next($request);
        }

        $message = filled($konfig->maintenance_message)
            ? (string) $konfig->maintenance_message
            : 'Aplikasi sedang dalam maintenance.';

        throw new ServiceUnavailableHttpException(null, $message);
    }
}
