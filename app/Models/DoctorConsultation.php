<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorConsultation extends Model
{
    protected $fillable = [
        'user_id',
        'doctor_name',
        'specialist_type',
        'consultation_type',
        'payment_status',
        'session_duration_minutes',
        'status',
    ];

    protected $casts = [
        'session_duration_minutes' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(ConsultationMessage::class);
    }
}
