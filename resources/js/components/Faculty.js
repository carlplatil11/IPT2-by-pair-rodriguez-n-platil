// ...existing code...
import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import logger from "../utils/logger";

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
  constructor(key = "faculties") { this.key = key; }
  _read() { try { const raw = localStorage.getItem(this.key); return raw ? JSON.parse(raw) : []; } catch { return []; } }
  async readAll() { return this._read(); }
  async create(item) { const list = this._read(); const toAdd = { ...item, id: item.id ?? Date.now() }; list.push(toAdd); localStorage.setItem(this.key, JSON.stringify(list)); return toAdd; }
  async update(id, patch) { const list = this._read(); const i = list.findIndex(x => x.id === id); if (i === -1) return null; list[i] = { ...list[i], ...patch }; localStorage.setItem(this.key, JSON.stringify(list)); return list[i]; }
  async delete(id) { const list = this._read().filter(x => x.id !== id); localStorage.setItem(this.key, JSON.stringify(list)); return true; }
}
const localDB = new LocalDB();

/* Form overlay (left card) */
const FacultyFullForm = memo(({ isEdit, onSubmit, onCancel, form, setForm, departments = [], courses = [], academicYears = [] }) => {
  // Filter courses based on selected department
  const filteredCourses = form.department 
    ? courses.filter(c => c.department === form.department)
    : courses;

  return (
    <div className="faculty-form-overlay" role="dialog" aria-modal="true">
      <form className="faculty-full-form" onSubmit={onSubmit}>
        <div className="faculty-form-header-row">
          <h2 className="faculty-form-title">{isEdit ? "Edit Faculty" : "Add Faculty"}</h2>
          <div className="faculty-form-group min-width-260">
            <label className="sr-only">Department</label>
            <select
              required
              className="faculty-form-designation"
              value={form.department}
              onChange={e => {
                // Reset course when department changes
                setForm({ ...form, department: e.target.value, subject: "" });
              }}
            >
              <option value="">Select department</option>
              {departments.filter(d => d && d.name).map(d => (
                <option key={d.id ?? d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

      <div className="faculty-form-row">
        <div className="faculty-form-group flex-1">
          <label>Full Name</label>
          <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
        </div>
      </div>

      <div className="faculty-form-row">
        <div className="faculty-form-group flex-2">
          <label>Email address</label>
          <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
        </div>
        <div className="faculty-form-group flex-1">
          <label>Phone number</label>
          <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
        </div>
      </div>

      <div className="faculty-form-row">
        <div className="faculty-form-group flex-1">
          <label>Course</label>
          <select
            required
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
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

      <div className="faculty-form-row">
        <div className="faculty-form-group flex-1">
          <label>Academic Year</label>
          <select
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
        <div className="faculty-form-group flex-1">
          <label>Age</label>
          <input type="number" required value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Age" />
        </div>
      </div>

      <div className="faculty-form-row">
        <div className="faculty-form-group flex-1">
          <label>Gender</label>
          <select required value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
      </div>

      <div className="faculty-form-row">
        <div className="faculty-form-group flex-1">
          <label>About</label>
          <textarea required value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} placeholder="About this faculty member" className="min-height-60" />
        </div>
      </div>

      <div className="faculty-form-actions">
        <button type="submit" className="faculty-form-submit">{isEdit ? "Save Changes" : "Add Faculty"}</button>
        <button type="button" className="faculty-form-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  </div>
  );
});

export default function Faculty() {
  const navigate = useNavigate();

  // inject Inter font (copied from Student.js)
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
    name: "", subject: "", email: "", age: "", gender: "Male", avatar: "", about: "", phone: "", department: "", academic_year: ""
  };

  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [academicYearFilter, setAcademicYearFilter] = useState("All Academic Years");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Sorting state
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Checkbox selections for bulk operations
  const [selectedFaculty, setSelectedFaculty] = useState([]);

  // Function to fetch faculty
  const fetchFaculty = async () => {
    try {
      const res = await fetch('/api/faculties');
      if (res.ok) {
        const json = await res.json();
        // Filter out archived faculty (check for both true and 1)
        const activeFaculty = Array.isArray(json) ? json.filter(f => !f.archived && f.archived !== 1) : [];
        setFacultyList(activeFaculty);
      } else throw new Error("no api");
    } catch {
      try {
        const local = await localDB.readAll();
        const activeFaculty = Array.isArray(local) ? local.filter(f => !f.archived && f.archived !== 1) : [];
        setFacultyList(activeFaculty);
      } catch {
        setFacultyList([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) await fetchFaculty();
    })();
    
    // Refresh only when tab becomes visible (no polling to prevent rate limiting)
    const handleVisibilityChange = () => {
      if (!document.hidden && mounted) fetchFaculty();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => { 
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // fetch departments for dropdown
  useEffect(() => {
    let isFetching = false;
    
    const fetchDepartments = async () => {
      if (document.hidden || isFetching) return;
      isFetching = true;
      
      try {
        const res = await fetch('/api/departments');
        if (!res.ok) throw new Error('no api');
        const json = await res.json();
        // Filter out archived departments
        const activeDepts = Array.isArray(json) ? json.filter(d => !d.archived && d.archived !== 1 && d.status !== 'Archived') : [];
        setDepartments(activeDepts);
      } catch {
        setDepartments([]);
      } finally {
        isFetching = false;
      }
    };

    fetchDepartments();
    // Departments rarely change, no polling needed
    // Data will be refreshed when component remounts or tab becomes visible
    
    // Refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchDepartments();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // fetch academic years for dropdown
  useEffect(() => {
    let isFetching = false;
    
    const fetchAcademicYears = async () => {
      if (document.hidden || isFetching) return;
      isFetching = true;
      
      try {
        const res = await fetch('/api/academic-years');
        if (!res.ok) throw new Error('no api');
        const json = await res.json();
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
      } finally {
        isFetching = false;
      }
    };

    fetchAcademicYears();
    // Academic years rarely change, no polling needed
    // Data will be refreshed when component remounts or tab becomes visible
    
    // Refetch when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchAcademicYears();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // fetch courses for dropdown
  useEffect(() => {
    let isFetching = false;
    
    const fetchCourses = async () => {
      if (document.hidden || isFetching) return;
      isFetching = true;
      
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('no api');
        const json = await res.json();
        // Filter out archived courses
        const activeCourses = Array.isArray(json) ? json.filter(c => !c.archived && c.archived !== 1 && c.status !== 'archived') : [];
        setCourses(activeCourses);
      } catch {
        setCourses([]);
      } finally {
        isFetching = false;
      }
    };

    fetchCourses();
    // Courses rarely change, no polling needed
    // Data will be refreshed when component remounts or tab becomes visible
    
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
    const payload = { ...form, avatar: form.avatar || "https://randomuser.me/api/portraits/lego/1.jpg" };
    try {
      const res = await fetch('/api/faculties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const created = await res.json();
        setFacultyList(prev => [...prev, created]);
        logger.logCreate('Faculty', `Added faculty: ${payload.name}`);
      } else {
        const created = await localDB.create(payload);
        setFacultyList(prev => [...prev, created]);
      }
    } catch {
      const created = await localDB.create(payload);
      setFacultyList(prev => [...prev, created]);
    } finally {
      setShowAdd(false);
      setForm(defaultForm);
    }
  };

  const handleEdit = (item) => { 
    if (!item || !item.id) return;
    const idx = facultyList.findIndex(f => f && f.id === item.id);
    if (idx === -1) return;
    setEditIndex(idx); 
    setForm({ ...defaultForm, ...item }); 
    setShowEdit(true); 
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editIndex === null) return;
    const id = facultyList[editIndex]?.id;
    if (!id) return;
    const payload = { ...form };
    try {
      const res = await fetch(`/api/faculties/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        const updated = await res.json();
        setFacultyList(prev => prev.map(f => f.id === updated.id ? updated : f));
        logger.logUpdate('Faculty', `Updated faculty: ${payload.name}`);
      } else {
        const updated = await localDB.update(id, payload);
        setFacultyList(prev => prev.map(f => f.id === id ? updated : f));
      }
    } catch {
      const updated = await localDB.update(id, payload);
      setFacultyList(prev => prev.map(f => f.id === id ? updated : f));
    } finally {
      setShowEdit(false);
      setEditIndex(null);
      setForm(defaultForm);
    }
  };

  const handleArchive = async (item) => {
    if (!item || !item.id) return;
    if (!window.confirm("Are you sure you want to archive this faculty member?")) return;
    try {
      const res = await fetch(`/api/faculties/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true })
      });
      if (res.ok) {
        setFacultyList(prev => prev.map(f => f.id === item.id ? { ...f, archived: true } : f));
        logger.logArchive('Faculty', `Archived faculty: ${item.name}`);
      }
    } catch (err) {
      console.error('Failed to archive faculty:', err);
    }
    if (selectedUser && selectedUser.id === item.id) setSelectedUser(null);
  };

  // Bulk archive all selected
  const handleArchiveAll = async () => {
    if (selectedFaculty.length === 0) {
      alert('Please select faculty members to archive');
      return;
    }
    
    if (!window.confirm(`Archive ${selectedFaculty.length} selected faculty member(s)?`)) return;
    
    try {
      for (const id of selectedFaculty) {
        const res = await fetch(`/api/faculties/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: true })
        });
        if (res.ok) {
          const faculty = facultyList.find(f => f.id === id);
          logger.logArchive('Faculty', `Archived faculty: ${faculty?.name || 'Unknown'}`);
        }
      }
      // Refresh the list
      await fetchFaculty();
      setSelectedFaculty([]);
    } catch (error) {
      console.error('Error archiving faculty:', error);
    }
  };

  // Bulk restore all selected (for when viewing archived - though this component shows active)
  const handleRestoreAll = async () => {
    if (selectedFaculty.length === 0) {
      alert('Please select faculty members to restore');
      return;
    }
    
    if (!window.confirm(`Restore ${selectedFaculty.length} selected faculty member(s)?`)) return;
    
    try {
      for (const id of selectedFaculty) {
        const res = await fetch(`/api/faculties/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: false })
        });
        if (res.ok) {
          const faculty = facultyList.find(f => f.id === id);
          logger.logRestore('Faculty', `Restored faculty: ${faculty?.name || 'Unknown'}`);
        }
      }
      // Refresh the list
      await fetchFaculty();
      setSelectedFaculty([]);
    } catch (error) {
      console.error('Error restoring faculty:', error);
    }
  };

  // Toggle checkbox
  const handleCheckboxToggle = (id) => {
    setSelectedFaculty(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredList = facultyList.filter(f => {
    const matchesSearch = (f.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (f.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = departmentFilter === "All Departments" || f.department === departmentFilter;
    const matchesAcademicYear = academicYearFilter === "All Academic Years" || f.academic_year === academicYearFilter;
    return matchesSearch && matchesDepartment && matchesAcademicYear;
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
    setSelectedFaculty(prev => 
      prev.length === sortedList.length ? [] : sortedList.map(f => f.id)
    );
  };

  const handleFilter = () => setShowFilter(true);
  const handleUserClick = (user) => setSelectedUser(user);
  const handleBackToList = () => setSelectedUser(null);

  const fontStyle = { fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" };

  return (
    <div className="faculty-page-wrapper">
      <Navbar />
      <main className="faculty-main-container">
        {!selectedUser && (
          <div className="faculty-page-header">
            <h1>Faculty</h1>
            <p>Manage faculty information</p>
          </div>
        )}

        {!selectedUser && (
          <div className="faculty-toolbar">
            <div className="faculty-search-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search faculty..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="faculty-filter-select"
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
            >
              <option value="All Departments">All Departments</option>
              {departments.filter(d => d && d.name).map(d => (
                <option key={d.id ?? d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <select
              className="faculty-filter-select"
              value={academicYearFilter}
              onChange={e => setAcademicYearFilter(e.target.value)}
            >
              <option value="All Academic Years">All Academic Years</option>
              {academicYears.filter(ay => ay && ay.name).map(ay => (
                <option key={ay.id ?? ay.name} value={ay.name}>{ay.name}</option>
              ))}
            </select>
            {selectedFaculty.length > 0 && (
              <button 
                className="faculty-archive-btn"
                onClick={handleArchiveAll}
              >
                📦 Archive Selected ({selectedFaculty.length})
              </button>
            )}
            <button 
              className="faculty-add-btn-primary"
              onClick={handleAdd}
            >
              <span>+</span>
              Add Faculty
            </button>
          </div>
        )}

        <div className="faculty-header" style={{ display: selectedUser ? 'flex' : 'none' }}>
          <button className="faculty-back-btn" onClick={() => selectedUser ? handleBackToList() : navigate(-1)} aria-label="Go back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#183153" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="faculty-actions">
          </div>
        </div>

  {showAdd && <FacultyFullForm isEdit={false} onSubmit={handleAddSubmit} onCancel={() => setShowAdd(false)} form={form} setForm={setForm} departments={departments} courses={courses} academicYears={academicYears} />}
  {showEdit && <FacultyFullForm isEdit={true} onSubmit={handleEditSubmit} onCancel={() => setShowEdit(false)} form={form} setForm={setForm} departments={departments} courses={courses} academicYears={academicYears} />}

        {!showAdd && !showEdit && selectedUser ? (
          <div className="faculty-detail-wrapper">
            <div className="faculty-detail-left">
              <img src={selectedUser.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={selectedUser.name} className="faculty-detail-avatar-large" />
              <div className="faculty-detail-name">{selectedUser.name}</div>
              <div className="faculty-detail-department">{selectedUser.subject}</div>

              <div className="faculty-detail-actions">
                <button className="faculty-form-submit" onClick={() => handleEdit(selectedUser)}>
                  Edit
                </button>
                <button className="faculty-form-cancel" onClick={() => { handleArchive(selectedUser); handleBackToList(); }}>
                  Archive
                </button>
              </div>
            </div>

            <div className="faculty-detail-right">
              <div className="faculty-detail-section-title">About</div>
              <div className="faculty-detail-about">{selectedUser.about}</div>
              <div className="faculty-detail-stats">
                <div className="faculty-detail-stat-item">
                  <div className="stat-label">Age</div>
                  <div className="stat-value">{selectedUser.age}</div>
                </div>
                <div className="faculty-detail-stat-item">
                  <div className="stat-label">Gender</div>
                  <div className="stat-value">{selectedUser.gender}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="faculty-table-container faculty-table-wrapper">
            <table className="faculty-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={sortedList.length > 0 && selectedFaculty.length === sortedList.length}
                      onChange={handleSelectAllToggle}
                    />
                  </th>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('subject')}>
                    Course {sortField === 'subject' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('email')}>
                    Email address {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('department')}>
                    Department {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('academic_year')}>
                    Academic Year {sortField === 'academic_year' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('gender')}>
                    Gender {sortField === 'gender' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="actions-col"></th>
                </tr>
              </thead>
              <tbody>
                {(!loading && sortedList.length === 0) && <tr><td colSpan="8">No faculty found.</td></tr>}
                {(loading) && <tr><td colSpan="8">Loading…</td></tr>}
                {sortedList.map((f, idx) => (
                  <tr key={f.id ?? idx} className="clickable">
                    <td className="checkbox-cell" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedFaculty.includes(f.id)}
                        onChange={() => handleCheckboxToggle(f.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td onClick={() => handleUserClick(f)}>
                      <div className="faculty-avatar-name">
                        <img src={f.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={f.name} className="faculty-avatar" />
                        <span><HighlightText text={f.name} highlight={search} /></span>
                      </div>
                    </td>
                    <td onClick={() => handleUserClick(f)}><HighlightText text={f.subject} highlight={search} /></td>
                    <td onClick={() => handleUserClick(f)}><HighlightText text={f.email} highlight={search} /></td>
                    <td onClick={() => handleUserClick(f)}><HighlightText text={f.department} highlight={search} /></td>
                    <td onClick={() => handleUserClick(f)}>
                      {f.academic_year ? (
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          background: '#e0f2fe',
                          color: '#0369a1'
                        }}>
                          <HighlightText text={f.academic_year} highlight={search} />
                        </span>
                      ) : (
                        <span style={{ color: '#999', fontSize: '13px' }}>Not set</span>
                      )}
                    </td>
                    <td onClick={() => handleUserClick(f)}>{f.gender}</td>
                    <td className="actions-cell">
                      <button className="faculty-icon-btn" title="Edit" onClick={e => { e.stopPropagation(); handleEdit(f); }}>
                        <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
                      </button>
                      <button className="faculty-icon-btn" title="Archive" onClick={e => { e.stopPropagation(); handleArchive(f); }}>
                        <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h18v6H3V3z" /><path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" /><path d="M10 13h4" /></svg>
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
              <button className="faculty-filter-btn" onClick={() => setShowFilter(false)}>Close</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
// ...existing code...