// Centralized logging utility
class Logger {
  constructor() {
    this.storageKey = 'system_logs';
  }

  // Get all logs from localStorage
  getLogs() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Save logs to localStorage
  saveLogs(logs) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }

  // Add a new log entry
  log(action, type, details, status = 'success') {
    const logs = this.getLogs();
    const newLog = {
      id: Date.now() + Math.random(), // Ensure unique ID
      timestamp: new Date().toISOString(),
      user: this.getCurrentUser(),
      action,
      type,
      details,
      status
    };
    
    // Keep only last 100 logs to avoid storage issues
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    this.saveLogs(updatedLogs);
    
    return newLog;
  }

  // Get current user from localStorage or default
  getCurrentUser() {
    try {
      const user = localStorage.getItem('current_user');
      return user || 'Admin';
    } catch {
      return 'Admin';
    }
  }

  // Clear all logs
  clearLogs() {
    this.saveLogs([]);
  }

  // Convenience methods for common actions
  logCreate(type, details) {
    return this.log('Created', type, details, 'success');
  }

  logUpdate(type, details) {
    return this.log('Updated', type, details, 'success');
  }

  logDelete(type, details) {
    return this.log('Deleted', type, details, 'warning');
  }

  logArchive(type, details) {
    return this.log('Archived', type, details, 'warning');
  }

  logRestore(type, details) {
    return this.log('Restored', type, details, 'success');
  }

  logError(type, details) {
    return this.log('Error', type, details, 'error');
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
