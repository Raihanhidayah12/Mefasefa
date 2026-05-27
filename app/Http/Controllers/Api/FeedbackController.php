<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Feedback retrieved successfully.',
            'data' => Feedback::with('user')->latest()->get(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'category' => ['required', 'in:layanan,kecepatan_klaim,kemudahan_akses'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'content' => ['required', 'string', 'max:5000'],
        ]);

        $feedback = Feedback::create($validated);

        return response()->json([
            'message' => 'Feedback created successfully.',
            'data' => $feedback,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $feedback = Feedback::with('user')->findOrFail($id);

        return response()->json([
            'message' => 'Feedback retrieved successfully.',
            'data' => $feedback,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $feedback = Feedback::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['sometimes', 'exists:users,id'],
            'category' => ['sometimes', 'in:layanan,kecepatan_klaim,kemudahan_akses'],
            'rating' => ['sometimes', 'integer', 'between:1,5'],
            'content' => ['sometimes', 'string', 'max:5000'],
        ]);

        $feedback->fill($validated)->save();

        return response()->json([
            'message' => 'Feedback updated successfully.',
            'data' => $feedback->fresh('user'),
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();

        return response()->json([
            'message' => 'Feedback deleted successfully.',
        ], 200);
    }
}
