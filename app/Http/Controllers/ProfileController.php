<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Get admin profile
     */
    public function getProfile()
    {
        $admin = Admin::first();
        
        if (!$admin) {
            return response()->json([
                'error' => 'Admin profile not found'
            ], 404);
        }

        return response()->json($admin);
    }

    /**
     * Update admin profile
     */
    public function updateProfile(Request $request)
    {
        $admin = Admin::first();
        
        if (!$admin) {
            return response()->json([
                'error' => 'Admin profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|string',
            'country' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $admin->update($request->only([
            'first_name',
            'last_name',
            'email',
            'phone',
            'date_of_birth',
            'country',
            'city',
            'postal_code'
        ]));

        return response()->json([
            'message' => 'Profile updated successfully',
            'admin' => $admin
        ]);
    }

    /**
     * Update admin credentials (username and password)
     */
    public function updateCredentials(Request $request)
    {
        $admin = Admin::first();
        
        if (!$admin) {
            return response()->json([
                'error' => 'Admin profile not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:3|max:255',
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:4|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        // Verify current password
        if (!Hash::check($request->current_password, $admin->password)) {
            return response()->json([
                'error' => 'Current password is incorrect'
            ], 401);
        }

        $admin->update([
            'username' => $request->username,
            'password' => bcrypt($request->new_password)
        ]);

        return response()->json([
            'message' => 'Credentials updated successfully',
            'username' => $admin->username
        ]);
    }

    /**
     * Verify login credentials
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'messages' => $validator->errors()
            ], 422);
        }

        $admin = Admin::where('username', $request->username)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'error' => 'Invalid credentials'
            ], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'admin' => [
                'username' => $admin->username,
                'email' => $admin->email,
                'first_name' => $admin->first_name,
                'last_name' => $admin->last_name,
            ]
        ]);
    }
}
