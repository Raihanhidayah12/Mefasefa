<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceRegistration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceRegistrationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->query('user_id');
        $query = ServiceRegistration::with(['user', 'hospital', 'insurancePolicy', 'healthService'])->latest();
        
        if ($userId) {
            $query->where('user_id', $userId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Service registrations retrieved successfully.',
            'data' => $query->get(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'             => ['required', 'exists:users,id'],
            'hospital_id'         => ['nullable', 'exists:hospitals,id'],
            'insurance_policy_id' => ['nullable', 'exists:insurance_policies,id'],
            'health_service_id'   => ['required', 'exists:health_services,id'],
            'service_type'        => ['required', 'string', 'max:100'],
            'service_name'        => ['required', 'string', 'max:255'],
            'schedule_date'       => ['required', 'date'],
            'schedule_time'       => ['required', 'string', 'max:100'],
            'price'               => ['required', 'numeric', 'min:0'],
            'queue_number'        => ['required', 'string', 'max:100'],
            'barcode_data'        => ['required', 'string', 'max:255'],
            'notes'               => ['nullable', 'string', 'max:1000'],
            'status'              => ['sometimes', 'in:registered,completed,canceled'],
        ]);

        $serviceRegistration = ServiceRegistration::create([
            'user_id'             => $validated['user_id'],
            'hospital_id'         => $validated['hospital_id'] ?? null,
            'insurance_policy_id' => $validated['insurance_policy_id'] ?? null,
            'health_service_id'   => $validated['health_service_id'],
            'service_type'        => $validated['service_type'],
            'service_name'        => $validated['service_name'],
            'schedule_date'       => $validated['schedule_date'],
            'schedule_time'       => $validated['schedule_time'],
            'price'               => $validated['price'],
            'queue_number'        => $validated['queue_number'],
            'barcode_data'        => $validated['barcode_data'],
            'notes'               => $validated['notes'] ?? null,
            'status'              => $validated['status'] ?? 'registered',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Service registration created successfully.',
            'data' => $serviceRegistration->load(['hospital', 'insurancePolicy', 'healthService']),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $serviceRegistration = ServiceRegistration::with(['user', 'hospital', 'insurancePolicy', 'healthService'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Service registration retrieved successfully.',
            'data' => $serviceRegistration,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $serviceRegistration = ServiceRegistration::findOrFail($id);

        $validated = $request->validate([
            'user_id'             => ['sometimes', 'exists:users,id'],
            'hospital_id'         => ['sometimes', 'nullable', 'exists:hospitals,id'],
            'insurance_policy_id' => ['sometimes', 'nullable', 'exists:insurance_policies,id'],
            'health_service_id'   => ['sometimes', 'exists:health_services,id'],
            'service_type'        => ['sometimes', 'string', 'max:100'],
            'service_name'        => ['sometimes', 'string', 'max:255'],
            'schedule_date'       => ['sometimes', 'date'],
            'schedule_time'       => ['sometimes', 'string', 'max:100'],
            'price'               => ['sometimes', 'numeric', 'min:0'],
            'queue_number'        => ['sometimes', 'string', 'max:100'],
            'barcode_data'        => ['sometimes', 'string', 'max:255'],
            'notes'               => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status'              => ['sometimes', 'in:registered,completed,canceled'],
        ]);

        $serviceRegistration->fill($validated)->save();

        return response()->json([
            'success' => true,
            'message' => 'Service registration updated successfully.',
            'data' => $serviceRegistration->fresh(['user', 'hospital', 'insurancePolicy', 'healthService']),
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $serviceRegistration = ServiceRegistration::findOrFail($id);
        $serviceRegistration->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service registration deleted successfully.',
        ], 200);
    }
}
