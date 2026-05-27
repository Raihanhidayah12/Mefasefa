<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    protected $table = 'feedbacks';

    protected $fillable = [
        'user_id',
        'category',
        'rating',
        'content',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
