<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DoctorConsultation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorConsultationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Doctor consultations retrieved successfully.',
            'data' => DoctorConsultation::with('user')->latest()->get(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'doctor_name' => ['required', 'string', 'max:255'],
            'specialist_type' => ['required', 'string', 'max:255'],
            'consultation_type' => ['required', 'in:chat,call'],
            'payment_status' => ['required', 'in:pending,paid'],
            'session_duration_minutes' => ['sometimes', 'integer', 'min:1', 'max:240'],
            'status' => ['sometimes', 'in:waiting_approval,approved,rejected,completed'],
        ]);

        $doctorConsultation = DoctorConsultation::create([
            'user_id' => $validated['user_id'],
            'doctor_name' => $validated['doctor_name'],
            'specialist_type' => $validated['specialist_type'],
            'consultation_type' => $validated['consultation_type'],
            'payment_status' => $validated['payment_status'],
            'session_duration_minutes' => $validated['session_duration_minutes'] ?? 45,
            'status' => $validated['status'] ?? 'waiting_approval',
        ]);

        return response()->json([
            'message' => 'Doctor consultation created successfully.',
            'data' => $doctorConsultation,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $doctorConsultation = DoctorConsultation::with('user')->findOrFail($id);

        return response()->json([
            'message' => 'Doctor consultation retrieved successfully.',
            'data' => $doctorConsultation,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $doctorConsultation = DoctorConsultation::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['sometimes', 'exists:users,id'],
            'doctor_name' => ['sometimes', 'string', 'max:255'],
            'specialist_type' => ['sometimes', 'string', 'max:255'],
            'consultation_type' => ['sometimes', 'in:chat,call'],
            'payment_status' => ['sometimes', 'in:pending,paid'],
            'session_duration_minutes' => ['sometimes', 'integer', 'min:1', 'max:240'],
            'status' => ['sometimes', 'in:waiting_approval,approved,rejected,completed'],
        ]);

        $doctorConsultation->fill($validated)->save();

        return response()->json([
            'message' => 'Doctor consultation updated successfully.',
            'data' => $doctorConsultation->fresh('user'),
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $doctorConsultation = DoctorConsultation::findOrFail($id);
        $doctorConsultation->delete();

        return response()->json([
            'message' => 'Doctor consultation deleted successfully.',
        ], 200);
    }

    public function getMessages(string $id): JsonResponse
    {
        $doctorConsultation = DoctorConsultation::findOrFail($id);
        
        return response()->json([
            'message' => 'Messages retrieved successfully.',
            'data' => $doctorConsultation->messages()->oldest()->get(),
        ], 200);
    }

    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $doctorConsultation = DoctorConsultation::findOrFail($id);

        $validated = $request->validate([
            'sender' => ['required', 'in:user,admin'],
            'message' => ['required', 'string'],
        ]);

        $message = $doctorConsultation->messages()->create($validated);

        return response()->json([
            'message' => 'Message sent successfully.',
            'data' => $message,
        ], 201);
    }
}
