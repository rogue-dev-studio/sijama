<?php

/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 18:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-25 16:57:14
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DebugFaceEnrollController extends Controller
{
    private function assertDebugEnabled(): void
    {
        if (! config('app.debug')) {
            throw new NotFoundHttpException;
        }
    }

    private function logPath(): string
    {
        $dir = storage_path('logs');
        if (! File::isDirectory($dir)) {
            File::makeDirectory($dir, 0775, true);
        }

        return $dir.DIRECTORY_SEPARATOR.'face-enroll-debug.jsonl';
    }

    public function store(Request $request): JsonResponse
    {
        $this->assertDebugEnabled();

        $entries = $request->input('entries');
        if (! is_array($entries)) {
            $entries = [[
                't' => now()->toIso8601String(),
                'event' => (string) $request->input('event', 'log'),
                'data' => $request->input('data'),
                'jamaah_id' => $request->input('jamaah_id'),
            ]];
        }

        $path = $this->logPath();

        if ($request->boolean('clear')) {
            File::put($path, '');
        }

        $lines = [];
        foreach ($entries as $entry) {
            if (! is_array($entry)) {
                continue;
            }
            $entry['server_t'] = now()->toIso8601String();
            $lines[] = json_encode($entry, JSON_UNESCAPED_UNICODE);
        }

        if ($lines !== []) {
            File::append($path, implode(PHP_EOL, $lines).PHP_EOL);
        }

        return ApiResponse::success([
            'written' => count($lines),
            'path' => 'storage/logs/face-enroll-debug.jsonl',
            'exists' => File::exists($path),
            'bytes' => File::exists($path) ? File::size($path) : 0,
        ], 'Debug tercatat');
    }

    public function index(Request $request): JsonResponse
    {
        $this->assertDebugEnabled();

        $path = $this->logPath();
        if (! File::exists($path)) {
            return ApiResponse::success(['lines' => [], 'exists' => false], 'Belum ada log');
        }

        $limit = max(1, min(500, (int) $request->query('limit', 200)));
        $raw = File::get($path);
        $all = array_values(array_filter(preg_split("/\r\n|\n|\r/", $raw) ?: []));
        $slice = array_slice($all, -$limit);
        $lines = [];
        foreach ($slice as $line) {
            $decoded = json_decode($line, true);
            $lines[] = is_array($decoded) ? $decoded : ['raw' => $line];
        }

        return ApiResponse::success([
            'count' => count($lines),
            'path' => 'storage/logs/face-enroll-debug.jsonl',
            'exists' => true,
            'bytes' => File::size($path),
            'lines' => $lines,
        ]);
    }
}
