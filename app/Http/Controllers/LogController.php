<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Log;
use Illuminate\Http\Request;

class LogController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Get all logs ordered by most recent first, limit to last 100
        $logs = Log::orderBy('created_at', 'desc')
            ->limit(100)
            ->get();
        
        return response()->json($logs);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user' => 'nullable|string|max:255',
            'action' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'details' => 'nullable|string',
            'status' => 'nullable|in:success,warning,error'
        ]);

        // Set defaults
        $validated['user'] = $validated['user'] ?? 'Admin';
        $validated['status'] = $validated['status'] ?? 'success';

        $log = Log::create($validated);

        return response()->json($log, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $log = Log::findOrFail($id);
        return response()->json($log);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $log = Log::findOrFail($id);
        $log->delete();
        
        return response()->json(['message' => 'Log deleted successfully']);
    }

    /**
     * Clear all logs
     *
     * @return \Illuminate\Http\Response
     */
    public function clear()
    {
        Log::truncate();
        
        return response()->json(['message' => 'All logs cleared successfully']);
    }
}
