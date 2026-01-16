<?php

namespace App\Http\Controllers;

use App\Models\File;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function __construct(
        private readonly FileService $fileService
    )
    {
    }

    public function storeFile(
        Request $request
    )
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:4096', // 4MB max
        ]);

        $file = $this->fileService->uploadFile($request);

        return response()->json([
            'message' => 'Fichier uploadé avec succès',
            'data' => $file
        ], 201);
    }

    public function getFiles(): JsonResponse
    {
        $files = File::all();

        return response()->json($files);
    }

    public function deleteFile(
        File $file,
    ): JsonResponse
    {
        $path = $file->path;
        if (!Storage::disk('public')->exists($path)) {
            return response()->json([
                'message' => 'Fichier non trouvé',
            ], 404);
        }

        try {
            $this->fileService->deleteFile($file);
        } catch (\Exception $exception) {
            return response()->json([
                'message' => 'Impossible de supprimer le fichier',
            ], 400);
        }

        Storage::disk('public')->delete($path);

        return response()->json([
            'message' => 'Fichier supprimé avec succès',
        ], 200);
    }
}
