import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import logger from "../utils/logger";

// Simple API cache to prevent duplicate requests
const apiCache = {
  cache: new Map(),
  pendingRequests: new Map(),
  
  async fetch(url, ttl = 30000) {
    const now = Date.now();
    const cached = this.cache.get(url);
    
    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data;
    }
    
    // If request is already pending, wait for it
    if (this.pendingRequests.has(url)) {
      return this.pendingRequests.get(url);
    }
    
    // Make new request
    const promise = fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject(res))
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
          <span key={i} className="highlight-text">{part}</span> : 
          part
      )}
    </>
  );
};

/* Local storage helper */
class LocalDB {
  constructor(key = "students") { this.key = key; }
  _readRaw() { try { const raw = localStorage.getItem(this.key); return raw ? JSON.parse(raw) : []; } catch (e) { return []; } }
  async readAll() { return this._readRaw(); }
  async create(item) { const list = this._readRaw(); const toAdd = { ...item, id: item.id ?? Date.now() }; list.push(toAdd); localStorage.setItem(this.key, JSON.stringify(list)); return toAdd; }
  async update(id, item) { const list = this._readRaw(); const idx = list.findIndex(i => i.id === id); if (idx === -1) return null; list[idx] = { ...list[idx], ...item }; localStorage.setItem(this.key, JSON.stringify(list)); return list[idx]; }
  async delete(id) { const list = this._readRaw().filter(i => i.id !== id); localStorage.setItem(this.key, JSON.stringify(list)); return true; }
}
const localDB = new LocalDB();

