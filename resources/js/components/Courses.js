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
          <span key={i} style={{ backgroundColor: '#fef08a', fontWeight: 600 }}>{part}</span> : 
          part
      )}
    </>
  );
};

const CourseFullForm = memo(({ isEdit, onSubmit, onCancel, form, setForm, departments = [] }) => (
    <div className="student-form-overlay">
        <form className="student-full-form" onSubmit={onSubmit}>
            <div className="student-form-header-row">
                <h2 className="student-form-title">{isEdit ? "Edit Course" : "Add Course"}</h2>
                <div className="student-form-group" style={{ minWidth: 260 }}>
                    <label className="sr-only">Department</label>
                    <select
                        required
                        className="student-form-designation"
                        value={form.department}
                        onChange={e => setForm({ ...form, department: e.target.value })}
                    >
                        <option value="">Select department</option>
                        {departments.filter(d => d && d.name).map(d => (
                            <option key={d.id ?? d.name} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="student-form-section-label"></div>

            <div className="student-form-row">
                <div className="student-form-group" style={{ flex: 1 }}>
                    <label>Course Name</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Course Name"
                    />
                </div>
            </div>

            <div className="student-form-row">
                <div className="student-form-group" style={{ flex: 1 }}>
                    <label>Level</label>
                    <select
                        required
                        value={form.gender}
                        onChange={e => setForm({ ...form, gender: e.target.value })}
                    >
                        <option value="">Select</option>
                        <option>Undergraduate</option>
                        <option>Postgraduate</option>
                    </select>
                </div>
                <div className="student-form-group" style={{ flex: 1 }}>
                    <label>Credits</label>
                    <input
                        type="number"
                        required
                        value={form.age}
                        onChange={e => setForm({ ...form, age: e.target.value })}
                        placeholder="Credits"
                    />
                </div>
            </div>

            <div className="student-form-row">
                <div className="student-form-group" style={{ flex: 1 }}>
                    <label>About</label>
                    <textarea
                        required
                        value={form.about}
                        onChange={e => setForm({ ...form, about: e.target.value })}
                        placeholder="About this course"
                        style={{ minHeight: 60 }}
                    />
                </div>
            </div>

            <div className="student-form-actions">
                <button type="submit" className="student-form-submit">
                    {isEdit ? "Save Changes" : "Add Course"}
                </button>
                <button type="button" className="student-form-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    </div>
));

export default function Courses() {
    const navigate = useNavigate();

    const defaultForm = {
        name: "",
        department: "",
        age: "",
        gender: "Undergraduate",
        about: ""
    };

    const [courseList, setCourseList] = useState([]);
    const [departments, setDepartments] = useState([]);
    
    // Filter to show only active (non-archived) courses
    const activeCourseList = courseList.filter(c => c.status !== 'archived' && c.archived !== true);
    
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [search, setSearch] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    
    // Sorting state
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    
    // Checkbox selections for bulk operations
    const [selectedCourses, setSelectedCourses] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch("/api/courses");
                if (!res.ok) throw new Error("API error");
                const data = await res.json();
                if (mounted) setCourseList(Array.isArray(data) ? data : []);
            } catch {
                if (mounted) setCourseList([]);
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

    const handleAdd = () => {
        setForm(defaultForm);
        setShowAdd(true);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            age: form.age === "" ? null : Number(form.age)
        };
        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const newCourse = await res.json();
                setCourseList(prev => [...prev, newCourse]);
                logger.logCreate('Course', `Added course: ${payload.name}`);
            } else {
                setCourseList(prev => [...prev, { ...payload, id: Date.now() }]);
            }
        } catch {
            setCourseList(prev => [...prev, { ...payload, id: Date.now() }]);
        } finally {
            setShowAdd(false);
            setForm(defaultForm);
        }
    };

    const handleEdit = (idx) => {
        setEditIndex(idx);
        const course = activeCourseList[idx];
        setForm({ ...defaultForm, ...course });
        setShowEdit(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editIndex === null) return;
        const course = activeCourseList[editIndex];
        if (!course) return;
        const id = course.id;
        const payload = { ...form, age: form.age === "" ? null : Number(form.age) };
        try {
            const res = await fetch(`/api/courses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const updated = await res.json();
                setCourseList(prev => prev.map(s => s.id === updated.id ? updated : s));
                logger.logUpdate('Course', `Updated course: ${payload.name}`);
            } else {
                setCourseList(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c));
            }
        } catch {
            setCourseList(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c));
        } finally {
            setShowEdit(false);
            setEditIndex(null);
            setForm(defaultForm);
        }
    };

    const handleDelete = async (idx) => {
        const target = activeCourseList[idx];
        if (!target) return;
        if (!window.confirm("Archive this course? All students and faculty teaching this course will also be archived.")) return;
        try {
            const res = await fetch(`/api/courses/${target.id}`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'archived', archived: true })
            });
            if (res.ok) {
                const updated = await res.json();
                setCourseList(prev => prev.map(c => c.id === target.id ? updated : c));
                logger.logArchive('Course', `Archived course: ${target.name}`);
                
                // Archive all students enrolled in this course
                const studentsRes = await fetch('/api/students');
                if (studentsRes.ok) {
                    const allStudents = await studentsRes.json();
                    const studentsToArchive = allStudents.filter(s => s.course === target.name);
                    
                    for (const student of studentsToArchive) {
                        await fetch(`/api/students/${student.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ archived: true })
                        });
                        logger.logArchive('Student', `Auto-archived student: ${student.name} (course archived)`);
                    }
                }
                
                // Archive all faculty teaching this course
                const facultiesRes = await fetch('/api/faculties');
                if (facultiesRes.ok) {
                    const allFaculties = await facultiesRes.json();
                    const facultiesToArchive = allFaculties.filter(f => f.subject === target.name);
                    
                    for (const faculty of facultiesToArchive) {
                        await fetch(`/api/faculties/${faculty.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ archived: true })
                        });
                        logger.logArchive('Faculty', `Auto-archived faculty: ${faculty.name} (course archived)`);
                    }
                }
            } else {
                setCourseList(prev => prev.map(c => c.id === target.id ? { ...c, status: 'archived', archived: true } : c));
            }
        } catch {
            setCourseList(prev => prev.map(c => c.id === target.id ? { ...c, status: 'archived', archived: true } : c));
        }
    };

    const handleFilter = () => setShowFilter(true);

    const filteredList = activeCourseList.filter(s =>
        (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(search.toLowerCase())
    );

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

    const handleLogout = () => navigate("/login");

    const handleCourseClick = (course) => setSelectedCourse(course);
    const handleBackToList = () => setSelectedCourse(null);

    // Bulk archive all selected
    const handleArchiveAll = async () => {
        if (selectedCourses.length === 0) {
            alert('Please select courses to archive');
            return;
        }
        
        if (!window.confirm(`Archive ${selectedCourses.length} selected course(s)?`)) return;
        
        try {
            for (const id of selectedCourses) {
                const res = await fetch(`/api/courses/${id}`, { 
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'archived', archived: true })
                });
                if (res.ok) {
                    const course = courseList.find(c => c.id === id);
                    logger.logArchive('Course', `Archived course: ${course?.name || 'Unknown'}`);
                }
            }
            // Refresh the list
            const res = await fetch("/api/courses");
            if (res.ok) {
                const data = await res.json();
                setCourseList(Array.isArray(data) ? data : []);
            }
            setSelectedCourses([]);
        } catch (error) {
            console.error('Error archiving courses:', error);
        }
    };

    // Toggle checkbox
    const handleCheckboxToggle = (id) => {
        setSelectedCourses(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Select all toggle
    const handleSelectAllToggle = () => {
        setSelectedCourses(prev => 
            prev.length === sortedList.length ? [] : sortedList.map(c => c.id)
        );
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <main className="student-container" style={{ flex: 1 }}>
                <div className="dashboard-header">
                    <button className="logout-btn" onClick={handleLogout}>Log out</button>
                </div>

                {!selectedCourse && (
                    <div style={{ padding: '24px 40px', borderBottom: '1px solid #e5e7eb' }}>
                        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, marginBottom: 4 }}>Courses</h1>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage course information</p>
                    </div>
                )}

                {!selectedCourse && (
                    <div style={{ display: 'flex', gap: 16, padding: '20px 40px', borderBottom: '1px solid #e5e7eb' }}>
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
                                placeholder="Search courses..."
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
                        {selectedCourses.length > 0 && (
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
                                📦 Archive Selected ({selectedCourses.length})
                            </button>
                        )}
                        <button
                            onClick={handleAdd}
                            style={{
                                padding: '10px 20px',
                                background: '#111827',
                                color: 'white',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
                            Add Course
                        </button>
                    </div>
                )}

                {selectedCourse && (
                    <div className="student-header">
                        <button className="student-back-btn" onClick={handleBackToList}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="12" fill="#222" opacity="0.12"/>
                                <path d="M14 8l-4 4 4 4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                )}

                {showAdd && (
                    <CourseFullForm
                        isEdit={false}
                        onSubmit={handleAddSubmit}
                        onCancel={() => { setShowAdd(false); setForm(defaultForm); }}
                        form={form}
                        setForm={setForm}
                        departments={departments}
                    />
                )}

                {showEdit && (
                    <CourseFullForm
                        isEdit={true}
                        onSubmit={handleEditSubmit}
                        onCancel={() => { setShowEdit(false); setForm(defaultForm); setEditIndex(null); }}
                        form={form}
                        setForm={setForm}
                        departments={departments}
                    />
                )}

                {!showAdd && !showEdit && selectedCourse ? (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        marginTop: "40px",
                        gap: "60px"
                    }}>
                        <div style={{ minWidth: 320, maxWidth: 600 }}>
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 8 }}>
                                    {selectedCourse.name}
                                </div>
                                <div style={{ color: "#888", fontSize: "1rem" }}>
                                    {selectedCourse.department}
                                </div>
                            </div>

                            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>About</div>
                            <div style={{ color: "#555", marginBottom: 24, lineHeight: 1.6 }}>{selectedCourse.about}</div>
                            
                            <div style={{ display: "flex", gap: 40, marginBottom: 24 }}>
                                <div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Credits</div>
                                    <div style={{ fontWeight: 600 }}>{selectedCourse.age}</div>
                                </div>
                                <div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Level</div>
                                    <div style={{ fontWeight: 600 }}>{selectedCourse.gender}</div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    className="student-icon-btn"
                                    title="Edit"
                                    aria-label="Edit course"
                                    onClick={() => {
                                        const idx = activeCourseList.findIndex(s => s.id === selectedCourse.id);
                                        if (idx !== -1) handleEdit(idx);
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <button
                                    className="student-icon-btn"
                                    title="Archive"
                                    aria-label="Archive course"
                                    onClick={() => {
                                        const idx = activeCourseList.findIndex(s => s.id === selectedCourse.id);
                                        if (idx !== -1) handleDelete(idx);
                                        handleBackToList();
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M3 3h18v4H3z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M9 11h6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="student-table-container">
                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 40, textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={sortedList.length > 0 && selectedCourses.length === sortedList.length}
                                            onChange={handleSelectAllToggle}
                                            style={{ cursor: 'pointer', width: 16, height: 16 }}
                                        />
                                    </th>
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Course Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('department')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Department {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('gender')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Level {sortField === 'gender' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('age')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                                        Credits {sortField === 'age' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedList.length === 0 && (
                                    <tr><td colSpan="6">No courses found.</td></tr>
                                )}
                                {sortedList.map((s, idx) => (
                                    <tr key={s.id ?? idx} style={{ cursor: "pointer" }}>
                                        <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCourses.includes(s.id)}
                                                onChange={() => handleCheckboxToggle(s.id)}
                                                style={{ cursor: 'pointer', width: 16, height: 16 }}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </td>
                                        <td onClick={() => handleCourseClick(s)}>
                                            <HighlightText text={s.name} highlight={search} />
                                        </td>
                                        <td onClick={() => handleCourseClick(s)}>
                                            <HighlightText text={s.department} highlight={search} />
                                        </td>
                                        <td onClick={() => handleCourseClick(s)}>{s.gender}</td>
                                        <td onClick={() => handleCourseClick(s)}>{s.age}</td>
                                        <td>
                                            <button
                                                className="student-icon-btn"
                                                title="Edit"
                                                aria-label="Edit course"
                                                onClick={e => { e.stopPropagation(); handleEdit(idx); }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                            <button
                                                className="student-icon-btn"
                                                title="Archive"
                                                aria-label="Archive course"
                                                onClick={e => { e.stopPropagation(); handleDelete(idx); }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path d="M3 3h18v4H3z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M9 11h6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
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