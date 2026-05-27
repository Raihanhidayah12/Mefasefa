<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InsurancePolicy;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InsurancePolicyController extends Controller
{
    public function myPolicies(Request $request): JsonResponse
    {
        $user = \Illuminate\Support\Facades\Auth::user();

        if (!$user) {
            $userId = $request->query('user_id');
            if (!$userId) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            $user = \App\Models\User::query()->find($userId);
            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }
        }

        $policies = InsurancePolicy::query()
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'message' => 'User policies retrieved successfully.',
            'data'    => $policies,
        ], 200);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Insurance policies retrieved successfully.',
            'data' => InsurancePolicy::query()->orderByDesc('id')->get(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'policy_number' => ['required', 'string', 'max:255', 'unique:insurance_policies,policy_number'],
            'insurance_type' => ['required', 'in:jiwa,kesehatan,kendaraan'],
            'insured_name' => ['required', 'string', 'max:255'],
            'premium_amount' => ['required', 'numeric', 'min:0'],
            'coverage_limit' => ['sometimes', 'numeric', 'min:0'],
            'start_date' => ['sometimes', 'nullable', 'date'],
            'end_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'in:active,inactive'],
            'payment_method' => ['sometimes', 'nullable', 'in:Transfer Bank,GoPay / OVO,Dana / ShopeePay,Alfamart / Indomaret'],
            'payment_proof' => ['sometimes', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
        ]);

        $paymentProofPath = null;
        if ($request->hasFile('payment_proof')) {
            $paymentProofPath = $this->uploadFile($request->file('payment_proof'));
        }

        $paymentStatus = null;
        $policyStatus = $validated['status'] ?? 'active';
        if (! empty($validated['payment_method']) || $paymentProofPath) {
            $paymentStatus = 'pending';
            $policyStatus = 'inactive';
        }

        $insurancePolicy = InsurancePolicy::create([
            'user_id' => $validated['user_id'],
            'policy_number' => $validated['policy_number'],
            'insurance_type' => $validated['insurance_type'],
            'insured_name' => $validated['insured_name'],
            'premium_amount' => $validated['premium_amount'],
            'coverage_limit' => $validated['coverage_limit'] ?? 100000000,
            'start_date' => $validated['start_date'] ?? now()->toDateString(),
            'end_date' => $validated['end_date'] ?? now()->addYear()->toDateString(),
            'status' => $policyStatus,
            'payment_method' => $validated['payment_method'] ?? null,
            'payment_proof_path' => $paymentProofPath,
            'payment_status' => $paymentStatus,
        ]);

        return response()->json([
            'message' => 'Insurance policy created successfully.',
            'data'    => $insurancePolicy,
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $insurancePolicy = InsurancePolicy::findOrFail($id);

        return response()->json([
            'message' => 'Insurance policy retrieved successfully.',
            'data' => $insurancePolicy,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $insurancePolicy = InsurancePolicy::findOrFail($id);

        $validated = $request->validate([
            'user_id' => ['sometimes', 'exists:users,id'],
            'policy_number' => ['sometimes', 'string', 'max:255', 'unique:insurance_policies,policy_number,' . $insurancePolicy->id],
            'insurance_type' => ['sometimes', 'in:jiwa,kesehatan,kendaraan'],
            'insured_name' => ['sometimes', 'string', 'max:255'],
            'premium_amount' => ['sometimes', 'numeric', 'min:0', 'regex:/^\d+(\.\d{1,2})?$/' ],
            'status' => ['sometimes', 'in:active,inactive'],
            'payment_method' => ['sometimes', 'nullable', 'in:Transfer Bank,GoPay / OVO,Dana / ShopeePay,Alfamart / Indomaret'],
            'payment_proof' => ['sometimes', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'payment_status' => ['sometimes', 'nullable', 'in:pending,verified,rejected'],
        ]);

        if ($request->hasFile('payment_proof')) {
            $validated['payment_proof_path'] = $this->uploadFile($request->file('payment_proof'));
        }

        if (array_key_exists('payment_status', $validated) && $validated['payment_status'] === 'verified') {
            $validated['status'] = 'active';
        }

        $previousStatus = $insurancePolicy->status;
        $insurancePolicy->fill($validated)->save();

        if ($insurancePolicy->payment_status === 'verified' && $previousStatus !== 'active') {
            Transaction::create([
                'user_id' => $insurancePolicy->user_id,
                'insurance_policy_id' => $insurancePolicy->id,
                'transaction_type' => 'premi_masuk',
                'amount' => $insurancePolicy->premium_amount,
                'transaction_date' => now(),
                'status' => 'success',
            ]);
        }

        return response()->json([
            'message' => 'Insurance policy updated successfully.',
            'data' => $insurancePolicy->fresh(),
        ], 200);
    }

    public function destroy(string $id): JsonResponse
    {
        $insurancePolicy = InsurancePolicy::findOrFail($id);
        $insurancePolicy->delete();

        return response()->json([
            'message' => 'Insurance policy deleted successfully.',
        ], 200);
    }

    private function uploadFile($file): string
    {
        $directory = public_path('payments');

        if (! is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $file->move($directory, $filename);

        return 'payments/' . $filename;
    }
}
