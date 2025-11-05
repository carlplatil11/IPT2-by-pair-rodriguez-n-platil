import React, { useState, memo, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const DepartmentFullForm = memo(({ isEdit, onSubmit, onCancel, form, setForm }) => (
    <div className="department-form-overlay">
        <form className="department-full-form" onSubmit={onSubmit}>
            <div className="department-form-header-row">
                <h2 className="department-form-title">{isEdit ? "Edit Department" : "Add Department"}</h2>
                <div className="department-form-group" style={{ minWidth: 260 }}>
                    <input
                        type="text"
                        required
                        className="department-form-name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Department Name"
                    />
                </div>
            </div>

            <div className="department-form-row">
                <div className="department-form-group" style={{ flex: 1 }}>
                    <label>Head of Department</label>
                    <input
                        type="text"
                        value={form.head}
                        onChange={e => setForm({ ...form, head: e.target.value })}
                        placeholder="Complete Name"
                    />
                </div>
                <div className="department-form-group" style={{ flex: 1 }}>
                    <label>Contact Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="Contact email"
                    />
                </div>
                <div className="department-form-group" style={{ width: 160 }}>
                    <label>Status</label>
                    <select
                        value={form.status}
                        onChange={e => setForm({ ...form, status: e.target.value })}
                        className="department-form-status"
                    >
                        <option value="Active">Active</option>
                        <option value="Deactivated">Deactivate</option>
                    </select>
                </div>
            </div>

            <div className="department-form-row">
                <div className="department-form-group" style={{ flex: 1 }}>
                    <label>Description</label>
                    <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder="Short description of the department"
                        style={{ minHeight: 60 }}
                    />
                </div>
            </div>

            <div className="department-form-actions">
                <button type="submit" className="department-form-submit">
                    {isEdit ? "Save Changes" : "Add Department"}
                </button>
                <button type="button" className="department-form-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    </div>
));

export default function Department() {
    const navigate = useNavigate();

    const defaultForm = {
        name: "",
        head: "",
        email: "",
        description: "",
        status: "Active" // default status
    };

    const [departments, setDepartments] = useState([]);
    const [students, setStudents] = useState([]);
    const [faculties, setFaculties] = useState([]);
    
    // Filter to show only active (non-archived) departments
    const activeDepartments = departments.filter(d => d.status !== 'Archived' && d.archived !== true);
    
    useEffect(() => {
        fetch('/api/departments')
            .then(res => res.json())
            .then(data => setDepartments(Array.isArray(data) ? data : []))
            .catch(() => setDepartments([]));
    }, []);

    // fetch students to compute per-department counts
    useEffect(() => {
        fetch('/api/students')
            .then(res => res.json())
            .then(data => setStudents(Array.isArray(data) ? data : []))
            .catch(() => setStudents([]));
    }, []);

    // fetch faculties to compute per-department faculty counts
    useEffect(() => {
        fetch('/api/faculties')
            .then(res => res.json())
            .then(data => setFaculties(Array.isArray(data) ? data : []))
            .catch(() => setFaculties([]));
    }, []);

    const studentsCount = useMemo(() => {
        const map = Object.create(null);
        for (const s of students) {
            const name = (s.department || "").toString();
            if (!name) continue;
            map[name] = (map[name] || 0) + 1;
        }
        return map;
    }, [students]);

    const facultiesCount = useMemo(() => {
        const map = Object.create(null);
        for (const f of faculties) {
            const name = (f.department || "").toString();
            if (!name) continue;
            map[name] = (map[name] || 0) + 1;
        }
        return map;
    }, [faculties]);

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [search, setSearch] = useState("");
    const [selectedDept, setSelectedDept] = useState(null);

    const handleAdd = () => {
        setForm(defaultForm);
        setShowAdd(true);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            const res = await fetch('/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const newDept = await res.json();
                setDepartments(prev => [...prev, newDept]);
                setShowAdd(false);
            } else {
                setDepartments(prev => [...prev, { ...payload, id: Date.now() }]);
                setShowAdd(false);
            }
        } catch {
            setDepartments(prev => [...prev, { ...form, id: Date.now() }]);
            setShowAdd(false);
        }
    };

    const handleEdit = (idx) => {
        setEditIndex(idx);
        const dept = activeDepartments[idx];
        setForm({ ...defaultForm, ...dept });
        setShowEdit(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editIndex === null) return;
        const dept = activeDepartments[editIndex];
        if (!dept) return;
        try {
            const id = dept.id;
            const payload = { ...form };
            const res = await fetch(`/api/departments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const updated = await res.json();
                setDepartments(prev => prev.map(d => d.id === id ? updated : d));
                setShowEdit(false);
            } else {
                setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...payload } : d));
                setShowEdit(false);
            }
        } catch {
            const id = dept.id;
            setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...form } : d));
            setShowEdit(false);
        } finally {
            setEditIndex(null);
            setForm(defaultForm);
        }
    };

    const handleDelete = async (idx) => {
        if (!window.confirm('Archive this department? All courses in this department will also be archived.')) return;
        const dept = activeDepartments[idx];
        if (!dept) return;
        const id = dept.id;
        const deptName = dept.name;
        
        try {
            // First, archive the department
            const res = await fetch(`/api/departments/${id}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Archived', archived: true })
            });
            if (res.ok) {
                const updated = await res.json();
                setDepartments(prev => prev.map(d => d.id === id ? updated : d));
            }
            
            // Then, fetch and archive all courses in this department
            const coursesRes = await fetch('/api/courses');
            if (coursesRes.ok) {
                const allCourses = await coursesRes.json();
                const coursesToArchive = allCourses.filter(c => 
                    c.department === deptName && 
                    c.status !== 'archived' && 
                    c.archived !== true
                );
                
                // Archive each course
                for (const course of coursesToArchive) {
                    await fetch(`/api/courses/${course.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'archived', archived: true })
                    });
                }
            }
        } catch {
            setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: 'Archived', archived: true } : d));
        }
        // if archiving currently selected, clear view
        if (selectedDept && selectedDept.id === id) setSelectedDept(null);
    };

    const handleUserClick = (dept) => {
        setSelectedDept(dept);
    };

    const handleBackToList = () => {
        setSelectedDept(null);
    };

    const filtered = activeDepartments.filter(d =>
        (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.head || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <main className="department-container" style={{ flex: 1 }}>
                <div className="dashboard-header">
                    <button className="logout-btn" onClick={() => navigate('/login')}>Log out</button>
                </div>

                {!selectedDept && (
                    <div style={{ padding: '24px 40px', borderBottom: '1px solid #e5e7eb' }}>
                        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#111827' }}>Departments</h1>
                        <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280' }}>Manage department information</p>
                    </div>
                )}

                {!selectedDept && (
                    <div style={{ display: 'flex', gap: 16, padding: '20px 40px', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
                            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20 }} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="text" 
                                placeholder="Search departments..." 
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
                            Add Department
                        </button>
                    </div>
                )}

                <div className="department-header" style={{ display: selectedDept ? 'flex' : 'none' }}>
                    <button className="department-back-btn" onClick={() => selectedDept ? handleBackToList() : navigate(-1)}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="12" fill="#222" opacity="0.12"/>
                            <path d="M14 8l-4 4 4 4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="department-actions">
                    </div>
                </div>

                {showAdd && (
                    <DepartmentFullForm
                        isEdit={false}
                        onSubmit={handleAddSubmit}
                        onCancel={() => setShowAdd(false)}
                        form={form}
                        setForm={setForm}
                    />
                )}

                {showEdit && (
                    <DepartmentFullForm
                        isEdit={true}
                        onSubmit={handleEditSubmit}
                        onCancel={() => setShowEdit(false)}
                        form={form}
                        setForm={setForm}
                    />
                )}

                {/* If a department is selected show detail panel like Faculty.js */}
                {!showAdd && !showEdit && selectedDept ? (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        marginTop: "40px",
                        gap: "60px"
                    }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 320 }}>
                            <div style={{
                                width: 220,
                                height: 220,
                                borderRadius: "10px",
                                background: "#f3f6f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 24px #e6eaf1"
                            }}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="#94a3b8" strokeWidth="1.5"/>
                                    <path d="M4 20v-1c0-2.8 3.6-4 8-4s8 1.2 8 4v1" stroke="#94a3b8" strokeWidth="1.5"/>
                                </svg>
                            </div>

                            <div style={{ marginTop: 24, fontWeight: 700, fontSize: "1.3rem", textAlign: "center" }}>
                                {selectedDept.name}
                            </div>
                            <div style={{ color: "#888", fontSize: "1rem", marginBottom: 24, textAlign: "center" }}>
                                {selectedDept.head}
                            </div>

                            <div style={{ display: "flex", gap: 16 }}>
                                <button
                                    className="department-icon-btn"
                                    title="Edit"
                                    onClick={() => {
                                        const idx = activeDepartments.findIndex(d => d.id === selectedDept.id);
                                        if (idx !== -1) handleEdit(idx);
                                    }}
                                >
                                    <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                                    </svg>
                                </button>

                                <button
                                    className="department-icon-btn"
                                    title="Archive"
                                    onClick={() => {
                                        const idx = activeDepartments.findIndex(d => d.id === selectedDept.id);
                                        if (idx !== -1) handleDelete(idx);
                                        handleBackToList();
                                    }}
                                >
                                    <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M3 3h18v4H3z" />
                                        <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                                        <path d="M9 11h6" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div style={{ minWidth: 320, maxWidth: 600 }}>
                            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>Description</div>
                            <div style={{ color: "#555", marginBottom: 24, lineHeight: 1.6 }}>
                                {selectedDept.description}
                            </div>

                            <div style={{ display: "flex", gap: 40 }}>
                                <div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Contact</div>
                                    <div style={{ fontWeight: 600 }}>{selectedDept.email}</div>
                                </div>
                                <div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Faculties</div>
                                    <div style={{ fontWeight: 600 }}>{facultiesCount[selectedDept.name] ?? 0}</div>
                                </div>
                                <div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Students</div>
                                    <div style={{ fontWeight: 600 }}>{studentsCount[selectedDept.name] ?? 0}</div>
                                </div>
                                <div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Status</div>
                                    <div style={{ fontWeight: 600 }}>{selectedDept.status}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="department-table-container">
                        <table className="department-table">
                            <thead>
                                <tr>
                                    <th>Department Name</th>
                                    <th>Dean</th>
                                    <th>Contact</th>
                                    <th>No. of Faculties</th>
                                        <th>No. of Students</th>
                                    <th>Status</th>
                                    <th style={{ width: 84, textAlign: "center" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan="6">No programs found.</td></tr>
                                )}
                                {filtered.map((d, idx) => (
                                    <tr key={d.id ?? idx} style={{ cursor: 'pointer' }}>
                                        <td onClick={() => handleUserClick(d)}>{d.name}</td>
                                        <td onClick={() => handleUserClick(d)}>{d.head}</td>
                                        <td onClick={() => handleUserClick(d)}>{d.email}</td>
                                        <td onClick={() => handleUserClick(d)}>{facultiesCount[d.name] ?? d.faculties ?? 0}</td>
                                        <td onClick={() => handleUserClick(d)}>{studentsCount[d.name] ?? d.students ?? ""}</td>
                                        <td onClick={() => handleUserClick(d)}>{d.status ?? "Active"}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <div className="actions-cell">
                                                <button className="department-icon-btn" title="Edit" onClick={e => { e.stopPropagation(); handleEdit(idx); }}>
                                                    <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M12 20h9" />
                                                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                                                    </svg>
                                                </button>
                                                <button className="department-icon-btn" title="Archive" onClick={e => { e.stopPropagation(); handleDelete(idx); }}>
                                                    <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M3 3h18v4H3z" />
                                                        <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                                                        <path d="M9 11h6" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
