<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-31 14:25:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-31 14:25:00
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PublicMediaHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Cross-Origin-Resource-Policy', 'cross-origin');
        $response->headers->set('Timing-Allow-Origin', '*');

        return $response;
    }
}
