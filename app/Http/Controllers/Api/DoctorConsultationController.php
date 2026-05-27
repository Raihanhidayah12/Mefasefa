<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\DoctorConsultation;
use App\Models\InsurancePolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DoctorConsultationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Doctor consultations retrieved successfully.',
            'data' => DoctorConsultation::with(['user', 'messages', 'insurancePolicy'])->latest()->get(),
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'              => ['required', 'exists:users,id'],
            'insurance_policy_id'  => ['nullable', 'exists:insurance_policies,id'],
            'doctor_name'          => ['required', 'string', 'max:255'],
            'specialist_type'      => ['required', 'string', 'max:255'],
            'consultation_type'    => ['required', 'in:chat,call'],
            'payment_method'       => ['required', 'in:saldo_asuransi,transfer'],
            'session_duration_minutes' => ['sometimes', 'integer', 'min:1', 'max:240'],
        ]);

        $consultationPrice = 75000;

        // ── Saldo Asuransi ──────────────────────────────────────────────────
        if ($validated['payment_method'] === 'saldo_asuransi') {
            if (empty($validated['insurance_policy_id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pilih polis asuransi yang akan digunakan.',
                ], 422);
            }

            $policy = InsurancePolicy::findOrFail($validated['insurance_policy_id']);

            if ($policy->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Polis asuransi tidak aktif.',
                ], 422);
            }

            $usedAmount = $policy->claims()
                ->whereIn('status', ['approved', 'partial'])
                ->sum('claim_amount');

            $remaining = (float) $policy->coverage_limit - (float) $usedAmount;

            if ($consultationPrice > $remaining) {
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo asuransi tidak mencukupi. Sisa saldo: Rp ' . number_format($remaining, 0, ',', '.'),
                ], 422);
            }

            return DB::transaction(function () use ($validated, $consultationPrice) {
                $consultation = DoctorConsultation::create([
                    'user_id'                  => $validated['user_id'],
                    'insurance_policy_id'      => $validated['insurance_policy_id'],
                    'doctor_name'              => $validated['doctor_name'],
                    'specialist_type'          => $validated['specialist_type'],
                    'consultation_type'        => $validated['consultation_type'],
                    'payment_status'           => 'paid',
                    'payment_method'           => 'saldo_asuransi',
                    'session_duration_minutes' => $validated['session_duration_minutes'] ?? 45,
                    'status'                   => 'waiting_approval',
                ]);

                // Kurangi saldo asuransi otomatis
                Claim::create([
                    'user_id'             => $validated['user_id'],
                    'insurance_policy_id' => $validated['insurance_policy_id'],
                    'claim_amount'        => $consultationPrice,
                    'description'         => 'Klaim otomatis: Konsultasi dokter ' . $validated['doctor_name'] . ' (' . $validated['specialist_type'] . ')',
                    'status'              => 'approved',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Konsultasi berhasil dibuat. Saldo asuransi telah dikurangi Rp ' . number_format($consultationPrice, 0, ',', '.'),
                    'data'    => $consultation->load(['user', 'messages', 'insurancePolicy']),
                ], 201);
            });
        }

        // ── Transfer Bank ───────────────────────────────────────────────────
        // Buat konsultasi dengan payment_status pending, tunggu upload bukti
        $consultation = DoctorConsultation::create([
            'user_id'                  => $validated['user_id'],
            'insurance_policy_id'      => null,
            'doctor_name'              => $validated['doctor_name'],
            'specialist_type'          => $validated['specialist_type'],
            'consultation_type'        => $validated['consultation_type'],
            'payment_status'           => 'pending',
            'payment_method'           => 'transfer',
            'session_duration_minutes' => $validated['session_duration_minutes'] ?? 45,
            'status'                   => 'waiting_approval',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Konsultasi dibuat. Silakan upload bukti transfer untuk verifikasi.',
            'data'    => $consultation->load(['user', 'messages']),
        ], 201);
    }

    /**
     * Upload bukti transfer pembayaran
     */
    public function uploadProof(Request $request, string $id): JsonResponse
    {
        $consultation = DoctorConsultation::findOrFail($id);

        $request->validate([
            'payment_proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        if ($consultation->payment_proof_path) {
            Storage::disk('public')->delete($consultation->payment_proof_path);
        }

        $path = $request->file('payment_proof')->store('payment_proofs/consultations', 'public');

        $consultation->update([
            'payment_proof_path' => $path,
            'payment_status'     => 'pending', // tetap pending sampai admin verifikasi
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Bukti transfer berhasil diupload. Menunggu verifikasi admin.',
            'data'    => $consultation->fresh(['user', 'messages']),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $doctorConsultation = DoctorConsultation::with(['user', 'insurancePolicy'])->findOrFail($id);

        return response()->json([
            'message' => 'Doctor consultation retrieved successfully.',
            'data' => $doctorConsultation,
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $doctorConsultation = DoctorConsultation::findOrFail($id);

        $validated = $request->validate([
            'user_id'              => ['sometimes', 'exists:users,id'],
            'doctor_name'          => ['sometimes', 'string', 'max:255'],
            'specialist_type'      => ['sometimes', 'string', 'max:255'],
            'consultation_type'    => ['sometimes', 'in:chat,call'],
            'payment_status'       => ['sometimes', 'in:pending,paid,failed'],
            'session_duration_minutes' => ['sometimes', 'integer', 'min:1', 'max:240'],
            'status'               => ['sometimes', 'in:waiting_approval,approved,rejected,completed'],
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
        if ($doctorConsultation->payment_proof_path) {
            Storage::disk('public')->delete($doctorConsultation->payment_proof_path);
        }
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
            'sender'  => ['required', 'in:user,admin'],
            'message' => ['required', 'string'],
        ]);

        $message = $doctorConsultation->messages()->create($validated);

        return response()->json([
            'message' => 'Message sent successfully.',
            'data'    => $message,
        ], 201);
    }
}
