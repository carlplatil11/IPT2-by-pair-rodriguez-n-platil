import React, { useState, memo, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import logger from "../utils/logger";

const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return <>{text}</>;
    const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = String(text).split(regex);
    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? <span key={i} style={{ backgroundColor: '#fef08a', fontWeight: 600 }}>{part}</span> : part
            )}
        </>
    );
};

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
            // Skip archived students
            if (s.archived) continue;
            const name = (s.department || "").toString();
            if (!name) continue;
            map[name] = (map[name] || 0) + 1;
        }
        return map;
    }, [students]);

    const facultiesCount = useMemo(() => {
        const map = Object.create(null);
        for (const f of faculties) {
            // Skip archived faculties
            if (f.archived) continue;
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
    
    // Sorting state
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    
    // Checkbox selections for bulk operations
    const [selectedDepartments, setSelectedDepartments] = useState([]);

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
                logger.logCreate('Department', `Added department: ${payload.name}`);
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
                logger.logUpdate('Department', `Updated department: ${payload.name}`);
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
        if (!window.confirm('Archive this department? All courses, students, and faculty in this department will also be archived.')) return;
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
                logger.logArchive('Department', `Archived department: ${deptName}`);
            } else {
                // Fallback if API fails
                setDepartments(prev => prev.map(d => d.id === id ? { ...d, status: 'Archived', archived: true } : d));
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
                    logger.logArchive('Course', `Auto-archived course: ${course.name} (department archived)`);
                }
            }
            
            // Archive all students in this department
            const studentsRes = await fetch('/api/students');
            if (studentsRes.ok) {
                const allStudents = await studentsRes.json();
                const studentsToArchive = allStudents.filter(s => 
                    s.department === deptName && 
                    !s.archived && 
                    s.archived !== 1
                );
                
                for (const student of studentsToArchive) {
                    await fetch(`/api/students/${student.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ archived: true })
                    });
                    logger.logArchive('Student', `Auto-archived student: ${student.name} (department archived)`);
                }
                // Refresh students list
                const updatedStudents = await fetch('/api/students');
                if (updatedStudents.ok) {
                    const data = await updatedStudents.json();
                    setStudents(Array.isArray(data) ? data : []);
                }
            }
            
            // Archive all faculty in this department
            const facultiesRes = await fetch('/api/faculties');
            if (facultiesRes.ok) {
                const allFaculties = await facultiesRes.json();
                const facultiesToArchive = allFaculties.filter(f => 
                    f.department === deptName && 
                    !f.archived && 
                    f.archived !== 1
                );
                
                for (const faculty of facultiesToArchive) {
                    await fetch(`/api/faculties/${faculty.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ archived: true })
                    });
                    logger.logArchive('Faculty', `Auto-archived faculty: ${faculty.name} (department archived)`);
                }
                // Refresh faculties list
                const updatedFaculties = await fetch('/api/faculties');
                if (updatedFaculties.ok) {
                    const data = await updatedFaculties.json();
                    setFaculties(Array.isArray(data) ? data : []);
                }
            }
        } catch (error) {
            console.error('Error archiving department and related items:', error);
            // Fallback if API fails
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

    // Handle column sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filtered = activeDepartments.filter(d =>
        (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.head || "").toLowerCase().includes(search.toLowerCase())
    );

    // Apply sorting
    const sortedFiltered = [...filtered].sort((a, b) => {
        if (!sortField) return 0;
        
        let aVal = a[sortField] || '';
        let bVal = b[sortField] || '';
        
        // Special handling for counts
        if (sortField === 'faculties') {
            aVal = facultiesCount[a.name] ?? a.faculties ?? 0;
            bVal = facultiesCount[b.name] ?? b.faculties ?? 0;
        } else if (sortField === 'students') {
            aVal = studentsCount[a.name] ?? a.students ?? 0;
            bVal = studentsCount[b.name] ?? b.students ?? 0;
        }
        
        // Convert to string for comparison
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // Bulk archive all selected
    const handleArchiveAll = async () => {
        if (selectedDepartments.length === 0) {
            alert('Please select departments to archive');
            return;
        }
        
        if (!window.confirm(`Archive ${selectedDepartments.length} selected department(s)? All related courses, students, and faculty will also be archived.`)) return;
        
        try {
            for (const id of selectedDepartments) {
                const dept = activeDepartments.find(d => d.id === id);
                if (dept) {
                    const deptName = dept.name;
                    
                    // Archive the department
                    const res = await fetch(`/api/departments/${id}`, { 
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Archived', archived: true })
                    });
                    if (res.ok) {
                        logger.logArchive('Department', `Archived department: ${deptName}`);
                    }
                    
                    // Archive all courses in this department
                    const coursesRes = await fetch('/api/courses');
                    if (coursesRes.ok) {
                        const allCourses = await coursesRes.json();
                        const coursesToArchive = allCourses.filter(c => 
                            c.department === deptName && 
                            c.status !== 'archived' && 
                            c.archived !== true
                        );
                        
                        for (const course of coursesToArchive) {
                            await fetch(`/api/courses/${course.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'archived', archived: true })
                            });
                            logger.logArchive('Course', `Auto-archived course: ${course.name} (department archived)`);
                        }
                    }
                    
                    // Archive all students in this department
                    const studentsRes = await fetch('/api/students');
                    if (studentsRes.ok) {
                        const allStudents = await studentsRes.json();
                        const studentsToArchive = allStudents.filter(s => 
                            s.department === deptName && 
                            !s.archived && 
                            s.archived !== 1
                        );
                        
                        for (const student of studentsToArchive) {
                            await fetch(`/api/students/${student.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ archived: true })
                            });
                            logger.logArchive('Student', `Auto-archived student: ${student.name} (department archived)`);
                        }
                    }
                    
                    // Archive all faculty in this department
                    const facultiesRes = await fetch('/api/faculties');
                    if (facultiesRes.ok) {
                        const allFaculties = await facultiesRes.json();
                        const facultiesToArchive = allFaculties.filter(f => 
                            f.department === deptName && 
                            !f.archived && 
                            f.archived !== 1
                        );
                        
                        for (const faculty of facultiesToArchive) {
                            await fetch(`/api/faculties/${faculty.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ archived: true })
                            });
                            logger.logArchive('Faculty', `Auto-archived faculty: ${faculty.name} (department archived)`);
                        }
                    }
                }
            }
            
            // Refresh all lists
            const deptRes = await fetch('/api/departments');
            if (deptRes.ok) {
                const data = await deptRes.json();
                setDepartments(Array.isArray(data) ? data : []);
            }
            
            const studRes = await fetch('/api/students');
            if (studRes.ok) {
                const data = await studRes.json();
                setStudents(Array.isArray(data) ? data : []);
            }
            
            const facRes = await fetch('/api/faculties');
            if (facRes.ok) {
                const data = await facRes.json();
                setFaculties(Array.isArray(data) ? data : []);
            }
            
            setSelectedDepartments([]);
        } catch (error) {
            console.error('Error archiving departments:', error);
        }
    };

    // Toggle checkbox
    const handleCheckboxToggle = (id) => {
        setSelectedDepartments(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Select all toggle
    const handleSelectAllToggle = () => {
        setSelectedDepartments(prev => 
            prev.length === sortedFiltered.length ? [] : sortedFiltered.map(d => d.id)
        );
    };

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
                        {selectedDepartments.length > 0 && (
                            <button 
                                onClick={handleArchiveAll}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '10px 16px',
                                    background: '#fef3c7',
                                    color: '#ca8a04',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                📦 Archive Selected ({selectedDepartments.length})
                            </button>
                        )}
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
                                    <th style={{ width: 40, textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={sortedFiltered.length > 0 && selectedDepartments.length === sortedFiltered.length}
                                            onChange={handleSelectAllToggle}
                                            style={{ cursor: 'pointer', width: 16, height: 16 }}
                                        />
                                    </th>
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Department Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('head')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Dean {sortField === 'head' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('email')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Contact {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('faculties')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        No. of Faculties {sortField === 'faculties' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('students')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        No. of Students {sortField === 'students' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th style={{ width: 84, textAlign: "center" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedFiltered.length === 0 && (
                                    <tr><td colSpan="8">No programs found.</td></tr>
                                )}
                                {sortedFiltered.map((d, idx) => (
                                    <tr key={d.id ?? idx} style={{ cursor: 'pointer' }}>
                                        <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedDepartments.includes(d.id)}
                                                onChange={() => handleCheckboxToggle(d.id)}
                                                style={{ cursor: 'pointer', width: 16, height: 16 }}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </td>
                                        <td onClick={() => handleUserClick(d)}>
                                            <HighlightText text={d.name} highlight={search} />
                                        </td>
                                        <td onClick={() => handleUserClick(d)}>
                                            <HighlightText text={d.head} highlight={search} />
                                        </td>
                                        <td onClick={() => handleUserClick(d)}>
                                            <HighlightText text={d.email} highlight={search} />
                                        </td>
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
