<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    protected $table = 'file';
    protected $fillable = [
        'name',
        'path',
        'size',
        'type',
        'extension',
    ];

    protected $casts = [
        "created_at" => "datetime",
        "updated_at" => "datetime",
        'size' => 'integer',
    ];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return config('app.url') . Storage::url($this->path);
    }
}
