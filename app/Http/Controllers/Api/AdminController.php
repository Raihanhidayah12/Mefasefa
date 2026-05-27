<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Claim;
use App\Models\DoctorConsultation;
use App\Models\Feedback;
use App\Models\Hospital;
use App\Models\HospitalRegistration;
use App\Models\InsurancePackage;
use App\Models\InsurancePolicy;
use App\Models\ServiceRegistration;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // ─── OVERVIEW / STATS ────────────────────────────────────────────────────

    public function stats(): JsonResponse
    {
        $totalUsers        = User::where('role', 'pengguna')->count();
        $totalPolicies     = InsurancePolicy::count();
        $activePolicies    = InsurancePolicy::where('status', 'active')->count();
        $pendingClaims     = Claim::where('status', 'pending')->count();
        $totalClaims       = Claim::count();
        $totalTransactions = Transaction::count();
        $automaticInsuranceClaimCount = Claim::where('status', 'approved')
            ->where('description', 'like', 'Klaim otomatis:%')
            ->count();
        $totalTransactions += $automaticInsuranceClaimCount;

        $totalRevenue = Transaction::where('transaction_type', 'premi_masuk')
                                ->where('status', 'success')
                                ->sum('amount');

        // Include premium amounts from verified policies that may not have a
        // corresponding `premi_masuk` Transaction record (e.g. verified via
        // admin panel or fixtures). This ensures dashboard shows expected
        // premi income even if the Transaction row wasn't created.
        $premiumFromVerifiedPolicies = InsurancePolicy::where('payment_status', 'verified')
            ->sum('premium_amount');
        $totalRevenue += $premiumFromVerifiedPolicies;

        $totalPayout = Transaction::where('transaction_type', 'klaim_keluar')
                                ->where('status', 'success')
                                ->sum('amount');
        $automaticInsurancePayout = Claim::where('status', 'approved')
            ->where('description', 'like', 'Klaim otomatis:%')
            ->sum('claim_amount');
        $totalPayout += $automaticInsurancePayout;
        $pendingPolicies = InsurancePolicy::where('payment_status', 'pending')->count();
        $pendingConsultations = DoctorConsultation::where('payment_status', 'pending')->count();
        $pendingTransactions = Transaction::where('status', 'pending')->count();

        // Aggregate all sources that represent payments waiting verification
        $pendingPayments   = $pendingPolicies + $pendingConsultations + $pendingTransactions;
        $totalHospitals    = Hospital::count();
        $totalConsultations = DoctorConsultation::count();
        $avgRating         = Feedback::avg('rating') ?? 0;

        // Monthly revenue (last 6 months) — uses substr() which works on SQLite & MySQL
        $monthlyRevenue = Transaction::select(
                DB::raw("substr(transaction_date, 1, 7) as month"),
                DB::raw('SUM(CASE WHEN transaction_type = "premi_masuk" THEN amount ELSE 0 END) as revenue'),
                DB::raw('SUM(CASE WHEN transaction_type = "klaim_keluar" THEN amount ELSE 0 END) as payout')
            )
            ->where('status', 'success')
            ->where('transaction_date', '>=', now()->subMonths(6)->toDateTimeString())
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // Claims by status
        $claimsByStatus = Claim::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        // Policies by type
        $policiesByType = InsurancePolicy::select('insurance_type', DB::raw('count(*) as total'))
            ->groupBy('insurance_type')
            ->get()
            ->pluck('total', 'insurance_type');

        return response()->json([
            'success' => true,
            'data' => [
                'total_users'          => $totalUsers,
                'total_policies'       => $totalPolicies,
                'active_policies'      => $activePolicies,
                'pending_claims'       => $pendingClaims,
                'total_claims'         => $totalClaims,
                'total_transactions'   => $totalTransactions,
                'total_revenue'        => $totalRevenue,
                'total_payout'         => $totalPayout,
                'pending_payments'     => $pendingPayments,
                'total_hospitals'      => $totalHospitals,
                'total_consultations'  => $totalConsultations,
                'avg_rating'           => round($avgRating, 1),
                'monthly_revenue'      => $monthlyRevenue,
                'claims_by_status'     => $claimsByStatus,
                'policies_by_type'     => $policiesByType,
            ],
        ]);
    }

    // ─── USERS ───────────────────────────────────────────────────────────────

    public function users(Request $request): JsonResponse
    {
        $query = User::with('profile')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"))
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->latest();

        $users = $query->paginate($request->per_page ?? 15);

        return response()->json(['success' => true, 'data' => $users]);
    }

    public function updateUser(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', 'unique:users,email,' . $id],
            'role'     => ['sometimes', 'in:pengguna,admin'],
            'password' => ['sometimes', 'string', 'min:8'],
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json(['success' => true, 'data' => $user->fresh('profile'), 'message' => 'User updated.']);
    }

    public function deleteUser(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['success' => true, 'message' => 'User deleted.']);
    }

    // ─── CLAIMS ──────────────────────────────────────────────────────────────

    public function claims(Request $request): JsonResponse
    {
        $query = Claim::with(['user', 'insurancePolicy'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%")))
            ->latest();

        return response()->json(['success' => true, 'data' => $query->paginate($request->per_page ?? 15)]);
    }

    public function updateClaim(Request $request, string $id): JsonResponse
    {
        $claim = Claim::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected,partial'],
        ]);

        $previousStatus = $claim->status;
        $claim->update($validated);

        if (! in_array($previousStatus, ['approved', 'partial']) && in_array($claim->status, ['approved', 'partial'])) {
            Transaction::create([
                'user_id'              => $claim->user_id,
                'insurance_policy_id'  => $claim->insurance_policy_id,
                'transaction_type'     => 'klaim_keluar',
                'amount'               => $claim->claim_amount,
                'transaction_date'     => now(),
                'status'               => 'success',
            ]);
        }

        return response()->json(['success' => true, 'data' => $claim->fresh(['user', 'insurancePolicy']), 'message' => 'Claim updated.']);
    }

    // ─── INSURANCE POLICIES ──────────────────────────────────────────────────

    public function policies(Request $request): JsonResponse
    {
        $query = InsurancePolicy::with('user')
            ->when($request->payment_status, fn($q) => $q->where('payment_status', $request->payment_status))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"))
                ->orWhere('policy_number', 'like', "%{$request->search}%"))
            ->latest();

        return response()->json(['success' => true, 'data' => $query->paginate($request->per_page ?? 15)]);
    }

    public function updatePolicy(Request $request, string $id): JsonResponse
    {
        $policy = InsurancePolicy::findOrFail($id);

        $validated = $request->validate([
            'payment_status' => ['sometimes', 'in:pending,verified,rejected'],
            'status'         => ['sometimes', 'in:active,inactive'],
        ]);

        if (isset($validated['payment_status']) && $validated['payment_status'] === 'verified') {
            $validated['status'] = 'active';
        }

        $previousStatus = $policy->payment_status;
        $policy->update($validated);

        if ($policy->payment_status === 'verified' && $previousStatus !== 'verified') {
            Transaction::create([
                'user_id'             => $policy->user_id,
                'insurance_policy_id' => $policy->id,
                'transaction_type'    => 'premi_masuk',
                'amount'              => $policy->premium_amount,
                'transaction_date'    => now(),
                'status'              => 'success',
            ]);
        }

        return response()->json(['success' => true, 'data' => $policy->fresh('user'), 'message' => 'Policy updated.']);
    }

    // ─── TRANSACTIONS ────────────────────────────────────────────────────────

    public function transactions(Request $request): JsonResponse
    {
        $query = Transaction::with(['user', 'insurancePolicy'])
            ->when($request->type, fn($q) => $q->where('transaction_type', $request->type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%")))
            ->latest('transaction_date');

        return response()->json(['success' => true, 'data' => $query->paginate($request->per_page ?? 15)]);
    }

    // ─── HOSPITALS ───────────────────────────────────────────────────────────

    public function hospitals(Request $request): JsonResponse
    {
        $query = Hospital::withCount('doctors')
            ->when($request->search, fn($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('city', 'like', "%{$request->search}%"))
            ->latest();

        return response()->json(['success' => true, 'data' => $query->paginate($request->per_page ?? 15)]);
    }

    // ─── CONSULTATIONS ───────────────────────────────────────────────────────

    public function consultations(Request $request): JsonResponse
    {
        $query = DoctorConsultation::with(['user', 'messages'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"))
                ->orWhere('doctor_name', 'like', "%{$request->search}%"))
            ->latest();

        return response()->json(['success' => true, 'data' => $query->paginate($request->per_page ?? 15)]);
    }

    public function updateConsultation(Request $request, string $id): JsonResponse
    {
        $consultation = DoctorConsultation::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'in:waiting_approval,approved,rejected,completed'],
        ]);

        $consultation->update($validated);

        return response()->json(['success' => true, 'data' => $consultation->fresh('user'), 'message' => 'Consultation updated.']);
    }

    public function verifyConsultationPayment(Request $request, string $id): JsonResponse
    {
        $consultation = DoctorConsultation::findOrFail($id);

        $validated = $request->validate([
            'action' => ['required', 'in:approve,reject'],
        ]);

        if ($consultation->payment_method !== 'transfer') {
            return response()->json(['success' => false, 'message' => 'Hanya konsultasi dengan metode transfer yang perlu diverifikasi.'], 422);
        }

        if ($validated['action'] === 'approve') {
            $consultation->update(['payment_status' => 'paid']);
            return response()->json(['success' => true, 'data' => $consultation->fresh('user'), 'message' => 'Pembayaran transfer berhasil diverifikasi. Konsultasi siap disetujui.']);
        }

        // Reject payment → mark payment as failed and set consultation as rejected
        $consultation->update(['payment_status' => 'failed', 'status' => 'rejected']);
        return response()->json(['success' => true, 'data' => $consultation->fresh('user'), 'message' => 'Bukti transfer ditolak. Konsultasi telah dibatalkan.']);
    }

    public function sendConsultationMessage(Request $request, string $id): JsonResponse
    {
        $consultation = DoctorConsultation::findOrFail($id);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $msg = $consultation->messages()->create([
            'sender'  => 'admin',
            'message' => $validated['message'],
        ]);

        return response()->json(['success' => true, 'data' => $msg, 'message' => 'Message sent.']);
    }

    // ─── FEEDBACKS ───────────────────────────────────────────────────────────

    public function feedbacks(Request $request): JsonResponse
    {
        $query = Feedback::with('user')
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->latest();

        return response()->json(['success' => true, 'data' => $query->paginate($request->per_page ?? 15)]);
    }

    // ─── HOSPITAL REGISTRATIONS ──────────────────────────────────────────────

    public function hospitalRegistrations(Request $request): JsonResponse
    {
        $query = HospitalRegistration::with(['user', 'hospital'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"))
                ->orWhere('hospital_name', 'like', "%{$request->search}%"))
            ->latest();

        return response()->json(['success' => true, 'data' => $query->paginate($request->per_page ?? 15)]);
    }

    // ─── SERVICE REGISTRATIONS ───────────────────────────────────────────────

    public function serviceRegistrations(Request $request): JsonResponse
    {
        $query = ServiceRegistration::with(['user', 'hospital'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$request->search}%"))
                ->orWhere('service_name', 'like', "%{$request->search}%"))
            ->latest();

        return response()->json(['success' => true, 'data' => $query->paginate($request->per_page ?? 15)]);
    }

    // ─── INSURANCE PACKAGES ──────────────────────────────────────────────────

    public function packages(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => InsurancePackage::all()]);
    }

    public function updatePackage(Request $request, string $id): JsonResponse
    {
        $package = InsurancePackage::findOrFail($id);

        $validated = $request->validate([
            'label'          => ['sometimes', 'string', 'max:255'],
            'description'    => ['sometimes', 'string'],
            'coverage_limit' => ['sometimes', 'numeric', 'min:0'],
            'premium_amount' => ['sometimes', 'numeric', 'min:0'],
            'benefits'       => ['sometimes', 'array'],
        ]);

        $package->update($validated);

        return response()->json(['success' => true, 'data' => $package->fresh(), 'message' => 'Package updated.']);
    }
}
