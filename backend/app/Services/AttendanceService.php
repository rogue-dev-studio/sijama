<?php

namespace App\Services;

use App\DTOs\CheckInData;
use App\DTOs\OpenSessionData;
use App\Http\Resources\AttendanceResource;
use App\Http\Resources\AttendanceSessionResource;
use App\Models\Attendance;
use App\Models\AttendanceSession;
use App\Models\Jamaah;
use App\Models\Kegiatan;
use App\Models\KategoriKegiatan;
use App\Models\User;
use App\Support\PaginationHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    public function __construct(private readonly ScopeService $scopeService) {}

    public function openSession(OpenSessionData $data, User $user): AttendanceSessionResource
    {
        $this->validateReference($data->type, $data->refId);

        $session = AttendanceSession::create([
            'type' => $data->type,
            'ref_id' => $data->refId,
            'title' => $data->title,
            'opened_by' => $user->id,
            'opened_at' => now(),
            'status' => 'open',
        ]);

        return new AttendanceSessionResource($session);
    }

    public function closeSession(int $sessionId, User $user): AttendanceSessionResource
    {
        $session = $this->findSession($sessionId);

        if ($session->opened_by !== $user->id && ! $user->isSuperAdmin()) {
            throw ValidationException::withMessages([
                'session' => ['Anda tidak berhak menutup sesi absensi ini.'],
            ]);
        }

        if ($session->status === 'closed') {
            throw ValidationException::withMessages([
                'session' => ['Sesi absensi sudah ditutup.'],
            ]);
        }

        $session->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return new AttendanceSessionResource($session->fresh());
    }

    public function checkIn(int $sessionId, CheckInData $data, User $user): AttendanceResource
    {
        $session = $this->findSession($sessionId);

        if ($session->status !== 'open') {
            throw ValidationException::withMessages([
                'session' => ['Sesi absensi tidak aktif.'],
            ]);
        }

        $jamaah = Jamaah::find($data->jamaahId);

        if (! $jamaah) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Jamaah tidak ditemukan.'],
            ]);
        }

        $this->scopeService->assertJamaahInScope($user, $jamaah);

        if (Attendance::where('session_id', $sessionId)->where('jamaah_id', $data->jamaahId)->exists()) {
            throw ValidationException::withMessages([
                'jamaah_id' => ['Jamaah sudah tercatat hadir pada sesi ini.'],
            ]);
        }

        $attendance = Attendance::create([
            'session_id' => $sessionId,
            'jamaah_id' => $data->jamaahId,
            'method' => $data->method,
            'matched_distance' => $data->matchedDistance,
            'recorded_by' => $user->id,
            'recorded_at' => now(),
        ]);

        return new AttendanceResource($attendance->load('jamaah'));
    }

    public function showSession(int $sessionId, User $user): AttendanceSessionResource
    {
        $session = AttendanceSession::with(['attendances.jamaah.wilayahFungKelompok.wilayahFungDesa'])
            ->withCount('attendances')
            ->find($sessionId);

        if (! $session) {
            throw new ModelNotFoundException('Sesi absensi tidak ditemukan.');
        }

        $session->setRelation(
            'attendances',
            $session->attendances->filter(function (Attendance $attendance) use ($user) {
                if (! $attendance->jamaah) {
                    return false;
                }

                try {
                    $this->scopeService->assertJamaahInScope($user, $attendance->jamaah);

                    return true;
                } catch (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException) {
                    return false;
                }
            })->values()
        );

        return new AttendanceSessionResource($session);
    }

    public function listSessions(
        User $user,
        ?string $status = null,
        ?int $perPage = null,
        ?int $page = null,
        ?string $dateFrom = null,
        ?string $dateTo = null,
    ): LengthAwarePaginator {
        $query = AttendanceSession::query()
            ->withCount('attendances')
            ->orderByDesc('opened_at')
            ->where(function ($builder) use ($user) {
                $builder
                    ->where('opened_by', $user->id)
                    ->orWhereHas('attendances.jamaah', fn ($jamaahQuery) => $this->scopeService->applyJamaahScope($jamaahQuery, $user));
            });

        if ($status) {
            $query->where('status', $status);
        }

        if ($dateFrom !== null && $dateFrom !== '') {
            $query->whereDate('opened_at', '>=', $dateFrom);
        }

        if ($dateTo !== null && $dateTo !== '') {
            $query->whereDate('opened_at', '<=', $dateTo);
        }

        return PaginationHelper::paginate($query, $perPage, $page);
    }

    private function findSession(int $sessionId): AttendanceSession
    {
        $session = AttendanceSession::find($sessionId);

        if (! $session) {
            throw new ModelNotFoundException('Sesi absensi tidak ditemukan.');
        }

        return $session;
    }

    private function validateReference(string $type, int $refId): void
    {
        $exists = $type === 'kegiatan' && Kegiatan::whereKey($refId)->exists();

        if (! $exists) {
            throw ValidationException::withMessages([
                'ref_id' => ['Referensi tidak ditemukan untuk tipe yang dipilih.'],
            ]);
        }
    }
}
