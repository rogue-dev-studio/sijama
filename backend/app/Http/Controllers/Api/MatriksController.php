<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateMatriksRequest;
use App\Http\Responses\ApiResponse;
use App\Services\MatriksService;
use Illuminate\Http\JsonResponse;

class MatriksController extends Controller
{
    public function __construct(private readonly MatriksService $matriksService) {}

    public function index(): JsonResponse
    {
        return ApiResponse::success($this->matriksService->show());
    }

    public function update(UpdateMatriksRequest $request, int $dapukan): JsonResponse
    {
        $updated = $this->matriksService->update($dapukan, $request->validated('hak_akses_ids'));

        return ApiResponse::success($updated, 'Matriks akses berhasil diperbarui');
    }
}
