/**
 * @Author: rogue-dev-studio
 * @Date: 2026-08-04 18:50:00
 * @Last Modified by: rogue-dev-studio
 * @Last Modified time: 2026-08-04 19:00:00
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class DebugFaceEnrollController extends Controller
{
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

        return response()->json([
            'success' => true,
            'message' => 'Debug tercatat',
            'data' => [
                'written' => count($lines),
                'path' => 'storage/logs/face-enroll-debug.jsonl',
                'exists' => File::exists($path),
                'bytes' => File::exists($path) ? File::size($path) : 0,
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $path = $this->logPath();
        if (! File::exists($path)) {
            return response()->json([
                'success' => true,
                'message' => 'Belum ada log',
                'data' => ['lines' => [], 'exists' => false],
            ]);
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

        return response()->json([
            'success' => true,
            'message' => 'OK',
            'data' => [
                'count' => count($lines),
                'path' => 'storage/logs/face-enroll-debug.jsonl',
                'exists' => true,
                'bytes' => File::size($path),
                'lines' => $lines,
            ],
        ]);
    }
}
