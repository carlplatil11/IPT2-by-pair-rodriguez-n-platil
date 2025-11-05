import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import logger from '../utils/logger';

// Text highlighting component
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <>{text}</>;
  
  const parts = String(text).split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? 
          <span key={i} style={{ backgroundColor: '#fef08a', fontWeight: 600 }}>{part}</span> : 
          part
      )}
    </>
  );
};

// Reusable localStorage-backed list manager
function useLocalList(key, initial = []) {
  const [list, setList] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
  }, [key, list]);

  const add = item => setList(prev => [...prev, { ...item, id: Date.now(), archived: false }]);
  const update = (id, patch) => setList(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  const remove = id => setList(prev => prev.filter(i => i.id !== id));
  const archive = id => update(id, { archived: true });

  return { list, setList, add, update, remove, archive };
}

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [search, setSearch] = useState('');
  
  // Filter states for each tab
  const [courseFilter, setCourseFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');
  
  // Checkbox selections for bulk operations
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Pagination for logs
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const logsPerPage = 10; // 10 logs per page

  // Fetch courses from API
  const [courseList, setCourseList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [logList, setLogList] = useState([]);
  
  // Filter to show only ARCHIVED items in Settings (opposite of other components)
  const archivedCourseList = courseList.filter(c => c.status === 'archived' || c.archived === true || c.archived === 1);
  const archivedDepartmentList = departmentList.filter(d => d.status === 'Archived' || d.archived === true || d.archived === 1);
  const archivedFacultyList = facultyList.filter(f => f.archived === true || f.archived === 1);
  const archivedStudentList = studentList.filter(s => s.archived === true || s.archived === 1);
  
  // Get unique departments for filtering
  const uniqueDepartments = [...new Set(archivedCourseList.map(c => c.department).filter(Boolean))];
  const uniqueFacultyDepartments = [...new Set(archivedFacultyList.map(f => f.department).filter(Boolean))];
  const uniqueStudentDepartments = [...new Set(archivedStudentList.map(s => s.department).filter(Boolean))];
  const uniqueLogTypes = [...new Set(logList.map(l => l.type).filter(Boolean))];
  
  // Apply search and filter
  const filteredCourses = archivedCourseList.filter(c => {
    const matchesSearch = (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (c.department || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = courseFilter === 'all' || c.department === courseFilter;
    return matchesSearch && matchesFilter;
  });
  
  const filteredDepartments = archivedDepartmentList.filter(d => {
    const matchesSearch = (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (d.head || "").toLowerCase().includes(search.toLowerCase()) ||
                         (d.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = departmentFilter === 'all' || d.name === departmentFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredFaculty = archivedFacultyList.filter(f => {
    const matchesSearch = (f.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (f.email || "").toLowerCase().includes(search.toLowerCase()) ||
                         (f.department || "").toLowerCase().includes(search.toLowerCase()) ||
                         (f.subject || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = facultyFilter === 'all' || f.department === facultyFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredStudents = archivedStudentList.filter(s => {
    const matchesSearch = (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
                         (s.department || "").toLowerCase().includes(search.toLowerCase()) ||
                         (s.course || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = studentFilter === 'all' || s.department === studentFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredLogs = logList.filter(log => {
    const date = new Date(log.timestamp);
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const matchesSearch = (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
                         (log.user || "").toLowerCase().includes(search.toLowerCase()) ||
                         (log.details || "").toLowerCase().includes(search.toLowerCase()) ||
                         timeStr.toLowerCase().includes(search.toLowerCase()) ||
                         dateStr.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = logFilter === 'all' || log.type === logFilter;
    return matchesSearch && matchesFilter;
  });
  
  // Pagination calculations for logs
  const totalLogsPages = Math.ceil(filteredLogs.length / logsPerPage);
  const logsStartIndex = (logsCurrentPage - 1) * logsPerPage;
  const logsEndIndex = logsStartIndex + logsPerPage;
  const paginatedLogs = filteredLogs.slice(logsStartIndex, logsEndIndex);
  
  // Reset to page 1 when search changes or switching tabs
  useEffect(() => {
    setLogsCurrentPage(1);
  }, [search, activeTab]);
  
  useEffect(() => {
    let isFetching = false;
    
    const fetchCourses = () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      fetch('/api/courses')
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => setCourseList(Array.isArray(data) ? data : []))
        .catch(() => setCourseList([]))
        .finally(() => { isFetching = false; });
    };
    
    fetchCourses();
    // Reduced polling to 60 seconds to prevent rate limiting
    const interval = setInterval(fetchCourses, 60000);
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchCourses();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let isFetching = false;
    
    const fetchDepartments = () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      fetch('/api/departments')
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => setDepartmentList(Array.isArray(data) ? data : []))
        .catch(() => setDepartmentList([]))
        .finally(() => { isFetching = false; });
    };
    
    fetchDepartments();
    // Reduced polling to 60 seconds to prevent rate limiting
    const interval = setInterval(fetchDepartments, 60000);
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchDepartments();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let isFetching = false;
    
    const fetchFaculties = () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      fetch('/api/faculties')
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => setFacultyList(Array.isArray(data) ? data : []))
        .catch(() => setFacultyList([]))
        .finally(() => { isFetching = false; });
    };
    
    fetchFaculties();
    // Reduced polling to 60 seconds to prevent rate limiting
    const interval = setInterval(fetchFaculties, 60000);
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchFaculties();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let isFetching = false;
    
    const fetchStudents = () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      fetch('/api/students')
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => setStudentList(Array.isArray(data) ? data : []))
        .catch(() => setStudentList([]))
        .finally(() => { isFetching = false; });
    };
    
    fetchStudents();
    // Reduced polling to 60 seconds to prevent rate limiting
    const interval = setInterval(fetchStudents, 60000);
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchStudents();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Load logs from logger utility
  useEffect(() => {
    const logs = logger.getLogs();
    setLogList(logs);
    
    // Reduced logs polling from 5s to 30s (logs don't need frequent updates)
    const interval = setInterval(() => {
      const updatedLogs = logger.getLogs();
      setLogList(updatedLogs);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const years = useLocalList('settings_years', []);

  const courseDefault = { name: '', department: '', age: '', gender: 'Undergraduate', about: '' };
  const departmentDefault = { name: '', head: '', email: '', description: '', status: 'Active' };
  
  const [form, setForm] = useState(courseDefault);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'courses') {
      setForm(courseDefault);
    } else if (activeTab === 'departments') {
      setForm(departmentDefault);
    }
    setEditing(null);
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'courses') {
      if (!form.name || form.name.trim().length < 2) {
        alert('Course name is required (min 2 chars)');
        return;
      }

      const payload = { 
        ...form,
        age: form.age === "" ? null : Number(form.age)
      };
      
      try {
        if (editing) {
          const res = await fetch(`/api/courses/${editing}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const updated = await res.json();
            setCourseList(prev => prev.map(c => c.id === editing ? updated : c));
          }
        } else {
          const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const newCourse = await res.json();
            setCourseList(prev => [...prev, newCourse]);
          }
        }
      } catch (error) {
        console.error('Error saving course:', error);
      }
      
    } else if (activeTab === 'departments') {
      if (!form.name || form.name.trim().length < 2) {
        alert('Department name is required (min 2 chars)');
        return;
      }

      const payload = { ...form };
      
      try {
        if (editing) {
          const res = await fetch(`/api/departments/${editing}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const updated = await res.json();
            setDepartmentList(prev => prev.map(d => d.id === editing ? updated : d));
          }
        } else {
          const res = await fetch('/api/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const newDept = await res.json();
            setDepartmentList(prev => [...prev, newDept]);
          }
        }
      } catch (error) {
        console.error('Error saving department:', error);
      }
    }
    
    setForm(activeTab === 'courses' ? courseDefault : departmentDefault);
    setEditing(null);
    setShowModal(false);
  };

  const startEdit = (item) => {
    setEditing(item.id);
    if (activeTab === 'courses') {
      setForm({ 
        name: item.name || '', 
        department: item.department || '', 
        age: item.age || '',
        gender: item.gender || 'Undergraduate',
        about: item.about || ''
      });
    } else if (activeTab === 'departments') {
      setForm({
        name: item.name || '',
        head: item.head || '',
        email: item.email || '',
        description: item.description || '',
        status: item.status || 'Active'
      });
    }
    setShowModal(true);
  };

  const confirmArchive = async (id) => {
    if (!window.confirm('Archive this item?')) return;
    
    try {
      if (activeTab === 'courses') {
        const res = await fetch(`/api/courses/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived', archived: true })
        });
        if (res.ok) {
          const updated = await res.json();
          setCourseList(prev => prev.map(c => c.id === id ? updated : c));
        }
      } else if (activeTab === 'departments') {
        const res = await fetch(`/api/departments/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Archived', archived: true })
        });
        if (res.ok) {
          const updated = await res.json();
          setDepartmentList(prev => prev.map(d => d.id === id ? updated : d));
        }
      }
    } catch (error) {
      console.error('Error archiving item:', error);
    }
  };

  const handleUnarchive = async (id, skipConfirm = false) => {
    if (!skipConfirm && !window.confirm('Restore this item? Note: This will NOT automatically restore related students/faculty. You must restore them separately if needed.')) return;
    
    try {
      if (activeTab === 'courses') {
        const course = courseList.find(c => c.id === id);
        const res = await fetch(`/api/courses/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active', archived: false })
        });
        if (res.ok) {
          const updated = await res.json();
          setCourseList(prev => prev.map(c => c.id === id ? updated : c));
          logger.logRestore('Course', `Restored course: ${course?.name || 'Unknown'}`);
        }
      } else if (activeTab === 'departments') {
        const dept = departmentList.find(d => d.id === id);
        const res = await fetch(`/api/departments/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Active', archived: false })
        });
        if (res.ok) {
          const updated = await res.json();
          setDepartmentList(prev => prev.map(d => d.id === id ? updated : d));
          logger.logRestore('Department', `Restored department: ${dept?.name || 'Unknown'}`);
        }
      } else if (activeTab === 'faculty') {
        const faculty = facultyList.find(f => f.id === id);
        const res = await fetch(`/api/faculties/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: false })
        });
        if (res.ok) {
          const updated = await res.json();
          setFacultyList(prev => prev.map(f => f.id === id ? updated : f));
          logger.logRestore('Faculty', `Restored faculty: ${faculty?.name || 'Unknown'}`);
        }
      } else if (activeTab === 'students') {
        const student = studentList.find(s => s.id === id);
        const res = await fetch(`/api/students/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: false })
        });
        if (res.ok) {
          const updated = await res.json();
          setStudentList(prev => prev.map(s => s.id === id ? updated : s));
          logger.logRestore('Student', `Restored student: ${student?.name || 'Unknown'}`);
        }
      }
    } catch (error) {
      console.error('Error unarchiving item:', error);
      const type = activeTab === 'courses' ? 'Course' : activeTab === 'departments' ? 'Department' : activeTab === 'faculty' ? 'Faculty' : 'Student';
      logger.logError(type, `Failed to restore item`);
    }
  };

  const handlePermanentDelete = async (id, skipConfirm = false) => {
    if (!skipConfirm && !window.confirm('Permanently delete this item? This cannot be undone!')) return;
    
    try {
      if (activeTab === 'courses') {
        const course = courseList.find(c => c.id === id);
        const res = await fetch(`/api/courses/${id}`, { 
          method: 'DELETE'
        });
        if (res.ok) {
          setCourseList(prev => prev.filter(c => c.id !== id));
          logger.logDelete('Course', `Permanently deleted course: ${course?.name || 'Unknown'}`);
        }
      } else if (activeTab === 'departments') {
        const dept = departmentList.find(d => d.id === id);
        const res = await fetch(`/api/departments/${id}`, { 
          method: 'DELETE'
        });
        if (res.ok) {
          setDepartmentList(prev => prev.filter(d => d.id !== id));
          logger.logDelete('Department', `Permanently deleted department: ${dept?.name || 'Unknown'}`);
        }
      } else if (activeTab === 'faculty') {
        const faculty = facultyList.find(f => f.id === id);
        const res = await fetch(`/api/faculties/${id}`, { 
          method: 'DELETE'
        });
        if (res.ok) {
          setFacultyList(prev => prev.filter(f => f.id !== id));
          logger.logDelete('Faculty', `Permanently deleted faculty: ${faculty?.name || 'Unknown'}`);
        }
      } else if (activeTab === 'students') {
        const student = studentList.find(s => s.id === id);
        const res = await fetch(`/api/students/${id}`, { 
          method: 'DELETE'
        });
        if (res.ok) {
          setStudentList(prev => prev.filter(s => s.id !== id));
          logger.logDelete('Student', `Permanently deleted student: ${student?.name || 'Unknown'}`);
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      const type = activeTab === 'courses' ? 'Course' : activeTab === 'departments' ? 'Department' : activeTab === 'faculty' ? 'Faculty' : 'Student';
      logger.logError(type, `Failed to delete item`);
    }
  };

  // Bulk operations for restore all
  const handleRestoreAll = async () => {
    const itemsToRestore = activeTab === 'courses' ? selectedCourses :
                          activeTab === 'departments' ? selectedDepartments :
                          activeTab === 'faculty' ? selectedFaculty :
                          selectedStudents;
    
    if (itemsToRestore.length === 0) {
      alert('Please select items to restore');
      return;
    }
    
    if (!window.confirm(`Restore ${itemsToRestore.length} selected item(s)?`)) return;
    
    try {
      for (const id of itemsToRestore) {
        await handleUnarchive(id, true);
      }
      // Clear selections
      if (activeTab === 'courses') setSelectedCourses([]);
      else if (activeTab === 'departments') setSelectedDepartments([]);
      else if (activeTab === 'faculty') setSelectedFaculty([]);
      else if (activeTab === 'students') setSelectedStudents([]);
    } catch (error) {
      console.error('Error restoring items:', error);
    }
  };

  // Bulk delete
  const handleDeleteAll = async () => {
    const itemsToDelete = activeTab === 'courses' ? selectedCourses :
                         activeTab === 'departments' ? selectedDepartments :
                         activeTab === 'faculty' ? selectedFaculty :
                         selectedStudents;
    
    if (itemsToDelete.length === 0) {
      alert('Please select items to delete');
      return;
    }
    
    if (!window.confirm(`Permanently delete ${itemsToDelete.length} selected item(s)? This cannot be undone!`)) return;
    
    try {
      for (const id of itemsToDelete) {
        await handlePermanentDelete(id, true);
      }
      // Clear selections
      if (activeTab === 'courses') setSelectedCourses([]);
      else if (activeTab === 'departments') setSelectedDepartments([]);
      else if (activeTab === 'faculty') setSelectedFaculty([]);
      else if (activeTab === 'students') setSelectedStudents([]);
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  // Toggle checkbox
  const handleCheckboxToggle = (id) => {
    if (activeTab === 'courses') {
      setSelectedCourses(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else if (activeTab === 'departments') {
      setSelectedDepartments(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else if (activeTab === 'faculty') {
      setSelectedFaculty(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else if (activeTab === 'students') {
      setSelectedStudents(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    }
  };

  // Select all toggle
  const handleSelectAllToggle = () => {
    if (activeTab === 'courses') {
      setSelectedCourses(prev => 
        prev.length === filteredCourses.length ? [] : filteredCourses.map(c => c.id)
      );
    } else if (activeTab === 'departments') {
      setSelectedDepartments(prev => 
        prev.length === filteredDepartments.length ? [] : filteredDepartments.map(d => d.id)
      );
    } else if (activeTab === 'faculty') {
      setSelectedFaculty(prev => 
        prev.length === filteredFaculty.length ? [] : filteredFaculty.map(f => f.id)
      );
    } else if (activeTab === 'students') {
      setSelectedStudents(prev => 
        prev.length === filteredStudents.length ? [] : filteredStudents.map(s => s.id)
      );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <main className="student-container" style={{ flex: 1 }}>
        <div className="dashboard-header">
          <button className="logout-btn" onClick={() => window.location.href = '/login'}>Log out</button>
        </div>

        {/* Modern Header */}
        <div style={{ padding: '24px 40px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, marginBottom: 4 }}>System Settings</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage archived items and system configuration</p>
        </div>

        {/* Search and Filters Bar */}
        <div style={{ display: 'flex', gap: 16, padding: '20px 40px', borderBottom: '1px solid #e5e7eb', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={`Search archived ${activeTab}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
          
          {/* Filter Dropdown */}
          {activeTab === 'courses' && uniqueDepartments.length > 0 && (
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
                background: '#fff'
              }}
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
          
          {activeTab === 'departments' && archivedDepartmentList.length > 0 && (
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
                background: '#fff'
              }}
            >
              <option value="all">All Departments</option>
              {archivedDepartmentList.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          )}
          
          {activeTab === 'faculty' && uniqueFacultyDepartments.length > 0 && (
            <select
              value={facultyFilter}
              onChange={e => setFacultyFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
                background: '#fff'
              }}
            >
              <option value="all">All Departments</option>
              {uniqueFacultyDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
          
          {activeTab === 'students' && uniqueStudentDepartments.length > 0 && (
            <select
              value={studentFilter}
              onChange={e => setStudentFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
                background: '#fff'
              }}
            >
              <option value="all">All Departments</option>
              {uniqueStudentDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
          
          {activeTab === 'logs' && uniqueLogTypes.length > 0 && (
            <select
              value={logFilter}
              onChange={e => setLogFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer',
                background: '#fff'
              }}
            >
              <option value="all">All Types</option>
              {uniqueLogTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
          
          <div style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
            {activeTab === 'courses' && `${selectedCourses.length > 0 ? `${selectedCourses.length} selected • ` : ''}${filteredCourses.length} of ${archivedCourseList.length} items`}
            {activeTab === 'departments' && `${selectedDepartments.length > 0 ? `${selectedDepartments.length} selected • ` : ''}${filteredDepartments.length} of ${archivedDepartmentList.length} items`}
            {activeTab === 'faculty' && `${selectedFaculty.length > 0 ? `${selectedFaculty.length} selected • ` : ''}${filteredFaculty.length} of ${archivedFacultyList.length} items`}
            {activeTab === 'students' && `${selectedStudents.length > 0 ? `${selectedStudents.length} selected • ` : ''}${filteredStudents.length} of ${archivedStudentList.length} items`}
            {activeTab === 'logs' && `${filteredLogs.length} of ${logList.length} entries`}
          </div>
          {activeTab !== 'logs' && (
            <>
              <button
                onClick={handleRestoreAll}
                disabled={
                  (activeTab === 'courses' && selectedCourses.length === 0) ||
                  (activeTab === 'departments' && selectedDepartments.length === 0) ||
                  (activeTab === 'faculty' && selectedFaculty.length === 0) ||
                  (activeTab === 'students' && selectedStudents.length === 0)
                }
                style={{
                  padding: '10px 16px',
                  background: '#dcfce7',
                  color: '#16a34a',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: (activeTab === 'courses' && selectedCourses.length === 0) ||
                          (activeTab === 'departments' && selectedDepartments.length === 0) ||
                          (activeTab === 'faculty' && selectedFaculty.length === 0) ||
                          (activeTab === 'students' && selectedStudents.length === 0) ? 0.5 : 1
                }}
              >
                ↻ Restore Selected
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={
                  (activeTab === 'courses' && selectedCourses.length === 0) ||
                  (activeTab === 'departments' && selectedDepartments.length === 0) ||
                  (activeTab === 'faculty' && selectedFaculty.length === 0) ||
                  (activeTab === 'students' && selectedStudents.length === 0)
                }
                style={{
                  padding: '10px 16px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: (activeTab === 'courses' && selectedCourses.length === 0) ||
                          (activeTab === 'departments' && selectedDepartments.length === 0) ||
                          (activeTab === 'faculty' && selectedFaculty.length === 0) ||
                          (activeTab === 'students' && selectedStudents.length === 0) ? 0.5 : 1
                }}
              >
                🗑️ Delete Selected
              </button>
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
            <button
              onClick={() => setActiveTab('courses')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'courses' ? '3px solid #111827' : '3px solid transparent',
                padding: '14px 20px',
                cursor: 'pointer',
                fontWeight: activeTab === 'courses' ? 600 : 400,
                color: activeTab === 'courses' ? '#111827' : '#6b7280',
                marginBottom: -2,
                fontSize: 14,
                transition: 'all 0.2s'
              }}
            >
              📚 Archived Courses
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'departments' ? '3px solid #111827' : '3px solid transparent',
                padding: '14px 20px',
                cursor: 'pointer',
                fontWeight: activeTab === 'departments' ? 600 : 400,
                color: activeTab === 'departments' ? '#111827' : '#6b7280',
                marginBottom: -2,
                fontSize: 14,
                transition: 'all 0.2s'
              }}
            >
              🏛️ Archived Departments
            </button>
            <button
              onClick={() => setActiveTab('faculty')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'faculty' ? '3px solid #111827' : '3px solid transparent',
                padding: '14px 20px',
                cursor: 'pointer',
                fontWeight: activeTab === 'faculty' ? 600 : 400,
                color: activeTab === 'faculty' ? '#111827' : '#6b7280',
                marginBottom: -2,
                fontSize: 14,
                transition: 'all 0.2s'
              }}
            >
              👨‍🏫 Archived Faculty
            </button>
            <button
              onClick={() => setActiveTab('students')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'students' ? '3px solid #111827' : '3px solid transparent',
                padding: '14px 20px',
                cursor: 'pointer',
                fontWeight: activeTab === 'students' ? 600 : 400,
                color: activeTab === 'students' ? '#111827' : '#6b7280',
                marginBottom: -2,
                fontSize: 14,
                transition: 'all 0.2s'
              }}
            >
              👨‍🎓 Archived Students
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'logs' ? '3px solid #111827' : '3px solid transparent',
                padding: '14px 20px',
                cursor: 'pointer',
                fontWeight: activeTab === 'logs' ? 600 : 400,
                color: activeTab === 'logs' ? '#111827' : '#6b7280',
                marginBottom: -2,
                fontSize: 14,
                transition: 'all 0.2s'
              }}
            >
              📋 System Logs
            </button>
          </div>
        </div>

        {/* Courses Table */}
        {activeTab === 'courses' && (
          <div style={{ padding: '0 40px', marginBottom: 40 }}>
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ width: 40, textAlign: 'center', padding: '14px 20px' }}>
                      <input
                        type="checkbox"
                        checked={filteredCourses.length > 0 && selectedCourses.length === filteredCourses.length}
                        onChange={handleSelectAllToggle}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Course Name</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Department</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Level</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Credits</th>
                    <th style={{ textAlign: 'center', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ marginBottom: 12 }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M3 3h18v4H3z" />
                            <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                          </svg>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
                          {search ? 'No archived courses match your search' : 'No archived courses'}
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>
                          {search ? 'Try adjusting your search terms' : 'Archived courses will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredCourses.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ textAlign: 'center', padding: '16px 20px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(item.id)}
                          onChange={() => handleCheckboxToggle(item.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                        <HighlightText text={item.name} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                        <HighlightText text={item.department} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.gender}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.age}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          style={{
                            background: '#dcfce7',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            marginRight: 8,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#16a34a',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#bbf7d0'}
                          onMouseLeave={e => e.target.style.background = '#dcfce7'}
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#dc2626',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#fecaca'}
                          onMouseLeave={e => e.target.style.background = '#fee2e2'}
                          title="Delete Permanently"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div style={{ padding: '0 40px', marginBottom: 40 }}>
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ width: 40, textAlign: 'center', padding: '14px 20px' }}>
                      <input
                        type="checkbox"
                        checked={filteredDepartments.length > 0 && selectedDepartments.length === filteredDepartments.length}
                        onChange={handleSelectAllToggle}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Department Name</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Dean</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Contact</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</th>
                    <th style={{ textAlign: 'center', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ marginBottom: 12 }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M3 3h18v4H3z" />
                            <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                          </svg>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
                          {search ? 'No archived departments match your search' : 'No archived departments'}
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>
                          {search ? 'Try adjusting your search terms' : 'Archived departments will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredDepartments.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ textAlign: 'center', padding: '16px 20px' }}>
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(item.id)}
                          onChange={() => handleCheckboxToggle(item.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                        <HighlightText text={item.name} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                        <HighlightText text={item.head || '-'} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                        <HighlightText text={item.email || '-'} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          background: '#f3f4f6',
                          color: '#6b7280',
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          Archived
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          style={{
                            background: '#dcfce7',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            marginRight: 8,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#16a34a',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#bbf7d0'}
                          onMouseLeave={e => e.target.style.background = '#dcfce7'}
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#dc2626',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#fecaca'}
                          onMouseLeave={e => e.target.style.background = '#fee2e2'}
                          title="Delete Permanently"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Faculty Tab */}
        {activeTab === 'faculty' && (
          <div style={{ padding: '0 40px', marginBottom: 40 }}>
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ width: 40, textAlign: 'center', padding: '14px 20px' }}>
                      <input
                        type="checkbox"
                        checked={filteredFaculty.length > 0 && selectedFaculty.length === filteredFaculty.length}
                        onChange={handleSelectAllToggle}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Department</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Course</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Gender</th>
                    <th style={{ textAlign: 'center', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ marginBottom: 12 }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
                          {search ? 'No archived faculty match your search' : 'No archived faculty'}
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>
                          {search ? 'Try adjusting your search terms' : 'Archived faculty will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredFaculty.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ textAlign: 'center', padding: '16px 20px' }}>
                        <input
                          type="checkbox"
                          checked={selectedFaculty.includes(item.id)}
                          onChange={() => handleCheckboxToggle(item.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                        <HighlightText text={item.name} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                        <HighlightText text={item.email || '-'} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                        <HighlightText text={item.department || '-'} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                        <HighlightText text={item.subject || '-'} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.gender || '-'}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          style={{
                            background: '#dcfce7',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            marginRight: 8,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#16a34a',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#bbf7d0'}
                          onMouseLeave={e => e.target.style.background = '#dcfce7'}
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#dc2626',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#fecaca'}
                          onMouseLeave={e => e.target.style.background = '#fee2e2'}
                          title="Delete Permanently"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div style={{ padding: '0 40px', marginBottom: 40 }}>
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ width: 40, textAlign: 'center', padding: '14px 20px' }}>
                      <input
                        type="checkbox"
                        checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                        onChange={handleSelectAllToggle}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Department</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Course</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Year</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Gender</th>
                    <th style={{ textAlign: 'center', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ marginBottom: 12 }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
                          {search ? 'No archived students match your search' : 'No archived students'}
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>
                          {search ? 'Try adjusting your search terms' : 'Archived students will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredStudents.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ textAlign: 'center', padding: '16px 20px' }}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(item.id)}
                          onChange={() => handleCheckboxToggle(item.id)}
                          style={{ cursor: 'pointer', width: 16, height: 16 }}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                        <HighlightText text={item.name} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                        <HighlightText text={item.email || '-'} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                        <HighlightText text={item.department || '-'} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                        <HighlightText text={item.course || '-'} highlight={search} />
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.year || '-'}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.gender || '-'}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          style={{
                            background: '#dcfce7',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            marginRight: 8,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#16a34a',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#bbf7d0'}
                          onMouseLeave={e => e.target.style.background = '#dcfce7'}
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#dc2626',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#fecaca'}
                          onMouseLeave={e => e.target.style.background = '#fee2e2'}
                          title="Delete Permanently"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div style={{ padding: '0 40px', marginBottom: 40 }}>
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Timestamp</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>User</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Action</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Type</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Details</th>
                    <th style={{ textAlign: 'center', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ marginBottom: 12 }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                            <path d="M16 13H8" />
                            <path d="M16 17H8" />
                            <path d="M10 9H8" />
                          </svg>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
                          {search ? 'No logs match your search' : 'No logs available'}
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>
                          {search ? 'Try adjusting your search terms' : 'System activity logs will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {paginatedLogs.map((log, idx) => {
                    const date = new Date(log.timestamp);
                    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    
                    const statusColors = {
                      success: { bg: '#dcfce7', text: '#16a34a' },
                      warning: { bg: '#fef3c7', text: '#ca8a04' },
                      error: { bg: '#fee2e2', text: '#dc2626' }
                    };
                    const colors = statusColors[log.status] || statusColors.success;

                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: '#6b7280' }}>
                          <div style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                            <HighlightText text={timeStr} highlight={search} />
                          </div>
                          <div><HighlightText text={dateStr} highlight={search} /></div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 14, color: '#111827', fontWeight: 600 }}>
                          <HighlightText text={log.user} highlight={search} />
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                          <HighlightText text={log.action} highlight={search} />
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>
                          <span style={{
                            display: 'inline-block',
                            background: '#f3f4f6',
                            color: '#374151',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600
                          }}>
                            {log.type}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: 13, color: '#6b7280' }}>
                          <HighlightText text={log.details} highlight={search} />
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            background: colors.bg,
                            color: colors.text,
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {filteredLogs.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderTop: '1px solid #e5e7eb',
                  background: '#f9fafb'
                }}>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    Showing {logsStartIndex + 1} to {Math.min(logsEndIndex, filteredLogs.length)} of {filteredLogs.length} logs
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* Previous Button */}
                    <button
                      onClick={() => setLogsCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={logsCurrentPage === 1}
                      style={{
                        padding: '8px 12px',
                        background: logsCurrentPage === 1 ? '#f3f4f6' : '#fff',
                        color: logsCurrentPage === 1 ? '#9ca3af' : '#374151',
                        border: '1px solid #e5e7eb',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: logsCurrentPage === 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        if (logsCurrentPage > 1) e.target.style.background = '#f9fafb';
                      }}
                      onMouseLeave={e => {
                        if (logsCurrentPage > 1) e.target.style.background = '#fff';
                      }}
                    >
                      ← Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {Array.from({ length: totalLogsPages }, (_, i) => i + 1).map(pageNum => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = pageNum === 1 || 
                                        pageNum === totalLogsPages || 
                                        Math.abs(pageNum - logsCurrentPage) <= 1;
                        
                        // Show ellipsis
                        if (!showPage && (pageNum === logsCurrentPage - 2 || pageNum === logsCurrentPage + 2)) {
                          return (
                            <span key={pageNum} style={{ 
                              padding: '8px 4px', 
                              color: '#9ca3af',
                              fontSize: 13
                            }}>
                              ...
                            </span>
                          );
                        }
                        
                        if (!showPage) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setLogsCurrentPage(pageNum)}
                            style={{
                              padding: '8px 12px',
                              background: logsCurrentPage === pageNum ? '#111827' : '#fff',
                              color: logsCurrentPage === pageNum ? '#fff' : '#374151',
                              border: '1px solid #e5e7eb',
                              borderRadius: 6,
                              fontSize: 13,
                              fontWeight: logsCurrentPage === pageNum ? 600 : 500,
                              cursor: 'pointer',
                              minWidth: 40,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                              if (logsCurrentPage !== pageNum) {
                                e.target.style.background = '#f9fafb';
                              }
                            }}
                            onMouseLeave={e => {
                              if (logsCurrentPage !== pageNum) {
                                e.target.style.background = '#fff';
                              }
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Next Button */}
                    <button
                      onClick={() => setLogsCurrentPage(prev => Math.min(totalLogsPages, prev + 1))}
                      disabled={logsCurrentPage === totalLogsPages}
                      style={{
                        padding: '8px 12px',
                        background: logsCurrentPage === totalLogsPages ? '#f3f4f6' : '#fff',
                        color: logsCurrentPage === totalLogsPages ? '#9ca3af' : '#374151',
                        border: '1px solid #e5e7eb',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: logsCurrentPage === totalLogsPages ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        if (logsCurrentPage < totalLogsPages) e.target.style.background = '#f9fafb';
                      }}
                      onMouseLeave={e => {
                        if (logsCurrentPage < totalLogsPages) e.target.style.background = '#fff';
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

