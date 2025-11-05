import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

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
const StudentFullForm = memo(({ isEdit, onSubmit, onCancel, form, setForm, departments = [], courses = [] }) => {
  // Filter courses based on selected department
  const filteredCourses = form.department 
    ? courses.filter(c => c.department === form.department)
    : courses;

  return (
    <div className="student-form-overlay" role="dialog" aria-modal="true">
      <form className="student-full-form" onSubmit={onSubmit}>
        <div className="student-form-header-row">
          <h2 className="student-form-title">{isEdit ? "Edit Student" : "Add Student"}</h2>

          <div className="student-form-group" style={{ minWidth: 260 }}>
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
              {departments.map(d => (
                <option key={d.id ?? d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

      <div className="student-form-row">
        <div className="student-form-group" style={{ flex: 1 }}>
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
        <div className="student-form-group" style={{ flex: 2 }}>
          <label>Email address</label>
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

        <div className="student-form-group" style={{ flex: 1 }}>
          <label>Gender</label>
          <select
            name="gender"
            required
            value={form.gender}
            onChange={e => setForm({ ...form, gender: e.target.value })}
            aria-label="Gender"
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
      </div>

      <div className="student-form-row">
        <div className="student-form-group" style={{ flex: 1 }}>
          <label>Phone number</label>
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
          <label>Year Level</label>
          <input
            type="text"
            name="year"
            value={form.year}
            onChange={e => setForm({ ...form, year: e.target.value })}
            placeholder="Year Level"
          />
        </div>
      </div>

      <div className="student-form-row">
        <div className="student-form-group" style={{ flex: 1 }}>
          <label>Course</label>
          <select
            name="course"
            required
            value={form.course}
            onChange={e => setForm({ ...form, course: e.target.value })}
            aria-label="Course"
            disabled={!form.department}
          >
            <option value="">
              {form.department ? "Select course" : "Select department first"}
            </option>
            {filteredCourses.map(c => (
              <option key={c.id ?? c.name} value={c.name}>{c.name}</option>
            ))}
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
    name: "", course: "", email: "", age: "", gender: "Male", avatar: "", about: "", phone: "", department: "", year: ""
  };

  const [studentList, setStudentList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/students");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        if (mounted) setStudentList(Array.isArray(data) ? data : []);
      } catch {
        try {
          const local = await localDB.readAll();
          if (mounted) setStudentList(Array.isArray(local) ? local : []);
        } catch {
          if (mounted) setStudentList([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // fetch departments for dropdown
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/departments');
        if (!res.ok) throw new Error('no api');
        const json = await res.json();
        if (mounted) setDepartments(Array.isArray(json) ? json : []);
      } catch {
        if (mounted) setDepartments([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // fetch courses for dropdown
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('no api');
        const json = await res.json();
        if (mounted) setCourses(Array.isArray(json) ? json : []);
      } catch {
        if (mounted) setCourses([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAdd = () => { setForm(defaultForm); setShowAdd(true); };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, age: form.age === "" ? null : Number(form.age), avatar: form.avatar || "https://randomuser.me/api/portraits/men/34.jpg" };
    try {
      const res = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { const newStudent = await res.json(); setStudentList(prev => [...prev, newStudent]); }
      else { const created = await localDB.create({ ...payload }); setStudentList(prev => [...prev, created]); }
    } catch { const created = await localDB.create({ ...payload }); setStudentList(prev => [...prev, created]); }
    finally { setShowAdd(false); setForm(defaultForm); }
  };

  const handleEdit = (idx) => { setEditIndex(idx); setForm({ ...defaultForm, ...studentList[idx] }); setShowEdit(true); };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editIndex === null) return;
    const id = studentList[editIndex]?.id;
    if (!id) return;
    const payload = { ...form, age: form.age === "" ? null : Number(form.age) };
    try {
      const res = await fetch(`/api/students/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { const updated = await res.json(); setStudentList(prev => prev.map(s => s.id === updated.id ? updated : s)); }
      else { const updated = await localDB.update(id, payload); setStudentList(prev => prev.map(s => s.id === id ? updated : s)); }
    } catch { const updated = await localDB.update(id, payload); setStudentList(prev => prev.map(s => s.id === id ? updated : s)); }
    finally { setShowEdit(false); setEditIndex(null); setForm(defaultForm); }
  };

  const handleDelete = async (idx) => {
    const target = studentList[idx]; if (!target) return;
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/students/${target.id}`, { method: "DELETE" });
      if (res.ok) setStudentList(prev => prev.filter((_, i) => i !== idx));
      else { await localDB.delete(target.id); setStudentList(prev => prev.filter((_, i) => i !== idx)); }
    } catch { await localDB.delete(target.id); setStudentList(prev => prev.filter((_, i) => i !== idx)); }
    if (selectedUser && selectedUser.id === target.id) setSelectedUser(null);
  };

  const filteredList = studentList.filter(s => {
    const matchesSearch = (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
                         (s.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = departmentFilter === "All Departments" || s.department === departmentFilter;
    const matchesCourse = courseFilter === "All Courses" || s.course === courseFilter;
    return matchesSearch && matchesDepartment && matchesCourse;
  });

  const handleLogout = () => navigate("/login");
  const handleUserClick = (user) => setSelectedUser(user);
  const handleBackToList = () => setSelectedUser(null);

  const fontStyle = { fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", ...fontStyle }}>
      <Navbar />
      <main className="student-container" style={{ flex: 1, ...fontStyle }}>
        <div className="dashboard-header">
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>

        {!selectedUser && (
          <div style={{ padding: '24px 40px', borderBottom: '1px solid #e5e7eb' }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827' }}>Students</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280' }}>Manage student information</p>
          </div>
        )}

        {!selectedUser && (
          <div style={{ display: 'flex', gap: 16, padding: '20px 40px', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
              <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search students..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              style={{
                padding: '10px 32px 10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                color: '#374151',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")',
                backgroundPosition: 'right 8px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '20px'
              }}
            >
              <option value="All Courses">All Courses</option>
              {courses.map(c => (
                <option key={c.id ?? c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              style={{
                padding: '10px 32px 10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                color: '#374151',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")',
                backgroundPosition: 'right 8px center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '20px'
              }}
            >
              <option value="All Departments">All Departments</option>
              {departments.map(d => (
                <option key={d.id ?? d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <button 
              onClick={handleAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              Add Student
            </button>
          </div>
        )}

        <div className="student-header" style={{ display: selectedUser ? 'flex' : 'none' }}>
          <button className="student-back-btn" onClick={() => selectedUser ? handleBackToList() : navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 8l-4 4 4 4" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className="student-actions">
          </div>
        </div>

  {showAdd && <StudentFullForm isEdit={false} onSubmit={handleAddSubmit} onCancel={() => { setShowAdd(false); setForm(defaultForm); }} form={form} setForm={setForm} departments={departments} courses={courses} />}

  {showEdit && <StudentFullForm isEdit={true} onSubmit={handleEditSubmit} onCancel={() => { setShowEdit(false); setForm(defaultForm); setEditIndex(null); }} form={form} setForm={setForm} departments={departments} courses={courses} />}

        {!showAdd && !showEdit && selectedUser ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", marginTop: 40, gap: 60 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 320 }}>
              <img src={selectedUser.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={selectedUser.name} style={{ width: 220, height: 220, borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 24px #e6eaf1" }} />
              <div style={{ marginTop: 24, fontWeight: 700, fontSize: "1.3rem", textAlign: "center" }}>{selectedUser.name}</div>
              <div style={{ color: "#888", fontSize: "1rem", marginBottom: 24, textAlign: "center", letterSpacing: 1 }}>{(selectedUser.department || "").toUpperCase()}</div>

              <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                <button className="student-form-submit" onClick={() => { const idx = studentList.findIndex(s => s.id === selectedUser.id); if (idx !== -1) handleEdit(idx); }}>Edit</button>
                <button className="student-form-cancel" onClick={() => { const idx = studentList.findIndex(s => s.id === selectedUser.id); if (idx !== -1) handleDelete(idx); handleBackToList(); }}>Delete</button>
              </div>
            </div>

            <div style={{ minWidth: 320, maxWidth: 400 }}>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>About</div>
              <div style={{ color: "#555", marginBottom: 24, lineHeight: 1.6 }}>{selectedUser.about}</div>
              <div style={{ display: "flex", gap: 40 }}>
                <div>
                  <div style={{ color: "#888", fontSize: 13 }}>Year</div>
                  <div style={{ fontWeight: 600 }}>{selectedUser.year}</div>
                </div>
                <div>
                  <div style={{ color: "#888", fontSize: 13 }}>Gender</div>
                  <div style={{ fontWeight: 600 }}>{selectedUser.gender}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="student-table-container">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Department</th>
                  <th>Email address</th>
                  <th>Year Level</th>
                  <th>Gender</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(!loading && filteredList.length === 0) && <tr><td colSpan="7">No students found.</td></tr>}
                {(loading) && <tr><td colSpan="7">Loading…</td></tr>}
                {filteredList.map((s, idx) => (
                  <tr key={s.id ?? idx} style={{ cursor: "pointer" }}>
                    <td onClick={() => handleUserClick(s)}>
                      <div className="student-avatar-name">
                        <img src={s.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={s.name} className="student-avatar" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ color: "#888", fontSize: 13 }}>{s.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td onClick={() => handleUserClick(s)}>{s.course}</td>
                    <td onClick={() => handleUserClick(s)}>{s.department}</td>
                    <td onClick={() => handleUserClick(s)}>{s.email}</td>
                    <td onClick={() => handleUserClick(s)}>{s.year}</td>
                    <td onClick={() => handleUserClick(s)}>{s.gender}</td>
                    <td>
                      <button className="student-icon-btn" title="Edit" aria-label="Edit student" onClick={e => { e.stopPropagation(); handleEdit(idx); }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button className="student-icon-btn" title="Delete" aria-label="Delete student" onClick={e => { e.stopPropagation(); handleDelete(idx); }}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 6h18" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L6 6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11v6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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