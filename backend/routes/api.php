<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FileController;

Route::post('/upload', [FileController::class, 'storeFile']);
Route::get('/files', [FileController::class, 'getFiles']);
Route::delete('/file/{file}', [FileController::class, 'deleteFile']);