/* Form component (left narrow card) - copied / adapted from Faculty form */
const StudentFullForm = memo(({ isEdit, onSubmit, onCancel, form, setForm, departments = [], courses = [], academicYears = [] }) => {
  // Filter courses based on selected department
  const filteredCourses = form.department 
    ? courses.filter(c => c.department === form.department)
    : courses;

  return (
    <div className="student-form-overlay" role="dialog" aria-modal="true">
      <form className="student-full-form" onSubmit={onSubmit}>
        <div className="student-form-header-row">
          <h2 className="student-form-title">{isEdit ? "Edit Student" : "Add Student"}</h2>

          <div className="student-form-group min-width-260">
            <label className="sr-only">Department</label>
            <select
              name="department"
              aria-label="Department"
              className="student-form-designation"
              value={form.department}
              onChange={e => {
                // Reset course when department changes
                setForm({ ...form, department: e.target.value, course: "" });
              }}
            >
              <option value="">Select department</option>
              {departments.filter(d => d && d.name).map(d => (
                <option key={d.id ?? d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

      <div className="student-form-row">
        <div className="student-form-group flex-1">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Full Name"
            autoComplete="name"
          />
        </div>
      </div>

      <div className="student-form-row">
        <div className="student-form-group flex-1">
          <label>Course</label>
          <select
            name="course"
            required
            value={form.course}
            onChange={e => {
              // Reset year level when course changes
              setForm({ ...form, course: e.target.value, year: "" });
            }}
            aria-label="Course"
            disabled={!form.department}
          >
            <option value="">
              {form.department ? "Select course" : "Select department first"}
            </option>
            {filteredCourses.filter(c => c && (c.code || c.name)).map(c => (
              <option key={c.id ?? c.code ?? c.name} value={c.code || c.name}>
                {c.code ? `${c.code} - ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="student-form-row">
        <div className="student-form-group flex-1">
          <label>Year Level</label>
          <select
            name="year"
            required
            value={form.year}
            onChange={e => setForm({ ...form, year: e.target.value })}
            aria-label="Year Level"
            disabled={!form.course}
          >
            <option value="">Select Year Level</option>
            {(() => {
              // Find the selected course to get its duration
              const selectedCourse = courses.find(c => c.code === form.course);
              const duration = selectedCourse?.age ? parseInt(selectedCourse.age) : 5;
              
              // Generate year options based on course duration
              const yearOptions = [];
              const yearLabels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'];
              
              for (let i = 0; i < Math.min(duration, 6); i++) {
                yearOptions.push(
                  <option key={i} value={yearLabels[i]}>{yearLabels[i]}</option>
                );
              }
              
              return yearOptions;
            })()}
          </select>
        </div>

        <div className="student-form-group" style={{ flex: 1 }}>
          <label>Age</label>
          <input
            type="number"
            name="age"
            required
            min="0"
            value={form.age}
            onChange={e => setForm({ ...form, age: e.target.value })}
            placeholder="Age"
          />
        </div>

        <div className="student-form-group flex-1">
          <label>Academic Year</label>
          <select
            name="academic_year"
            required
            value={form.academic_year}
            onChange={e => setForm({ ...form, academic_year: e.target.value })}
            aria-label="Academic Year"
          >
            <option value="">Select Academic Year</option>
            {academicYears.filter(ay => ay && ay.name).map(ay => (
              <option key={ay.id ?? ay.name} value={ay.name}>
                {ay.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="student-form-row">
        <div className="student-form-group flex-1">
          <label>Age</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Email address"
            autoComplete="email"
          />
        </div>

        <div className="student-form-group flex-1">
          <label>Gender</label>
          <select
            name="gender"
            required
            value={form.gender}
            onChange={e => setForm({ ...form, gender: e.target.value })}
            aria-label="Gender"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div className="student-form-row">
        <div className="student-form-group flex-1">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone number"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="student-form-row">
        <div className="student-form-group" style={{ flex: 1 }}>
          <label>About</label>
          <textarea
            name="about"
            required
            value={form.about}
            onChange={e => setForm({ ...form, about: e.target.value })}
            placeholder="About this student"
            style={{ minHeight: 80 }}
          />
        </div>
      </div>

      <div className="student-form-actions">
        <button type="submit" className="student-form-submit">{isEdit ? "Save Changes" : "Add Student"}</button>
        <button type="button" className="student-form-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  </div>
  );
});

export default function Student() {
  const navigate = useNavigate();

  useEffect(() => {
    const id = "ghcopilot-inter-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const defaultForm = {
    name: "", course: "", email: "", age: "", gender: "Male", avatar: "", about: "", phone: "", department: "", year: "", academic_year: ""
  };

  const [studentList, setStudentList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [academicYearFilter, setAcademicYearFilter] = useState("All Academic Years");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sorting state
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Checkbox selections for bulk operations
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Function to fetch students with caching
  const fetchStudents = async () => {
    try {
      const data = await apiCache.fetch("/api/students", 60000); // Cache for 1 minute
      // Filter out archived students (check for both true and 1)
      const activeStudents = Array.isArray(data) ? data.filter(s => !s.archived && s.archived !== 1) : [];
      setStudentList(activeStudents);
    } catch {
      try {
        const local = await localDB.readAll();
        const activeStudents = Array.isArray(local) ? local.filter(s => !s.archived && s.archived !== 1) : [];
        setStudentList(activeStudents);
      } catch {
        setStudentList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) await fetchStudents();
    })();
    
    // Refresh only when tab becomes visible (no polling to prevent rate limiting)
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) fetchStudents();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => { 
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // fetch departments for dropdown with caching
  useEffect(() => {
    const fetchDepartments = async () => {
      if (document.hidden) return;
      
      try {
        const json = await apiCache.fetch('/api/departments', 120000); // Cache for 2 minutes
        // Filter out archived departments
        const activeDepts = Array.isArray(json) ? json.filter(d => !d.archived && d.archived !== 1 && d.status !== 'Archived') : [];
        setDepartments(activeDepts);
      } catch {
        setDepartments([]);
      }
    };

    fetchDepartments();
    
    // Refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchDepartments();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // fetch academic years for dropdown with caching
  useEffect(() => {
    const fetchAcademicYears = async () => {
      if (document.hidden) return;
      
      try {
        const json = await apiCache.fetch('/api/academic-years', 120000); // Cache for 2 minutes
        // Filter out archived academic years and sort by year
        const activeAcademicYears = Array.isArray(json) 
          ? json.filter(ay => !ay.archived && ay.archived !== 1)
                .sort((a, b) => {
                  // Extract start year from academic year name (e.g., "2024-2025" -> 2024)
                  const yearA = parseInt((a.name || "").split('-')[0]) || 0;
                  const yearB = parseInt((b.name || "").split('-')[0]) || 0;
                  return yearB - yearA; // Sort descending (newest first)
                })
          : [];
        setAcademicYears(activeAcademicYears);
      } catch {
        setAcademicYears([]);
      }
    };

    fetchAcademicYears();
    
    // Refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchAcademicYears();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // fetch courses for dropdown with caching
  useEffect(() => {
    const fetchCourses = async () => {
      if (document.hidden) return;
      
      try {
        const json = await apiCache.fetch('/api/courses', 120000); // Cache for 2 minutes
        // Filter out archived courses
        const activeCourses = Array.isArray(json) ? json.filter(c => !c.archived && c.archived !== 1 && c.status !== 'archived') : [];
        setCourses(activeCourses);
      } catch {
        setCourses([]);
      }
    };

    fetchCourses();
    
    // Refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchCourses();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleAdd = () => { setForm(defaultForm); setShowAdd(true); };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, age: form.age === "" ? null : Number(form.age), avatar: form.avatar || "https://randomuser.me/api/portraits/men/34.jpg" };
    try {
      const res = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { 
        const newStudent = await res.json(); 
        setStudentList(prev => [...prev, newStudent]); 
        logger.logCreate('Student', `Added student: ${payload.name}`);
        apiCache.clear('/api/students'); // Clear cache after create
      }
      else { const created = await localDB.create({ ...payload }); setStudentList(prev => [...prev, created]); }
    } catch { const created = await localDB.create({ ...payload }); setStudentList(prev => [...prev, created]); }
    finally { setShowAdd(false); setForm(defaultForm); }
  };

  const handleEdit = (item) => { 
    if (!item || !item.id) return;
    const idx = studentList.findIndex(s => s && s.id === item.id);
    if (idx === -1) return;
    setEditIndex(idx); 
    setForm({ ...defaultForm, ...item }); 
    setShowEdit(true); 
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editIndex === null) return;
    const id = studentList[editIndex]?.id;
    if (!id) return;
    const payload = { ...form, age: form.age === "" ? null : Number(form.age) };
    try {
      const res = await fetch(`/api/students/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { 
        const updated = await res.json(); 
        setStudentList(prev => prev.map(s => s.id === updated.id ? updated : s)); 
        logger.logUpdate('Student', `Updated student: ${payload.name}`);
        apiCache.clear('/api/students'); // Clear cache after update
      }
      else { const updated = await localDB.update(id, payload); setStudentList(prev => prev.map(s => s.id === id ? updated : s)); }
    } catch { const updated = await localDB.update(id, payload); setStudentList(prev => prev.map(s => s.id === id ? updated : s)); }
    finally { setShowEdit(false); setEditIndex(null); setForm(defaultForm); }
  };

  const handleArchive = async (item) => {
    if (!item || !item.id) return;
    if (!window.confirm("Are you sure you want to archive this student?")) return;
    try {
      const res = await fetch(`/api/students/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true })
      });
      if (res.ok) {
        setStudentList(prev => prev.map(s => s.id === item.id ? { ...s, archived: true } : s));
        logger.logArchive('Student', `Archived student: ${item.name}`);
        apiCache.clear('/api/students'); // Clear cache after archive
      }
    } catch (err) {
      console.error('Failed to archive student:', err);
    }
    if (selectedUser && selectedUser.id === item.id) setSelectedUser(null);
  };

  // Bulk archive all selected
  const handleArchiveAll = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to archive');
      return;
    }
    
    if (!window.confirm(`Archive ${selectedStudents.length} selected student(s)?`)) return;
    
    try {
      for (const id of selectedStudents) {
        const res = await fetch(`/api/students/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: true })
        });
        if (res.ok) {
          const student = studentList.find(s => s.id === id);
          logger.logArchive('Student', `Archived student: ${student?.name || 'Unknown'}`);
        }
      }
      // Refresh the list
      await fetchStudents();
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error archiving students:', error);
    }
  };

  // Bulk restore all selected
  const handleRestoreAll = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to restore');
      return;
    }
    
    if (!window.confirm(`Restore ${selectedStudents.length} selected student(s)?`)) return;
    
    try {
      for (const id of selectedStudents) {
        const res = await fetch(`/api/students/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: false })
        });
        if (res.ok) {
          const student = studentList.find(s => s.id === id);
          logger.logRestore('Student', `Restored student: ${student?.name || 'Unknown'}`);
        }
      }
      // Clear cache and refresh the list
      apiCache.clear('/api/students');
      await fetchStudents();
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error restoring students:', error);
    }
  };

  // Toggle checkbox
  const handleCheckboxToggle = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredList = studentList.filter(s => {
    const matchesSearch = (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (s.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = departmentFilter === "All Departments" || s.department === departmentFilter;
    
    // Match course by either code or name
    let matchesCourse = courseFilter === "All Courses";
    if (!matchesCourse && s.course) {
      // Find the course that matches the student's course name
      const studentCourse = courses.find(c => c.name === s.course);
      if (studentCourse) {
        // Check if the selected filter matches either the code or name
        matchesCourse = (studentCourse.code === courseFilter) || (studentCourse.name === courseFilter);
      } else {
        // Fallback: direct comparison if course not found in courses array
        matchesCourse = s.course === courseFilter;
      }
    }
    
    const matchesAcademicYear = academicYearFilter === "All Academic Years" || s.academic_year === academicYearFilter;
    return matchesSearch && matchesDepartment && matchesCourse && matchesAcademicYear;
  });

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Apply sorting
  const sortedList = [...filteredList].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    
    // Convert to string for comparison
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Select all toggle
  const handleSelectAllToggle = () => {
    setSelectedStudents(prev => 
      prev.length === sortedList.length ? [] : sortedList.map(s => s.id)
    );
  };

  const handleUserClick = (user) => setSelectedUser(user);
  const handleBackToList = () => setSelectedUser(null);

  const fontStyle = { fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" };

  return (
    <div className="student-page-wrapper" style={fontStyle}>
      <Navbar />
      <main className="student-main-container" style={fontStyle}>
        {!selectedUser && (
          <div className="student-page-header">
            <h1>Students</h1>
            <p>Manage student information</p>
          </div>
        )}

        {!selectedUser && (
          <div className="student-toolbar">
            <div className="student-search-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search students..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="student-filter-select"
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
            >
              <option value="All Courses">All Courses</option>
              {courses.map(c => (
                <option key={c.id ?? c.name} value={c.code || c.name}>{c.code || c.name}</option>
              ))}
            </select>
            <select
              className="student-filter-select"
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
            >
              <option value="All Departments">All Departments</option>
              {departments.filter(d => d && d.name).map(d => (
                <option key={d.id ?? d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <select
              className="student-filter-select"
              value={academicYearFilter}
              onChange={e => setAcademicYearFilter(e.target.value)}
            >
              <option value="All Academic Years">All Academic Years</option>
              {academicYears.filter(ay => ay && ay.name).map(ay => (
                <option key={ay.id ?? ay.name} value={ay.name}>{ay.name}</option>
              ))}
            </select>
            {selectedStudents.length > 0 && (
              <button 
                className="student-archive-btn"
                onClick={handleArchiveAll}
              >
                📦 Archive Selected ({selectedStudents.length})
              </button>
            )}
            <button 
              className="student-add-btn-primary"
              onClick={handleAdd}
            >
              <span>+</span>
              Add Student
            </button>
          </div>
        )}

        <div className="student-header" style={{ display: selectedUser ? 'flex' : 'none' }}>
          <button className="student-back-btn" onClick={() => selectedUser ? handleBackToList() : navigate(-1)} aria-label="Go back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#183153" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="student-actions">
          </div>
        </div>

  {showAdd && <StudentFullForm isEdit={false} onSubmit={handleAddSubmit} onCancel={() => { setShowAdd(false); setForm(defaultForm); }} form={form} setForm={setForm} departments={departments} courses={courses} academicYears={academicYears} />}

  {showEdit && <StudentFullForm isEdit={true} onSubmit={handleEditSubmit} onCancel={() => { setShowEdit(false); setForm(defaultForm); setEditIndex(null); }} form={form} setForm={setForm} departments={departments} courses={courses} academicYears={academicYears} />}

        {!showAdd && !showEdit && selectedUser ? (
          <div className="student-detail-wrapper">
            <div className="student-detail-left">
              <img src={selectedUser.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={selectedUser.name} className="student-detail-avatar" />
              <div className="student-detail-name">{selectedUser.name}</div>
              <div className="student-detail-department">{(selectedUser.department || "").toUpperCase()}</div>

              <div className="student-detail-actions">
                <button className="student-form-submit" onClick={() => handleEdit(selectedUser)}>Edit</button>
                <button className="student-form-cancel" onClick={() => { handleArchive(selectedUser); handleBackToList(); }}>Archive</button>
              </div>
            </div>

            <div className="student-detail-right">
              <div className="student-detail-section-title">About</div>
              <div className="student-detail-about">{selectedUser.about}</div>
              <div className="student-detail-stats">
                <div className="student-detail-stat-item">
                  <div className="stat-label">Year</div>
                  <div className="stat-value">{selectedUser.year}</div>
                </div>
                <div className="student-detail-stat-item">
                  <div className="stat-label">Gender</div>
                  <div className="stat-value">{selectedUser.gender}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="student-table-container student-table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={sortedList.length > 0 && selectedStudents.length === sortedList.length}
                      onChange={handleSelectAllToggle}
                    />
                  </th>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('course')}>
                    Course {sortField === 'course' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('department')}>
                    Department {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('academic_year')}>
                    Academic Year {sortField === 'academic_year' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('email')}>
                    Email address {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('year')}>
                    Year Level {sortField === 'year' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('gender')}>
                    Gender {sortField === 'gender' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="actions-col"></th>
                </tr>
              </thead>
              <tbody>
                {(!loading && sortedList.length === 0) && <tr><td colSpan="9">No students found.</td></tr>}
                {(loading) && <tr><td colSpan="9">Loading…</td></tr>}
                {sortedList.map((s, idx) => (
                  <tr key={s.id ?? idx} className="clickable">
                    <td className="checkbox-cell" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.id)}
                        onChange={() => handleCheckboxToggle(s.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td onClick={() => handleUserClick(s)}>
                      <div className="student-avatar-name">
                        <img src={s.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={s.name} className="student-avatar" />
                        <div>
                          <div style={{ fontWeight: 600 }}><HighlightText text={s.name} highlight={search} /></div>
                          <div style={{ color: "#888", fontSize: 13 }}>{s.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td onClick={() => handleUserClick(s)}><HighlightText text={s.course} highlight={search} /></td>
                    <td onClick={() => handleUserClick(s)}><HighlightText text={s.department} highlight={search} /></td>
                    <td onClick={() => handleUserClick(s)}>
                      {s.academic_year ? (
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          background: '#e0f2fe',
                          color: '#0369a1'
                        }}>
                          <HighlightText text={s.academic_year} highlight={search} />
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontSize: '13px' }}>Not set</span>
                      )}
                    </td>
                    <td onClick={() => handleUserClick(s)}><HighlightText text={s.email} highlight={search} /></td>
                    <td onClick={() => handleUserClick(s)}>{s.year}</td>
                    <td onClick={() => handleUserClick(s)}>{s.gender}</td>
                    <td>
                      <button className="student-icon-btn" title="Edit" aria-label="Edit student" onClick={e => { e.stopPropagation(); handleEdit(s); }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button className="student-icon-btn" title="Archive" aria-label="Archive student" onClick={e => { e.stopPropagation(); handleArchive(s); }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 3h18v6H3V3z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 13h4" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showFilter && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Filter (Demo)</h3>
              <p>Here you can add filter options.</p>
              <button className="student-filter-btn" onClick={() => setShowFilter(false)}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}