<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InsurancePackage;
use Illuminate\Http\JsonResponse;

class InsurancePackageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Insurance packages retrieved successfully.',
            'data' => InsurancePackage::orderBy('id', 'asc')->get(),
        ], 200);
    }
}
