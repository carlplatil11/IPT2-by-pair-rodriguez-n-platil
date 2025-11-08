import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import logger from '../utils/logger';

// API Cache utility
const apiCache = {
    cache: new Map(),
    pendingRequests: new Map(),
    
    async fetch(url, ttl = 120000) {
        const now = Date.now();
        const cached = this.cache.get(url);
        
        if (cached && (now - cached.timestamp) < ttl) {
            return cached.data;
        }
        
        if (this.pendingRequests.has(url)) {
            return this.pendingRequests.get(url);
        }
        
        const promise = fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                this.cache.set(url, { data, timestamp: now });
                this.pendingRequests.delete(url);
                return data;
            })
            .catch(err => {
                this.pendingRequests.delete(url);
                throw err;
            });
        
        this.pendingRequests.set(url, promise);
        return promise;
    },
    
    clear(url) {
        if (url) {
            this.cache.delete(url);
        } else {
            this.cache.clear();
        }
    }
};

// Text highlighting component
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <>{text}</>;
  
  const parts = String(text).split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? 
          <span key={i} className="highlight">{part}</span> : 
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
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');
  
  // Checkbox selections for bulk operations
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedAcademicYears, setSelectedAcademicYears] = useState([]);
  
  // Pagination for logs
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const logsPerPage = 10; // 10 logs per page

  // Fetch courses from API
  const [courseList, setCourseList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [academicYearList, setAcademicYearList] = useState([]);
  const [logList, setLogList] = useState([]);
  
  // Filter to show only ARCHIVED items in Settings (opposite of other components)
  const archivedCourseList = courseList.filter(c => c.status === 'archived' || c.archived === true || c.archived === 1);
  const archivedDepartmentList = departmentList.filter(d => d.status === 'Archived' || d.archived === true || d.archived === 1);
  const archivedFacultyList = facultyList.filter(f => f.archived === true || f.archived === 1);
  const archivedStudentList = studentList.filter(s => s.archived === true || s.archived === 1);
  // Academic Years tab shows ALL academic years (not just archived)
  const displayedAcademicYearList = academicYearList; // Show all academic years
  
  // Get unique departments for filtering
  const uniqueDepartments = [...new Set(archivedCourseList.map(c => c.department).filter(Boolean))];
  const uniqueFacultyDepartments = [...new Set(archivedFacultyList.map(f => f.department).filter(Boolean))];
  const uniqueStudentDepartments = [...new Set(archivedStudentList.map(s => s.department).filter(Boolean))];
  const uniqueAcademicYearStatuses = [...new Set(displayedAcademicYearList.map(ay => ay.status).filter(Boolean))];
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

  const filteredAcademicYears = displayedAcademicYearList.filter(ay => {
    const matchesSearch = (ay.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (ay.status || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = academicYearFilter === 'all' || ay.status === academicYearFilter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Extract start year from academic year name (e.g., "2024-2025" -> 2024)
    const yearA = parseInt((a.name || "").split('-')[0]) || 0;
    const yearB = parseInt((b.name || "").split('-')[0]) || 0;
    return yearB - yearA; // Sort descending (newest first)
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
    
    const fetchCourses = async () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      try {
        const data = await apiCache.fetch('/api/courses', 180000); // 3 minute cache
        setCourseList(Array.isArray(data) ? data : []);
      } catch {
        setCourseList([]);
      } finally {
        isFetching = false;
      }
    };
    
    fetchCourses();
    // No polling - courses rarely change
    // Data will be refreshed when component remounts or tab becomes visible
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchCourses();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let isFetching = false;
    
    const fetchDepartments = async () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      try {
        const data = await apiCache.fetch('/api/departments', 180000); // 3 minute cache
        setDepartmentList(Array.isArray(data) ? data : []);
      } catch {
        setDepartmentList([]);
      } finally {
        isFetching = false;
      }
    };
    
    fetchDepartments();
    // No polling - departments rarely change
    // Data will be refreshed when component remounts or tab becomes visible
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchDepartments();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let isFetching = false;
    
    const fetchFaculties = async () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      try {
        const data = await apiCache.fetch('/api/faculties', 180000); // 3 minute cache
        setFacultyList(Array.isArray(data) ? data : []);
      } catch {
        setFacultyList([]);
      } finally {
        isFetching = false;
      }
    };
    
    fetchFaculties();
    // No polling - faculties rarely change
    // Data will be refreshed when component remounts or tab becomes visible
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchFaculties();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let isFetching = false;
    
    const fetchStudents = async () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      try {
        const data = await apiCache.fetch('/api/students', 180000); // 3 minute cache
        setStudentList(Array.isArray(data) ? data : []);
      } catch {
        setStudentList([]);
      } finally {
        isFetching = false;
      }
    };
    
    fetchStudents();
    // No polling - students rarely change
    // Data will be refreshed when component remounts or tab becomes visible
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchStudents();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let isFetching = false;
    
    const fetchAcademicYears = async () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      try {
        const data = await apiCache.fetch('/api/academic-years', 180000); // 3 minute cache
        setAcademicYearList(Array.isArray(data) ? data : []);
      } catch {
        setAcademicYearList([]);
      } finally {
        isFetching = false;
      }
    };
    
    fetchAcademicYears();
    // No polling - academic years rarely change
    // Data will be refreshed when component remounts or tab becomes visible
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchAcademicYears();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    let isFetching = false;
    
    const fetchLogs = async () => {
      // Only fetch if the document is visible (tab is active) and not already fetching
      if (document.hidden || isFetching) return;
      
      isFetching = true;
      try {
        const data = await apiCache.fetch('/api/logs', 60000); // 1 minute cache for logs
        setLogList(Array.isArray(data) ? data : []);
      } catch {
        setLogList([]);
      } finally {
        isFetching = false;
      }
    };
    
    fetchLogs();
    
    // Poll logs every minute since they change frequently
    const interval = setInterval(fetchLogs, 60000);
    
    // Also refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchLogs();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Default form value objects
  const courseDefault = { name: '', department: '', age: '', gender: 'Undergraduate', about: '' };
  const departmentDefault = { name: '', head: '', email: '', description: '', status: 'Active' };
  const academicYearDefault = { name: '', start_date: '', end_date: '', status: 'active', archived: false };

  // Form and modal state (must be top-level, not inside another hook)
  const [form, setForm] = useState(courseDefault);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false); // currently unused editing modal placeholder
  const [showAddAcademicYear, setShowAddAcademicYear] = useState(false);

  // Reset form when changing tabs
  useEffect(() => {
    if (activeTab === 'courses') {
      setForm(courseDefault);
    } else if (activeTab === 'departments') {
      setForm(departmentDefault);
    } else if (activeTab === 'academic-years') {
      setForm(academicYearDefault);
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
    } else if (activeTab === 'academic-years') {
      if (!form.name || form.name.trim().length < 2) {
        alert('Academic year name is required (min 2 chars)');
        return;
      }

      const payload = { ...form };
      
      try {
        if (editing) {
          const res = await fetch(`/api/academic-years/${editing}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const updated = await res.json();
            setAcademicYearList(prev => prev.map(ay => ay.id === editing ? updated : ay));
            logger.logUpdate('Academic Year', `Updated academic year: ${updated.name}`);
          }
        } else {
          const res = await fetch('/api/academic-years', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const newAY = await res.json();
            setAcademicYearList(prev => [...prev, newAY]);
            logger.logCreate('Academic Year', `Created academic year: ${newAY.name}`);
          }
        }
      } catch (error) {
        console.error('Error saving academic year:', error);
        logger.logError('Academic Year', 'Failed to save academic year');
      }
    }
    
    setForm(activeTab === 'courses' ? courseDefault : activeTab === 'departments' ? departmentDefault : academicYearDefault);
    setEditing(null);
    setShowModal(false);
    setShowAddAcademicYear(false);
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
    // Different confirmation message for academic years
    let confirmMessage = 'Restore this item? Note: This will NOT automatically restore related students/faculty. You must restore them separately if needed.';
    
    if (activeTab === 'academic-years') {
      confirmMessage = 'Restore this academic year? This will automatically restore all students and faculty associated with this academic year.';
    } else if (activeTab === 'departments') {
      confirmMessage = 'Restore this department? This will automatically restore all students and faculty in this department.';
    }
    
    if (!skipConfirm && !window.confirm(confirmMessage)) return;
    
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
      } else if (activeTab === 'academic-years') {
        const academicYear = academicYearList.find(ay => ay.id === id);
        const res = await fetch(`/api/academic-years/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: false })
        });
        if (res.ok) {
          const updated = await res.json();
          setAcademicYearList(prev => prev.map(ay => ay.id === id ? updated : ay));
          logger.logRestore('Academic Year', `Restored academic year: ${academicYear?.name || 'Unknown'}`);
        }
      }
    } catch (error) {
      console.error('Error unarchiving item:', error);
      const type = activeTab === 'courses' ? 'Course' : activeTab === 'departments' ? 'Department' : activeTab === 'faculty' ? 'Faculty' : activeTab === 'students' ? 'Student' : 'Academic Year';
      logger.logError(type, `Failed to restore item`);
    }
  };

  const handleArchiveItem = async (id, skipConfirm = false) => {
    // Different confirmation message for academic years
    let confirmMessage = 'Archive this item?';
    
    if (activeTab === 'academic-years') {
      confirmMessage = 'Archive this academic year? This will automatically archive all students and faculty associated with this academic year.';
    }
    
    if (!skipConfirm && !window.confirm(confirmMessage)) return;
    
    try {
      if (activeTab === 'academic-years') {
        const academicYear = academicYearList.find(ay => ay.id === id);
        const res = await fetch(`/api/academic-years/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: true })
        });
        if (res.ok) {
          const updated = await res.json();
          setAcademicYearList(prev => prev.map(ay => ay.id === id ? updated : ay));
          logger.logArchive('Academic Year', `Archived academic year: ${academicYear?.name || 'Unknown'}`);
        }
      }
    } catch (error) {
      console.error('Error archiving item:', error);
      logger.logError('Academic Year', `Failed to archive item`);
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
      } else if (activeTab === 'academic-years') {
        const academicYear = academicYearList.find(ay => ay.id === id);
        const res = await fetch(`/api/academic-years/${id}`, { 
          method: 'DELETE'
        });
        if (res.ok) {
          setAcademicYearList(prev => prev.filter(ay => ay.id !== id));
          logger.logDelete('Academic Year', `Permanently deleted academic year: ${academicYear?.name || 'Unknown'}`);
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      const type = activeTab === 'courses' ? 'Course' : activeTab === 'departments' ? 'Department' : activeTab === 'faculty' ? 'Faculty' : activeTab === 'students' ? 'Student' : 'Academic Year';
      logger.logError(type, `Failed to delete item`);
    }
  };

  // Bulk operations for restore all
  const handleRestoreAll = async () => {
    const itemsToRestore = activeTab === 'courses' ? selectedCourses :
                          activeTab === 'departments' ? selectedDepartments :
                          activeTab === 'faculty' ? selectedFaculty :
                          activeTab === 'academic-years' ? selectedAcademicYears :
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
                         activeTab === 'academic-years' ? selectedAcademicYears :
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
      else if (activeTab === 'academic-years') setSelectedAcademicYears([]);
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
    } else if (activeTab === 'academic-years') {
      setSelectedAcademicYears(prev => 
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
    } else if (activeTab === 'academic-years') {
      setSelectedAcademicYears(prev => 
        prev.length === filteredAcademicYears.length ? [] : filteredAcademicYears.map(ay => ay.id)
      );
    }
  };

  return (
    <div className="settings-layout">
      <Navbar />
      <main className="student-container settings-main">
        {/* Modern Header */}
        <div className="settings-header">
          <h1>System Settings</h1>
          <p>Manage archived items and system configuration</p>
        </div>

        {/* Search and Filters Bar */}
        <div className="settings-searchbar">
          <div className="settings-searchbar-input-wrapper">
            <svg className="settings-searchbar-icon" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder={`Search archived ${activeTab}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="settings-searchbar-input"
            />
          </div>
          
          {/* Filter Dropdown */}
          {activeTab === 'courses' && uniqueDepartments.length > 0 && (
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="settings-filter-dropdown"
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
              className="settings-filter-dropdown"
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
              className="settings-filter-dropdown"
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
              className="settings-filter-dropdown"
            >
              <option value="all">All Departments</option>
              {uniqueStudentDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
          
          {activeTab === 'academic-years' && uniqueAcademicYearStatuses.length > 0 && (
            <select
              value={academicYearFilter}
              onChange={e => setAcademicYearFilter(e.target.value)}
              className="settings-filter-dropdown"
            >
              <option value="all">All Statuses</option>
              {uniqueAcademicYearStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
          )}
          
          {activeTab === 'logs' && uniqueLogTypes.length > 0 && (
            <select
              value={logFilter}
              onChange={e => setLogFilter(e.target.value)}
              className="settings-filter-dropdown"
            >
              <option value="all">All Types</option>
              {uniqueLogTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}
          
          <div className="settings-count">
            {activeTab === 'courses' && `${selectedCourses.length > 0 ? `${selectedCourses.length} selected • ` : ''}${filteredCourses.length} of ${archivedCourseList.length} items`}
            {activeTab === 'departments' && `${selectedDepartments.length > 0 ? `${selectedDepartments.length} selected • ` : ''}${filteredDepartments.length} of ${archivedDepartmentList.length} items`}
            {activeTab === 'faculty' && `${selectedFaculty.length > 0 ? `${selectedFaculty.length} selected • ` : ''}${filteredFaculty.length} of ${archivedFacultyList.length} items`}
            {activeTab === 'students' && `${selectedStudents.length > 0 ? `${selectedStudents.length} selected • ` : ''}${filteredStudents.length} of ${archivedStudentList.length} items`}
            {activeTab === 'academic-years' && `${selectedAcademicYears.length > 0 ? `${selectedAcademicYears.length} selected • ` : ''}${filteredAcademicYears.length} of ${displayedAcademicYearList.length} items`}
            {activeTab === 'logs' && `${filteredLogs.length} of ${logList.length} entries`}
          </div>
          {activeTab === 'academic-years' && (
            <button
              onClick={() => setShowAddAcademicYear(true)}
              className="btn btn-primary"
            >
              + Add Academic Year
            </button>
          )}
          {activeTab === 'logs' && logList.length > 0 && (
            <button
              onClick={async () => {
                if (window.confirm('Clear all logs? This action cannot be undone!')) {
                  try {
                    await logger.clearLogs();
                    setLogList([]);
                    alert('All logs cleared successfully');
                  } catch (error) {
                    console.error('Error clearing logs:', error);
                    alert('Failed to clear logs');
                  }
                }
              }}
              className="btn btn-danger"
            >
              🗑️ Clear All Logs
            </button>
          )}
          {activeTab !== 'logs' && activeTab !== 'academic-years' && (
            <>
              <button
                onClick={handleRestoreAll}
                disabled={
                  (activeTab === 'courses' && selectedCourses.length === 0) ||
                  (activeTab === 'departments' && selectedDepartments.length === 0) ||
                  (activeTab === 'faculty' && selectedFaculty.length === 0) ||
                  (activeTab === 'students' && selectedStudents.length === 0)
                }
                className="btn btn-success"
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
                className="btn btn-danger"
              >
                🗑️ Delete Selected
              </button>
            </>
          )}
        </div>

        {/* Tab Navigation and Courses Table - Aligned Wrapper */}
  <div className="settings-content-wrapper">
          <div className="settings-tab-navigation">
            <div className="tab-container">
              <button
                onClick={() => setActiveTab('courses')}
                className={activeTab === 'courses' ? 'active' : ''}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={activeTab === 'departments' ? 'active' : ''}
              >
                Departments
              </button>
              <button
                onClick={() => setActiveTab('faculty')}
                className={activeTab === 'faculty' ? 'active' : ''}
              >
                Faculty
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={activeTab === 'students' ? 'active' : ''}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('academic-years')}
                className={activeTab === 'academic-years' ? 'active' : ''}
              >
                Academic Years
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={activeTab === 'logs' ? 'active' : ''}
              >
                System Logs
              </button>
            </div>
          </div>

          {/* Courses Table */}
          {activeTab === 'courses' && (
            <div className="settings-card-section">
              <div className="settings-card">
                <table className="settings-table">
                  <thead>
                    <tr>
                    <th className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={filteredCourses.length > 0 && selectedCourses.length === filteredCourses.length}
                        onChange={handleSelectAllToggle}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th>Course Name</th>
                    <th>Department</th>
                    <th>Level</th>
                    <th>Credits</th>
                    <th className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <div className="empty-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                            <path d="M3 3h18v4H3z" />
                            <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                          </svg>
                        </div>
                        <div className="empty-title">
                          {search ? 'No archived courses match your search' : 'No archived courses'}
                        </div>
                        <div className="empty-subtitle">
                          {search ? 'Try adjusting your search terms' : 'Archived courses will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredCourses.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="col-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(item.id)}
                          onChange={() => handleCheckboxToggle(item.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td className="name">
                        <HighlightText text={item.name} highlight={search} />
                      </td>
                      <td>
                        <HighlightText text={item.department} highlight={search} />
                      </td>
                      <td>{item.gender}</td>
                      <td>{item.age}</td>
                      <td className="actions">
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          className="btn btn-success"
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          className="btn btn-danger"
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
            <div className="settings-card-section">
              <div className="settings-card">
                <table className="settings-table">
                <thead>
                  <tr>
                    <th className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={filteredDepartments.length > 0 && selectedDepartments.length === filteredDepartments.length}
                        onChange={handleSelectAllToggle}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th>Department Name</th>
                    <th>Dean</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <div className="empty-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                            <path d="M3 3h18v4H3z" />
                            <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                          </svg>
                        </div>
                        <div className="empty-title">
                          {search ? 'No archived departments match your search' : 'No archived departments'}
                        </div>
                        <div className="empty-subtitle">
                          {search ? 'Try adjusting your search terms' : 'Archived departments will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredDepartments.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="col-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(item.id)}
                          onChange={() => handleCheckboxToggle(item.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td className="name">
                        <HighlightText text={item.name} highlight={search} />
                      </td>
                      <td>
                        <HighlightText text={item.head || '-'} highlight={search} />
                      </td>
                      <td>
                        <HighlightText text={item.email || '-'} highlight={search} />
                      </td>
                      <td>
                        <span className="pill pill-muted">Archived</span>
                      </td>
                      <td className="actions">
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          className="btn btn-success"
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          className="btn btn-danger"
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
            <div className="settings-card-section">
              <div className="settings-card">
                <table className="settings-table">
                <thead>
                  <tr>
                    <th className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={filteredFaculty.length > 0 && selectedFaculty.length === filteredFaculty.length}
                        onChange={handleSelectAllToggle}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Gender</th>
                    <th className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.length === 0 && (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        <div className="empty-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div className="empty-title">
                          {search ? 'No archived faculty match your search' : 'No archived faculty'}
                        </div>
                        <div className="empty-subtitle">
                          {search ? 'Try adjusting your search terms' : 'Archived faculty will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredFaculty.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="col-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFaculty.includes(item.id)}
                          onChange={() => handleCheckboxToggle(item.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td className="name">
                        <HighlightText text={item.name} highlight={search} />
                      </td>
                      <td>
                        <HighlightText text={item.email || '-'} highlight={search} />
                      </td>
                      <td>
                        <HighlightText text={item.department || '-'} highlight={search} />
                      </td>
                      <td>
                        <HighlightText text={item.subject || '-'} highlight={search} />
                      </td>
                      <td>{item.gender || '-'}</td>
                      <td className="actions">
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          className="btn btn-success"
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          className="btn btn-danger"
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
            <div className="settings-card-section">
              <div className="settings-card">
                <table className="settings-table">
                <thead>
                  <tr>
                    <th className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                        onChange={handleSelectAllToggle}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Gender</th>
                    <th className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="8" className="empty-state">
                        <div className="empty-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div className="empty-title">
                          {search ? 'No archived students match your search' : 'No archived students'}
                        </div>
                        <div className="empty-subtitle">
                          {search ? 'Try adjusting your search terms' : 'Archived students will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredStudents.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="col-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(item.id)}
                          onChange={() => handleCheckboxToggle(item.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td className="name">
                        <HighlightText text={item.name} highlight={search} />
                      </td>
                      <td>
                        <HighlightText text={item.email || '-'} highlight={search} />
                      </td>
                      <td>
                        <HighlightText text={item.department || '-'} highlight={search} />
                      </td>
                      <td>
                        <HighlightText text={item.course || '-'} highlight={search} />
                      </td>
                      <td>{item.year || '-'}</td>
                      <td>{item.gender || '-'}</td>
                      <td className="actions">
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          className="btn btn-success"
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          className="btn btn-danger"
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

        {/* Academic Years Tab */}
          {activeTab === 'academic-years' && (
            <div className="settings-card-section">
              <div className="settings-card">
                <table className="settings-table">
                <thead>
                  <tr>
                    <th className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={filteredAcademicYears.length > 0 && selectedAcademicYears.length === filteredAcademicYears.length}
                        onChange={handleSelectAllToggle}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    </th>
                    <th>Academic Year</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th className="actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAcademicYears.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <div className="empty-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div className="empty-title">
                          {search ? 'No academic years match your search' : 'No academic years'}
                        </div>
                        <div className="empty-subtitle">
                          {search ? 'Try adjusting your search terms' : 'Academic years will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredAcademicYears.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="col-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedAcademicYears.includes(item.id)}
                          onChange={() => handleCheckboxToggle(item.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </td>
                      <td className="name">
                        <HighlightText text={item.name} highlight={search} />
                      </td>
                      <td>
                        {item.start_date ? new Date(item.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td>
                        {item.end_date ? new Date(item.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td>
                        <div className="inline-row">
                          <span className={`pill ${item.status === 'active' ? 'pill-success' : item.status === 'inactive' ? 'pill-danger' : 'pill-warning'} text-capitalize`}>
                            <HighlightText text={item.status} highlight={search} />
                          </span>
                          {(item.archived === true || item.archived === 1) && (
                            <span className="pill pill-muted">Archived</span>
                          )}
                        </div>
                      </td>
                      <td className="actions">
                        {(item.archived === true || item.archived === 1) ? (
                          <button 
                            onClick={() => handleUnarchive(item.id)}
                            className="btn btn-success"
                            title="Restore"
                          >
                            ↻ Restore
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleArchiveItem(item.id)}
                            className="btn btn-warning"
                            title="Archive"
                          >
                            📦 Archive
                          </button>
                        )}
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          className="btn btn-danger"
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
            <div className="settings-card-section">
              <div className="settings-card">
                <table className="settings-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Type</th>
                    <th>Details</th>
                    <th className="actions">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <div className="empty-icon">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                            <path d="M16 13H8" />
                            <path d="M16 17H8" />
                            <path d="M10 9H8" />
                          </svg>
                        </div>
                        <div className="empty-title">
                          {search ? 'No logs match your search' : 'No logs available'}
                        </div>
                        <div className="empty-subtitle">
                          {search ? 'Try adjusting your search terms' : 'System activity logs will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {paginatedLogs.map((log, idx) => {
                    const date = new Date(log.timestamp);
                    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const statusPill = log.status === 'success' ? 'pill-success' : log.status === 'warning' ? 'pill-warning' : 'pill-danger';

                    return (
                      <tr key={log.id}>
                        <td>
                          <div className="log-time">
                            <HighlightText text={timeStr} highlight={search} />
                          </div>
                          <div><HighlightText text={dateStr} highlight={search} /></div>
                        </td>
                        <td>
                          <span className="log-user"><HighlightText text={log.user} highlight={search} /></span>
                        </td>
                        <td>
                          <HighlightText text={log.action} highlight={search} />
                        </td>
                        <td>
                          <span className="pill pill-muted">{log.type}</span>
                        </td>
                        <td>
                          <HighlightText text={log.details} highlight={search} />
                        </td>
                        <td className="actions">
                          <span className={`pill ${statusPill} text-capitalize`}>{log.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {filteredLogs.length > 0 && (
                <div className="pagination-bar">
                  <div className="pagination-info">
                    Showing {logsStartIndex + 1} to {Math.min(logsEndIndex, filteredLogs.length)} of {filteredLogs.length} logs
                  </div>
                  <div className="pagination-controls">
                    {/* Previous Button */}
                    <button
                      onClick={() => setLogsCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={logsCurrentPage === 1}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="pagination-controls" style={{ gap: 4 }}>
                      {Array.from({ length: totalLogsPages }, (_, i) => i + 1).map(pageNum => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = pageNum === 1 || 
                                        pageNum === totalLogsPages || 
                                        Math.abs(pageNum - logsCurrentPage) <= 1;
                        
                        // Show ellipsis
                        if (!showPage && (pageNum === logsCurrentPage - 2 || pageNum === logsCurrentPage + 2)) {
                          return (
                            <span key={pageNum} className="page-ellipsis">
                              ...
                            </span>
                          );
                        }
                        
                        if (!showPage) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setLogsCurrentPage(pageNum)}
                            className={`page-btn ${logsCurrentPage === pageNum ? 'active' : ''}`}
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
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Academic Year Modal */}
        {showAddAcademicYear && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h2 className="modal-title">Add New Academic Year</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>
                    Academic Year Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., 2024-2025"
                    required
                    className="form-control"
                  />
                  <small className="form-hint">
                    Format: YYYY-YYYY (e.g., 2024-2025)
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Status *
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    required
                    className="form-control"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <small className="form-hint">
                    Active academic years will be available for selection in Faculty, Student, Course, and Department sections
                  </small>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAcademicYear(false);
                      setForm(academicYearDefault);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Add Academic Year
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        </div>
      </main>
    </div>
  );
}

