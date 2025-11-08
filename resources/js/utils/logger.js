// Centralized logging utility with backend support
class Logger {
  constructor() {
    this.apiEndpoint = '/api/logs';
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

  // Add a new log entry to backend
  async log(action, type, details, status = 'success') {
    const logData = {
      user: this.getCurrentUser(),
      action,
      type,
      details,
      status
    };
    
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save log to backend:', error);
      // Fallback: Still return the log object even if backend fails
      return {
        ...logData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
    }
  }

  // Clear all logs
  async clearLogs() {
    try {
      const response = await fetch(`${this.apiEndpoint}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to clear logs:', error);
      throw error;
    }
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
