<?php

namespace App\Services;

use App\Models\File;
use Illuminate\Http\Request;

class FileService
{
    public function uploadFile(
        Request $request,
    ): File
    {
        $file = $request->file('file');

        // Stocke dans storage/app/public/uploads
        $path = $file->store('uploads', 'public');

        $file = File::create([
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'size' => $file->getSize(),
            'type' => $request->get('type'),
            'extension' => $file->getMimeType(),
        ]);

        return $file;
    }

    public function deleteFile(File $file)
    {
        $file->delete();
    }
}
