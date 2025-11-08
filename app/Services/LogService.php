<?php

namespace App\Services;

use App\Models\Log;

class LogService
{
    /**
     * Log an activity
     * 
     * @param string $action Action performed (Created, Updated, Deleted, Archived, Restored, Error)
     * @param string $type Type of resource (Course, Department, Faculty, Student, Academic Year)
     * @param string $details Details about the action
     * @param string $status Status of the action (success, warning, error)
     * @param string|null $user User who performed the action
     * @return Log
     */
    public static function log(string $action, string $type, string $details, string $status = 'success', ?string $user = null)
    {
        return Log::create([
            'user' => $user ?? 'Admin',
            'action' => $action,
            'type' => $type,
            'details' => $details,
            'status' => $status
        ]);
    }

    /**
     * Log a create action
     */
    public static function logCreate(string $type, string $details, ?string $user = null)
    {
        return self::log('Created', $type, $details, 'success', $user);
    }

    /**
     * Log an update action
     */
    public static function logUpdate(string $type, string $details, ?string $user = null)
    {
        return self::log('Updated', $type, $details, 'success', $user);
    }

    /**
     * Log a delete action
     */
    public static function logDelete(string $type, string $details, ?string $user = null)
    {
        return self::log('Deleted', $type, $details, 'warning', $user);
    }

    /**
     * Log an archive action
     */
    public static function logArchive(string $type, string $details, ?string $user = null)
    {
        return self::log('Archived', $type, $details, 'warning', $user);
    }

    /**
     * Log a restore action
     */
    public static function logRestore(string $type, string $details, ?string $user = null)
    {
        return self::log('Restored', $type, $details, 'success', $user);
    }

    /**
     * Log an error
     */
    public static function logError(string $type, string $details, ?string $user = null)
    {
        return self::log('Error', $type, $details, 'error', $user);
    }
}
