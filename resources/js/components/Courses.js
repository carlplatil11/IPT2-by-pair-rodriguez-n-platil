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

const CourseFullForm = memo(({ isEdit, onSubmit, onCancel, form, setForm, departments = [] }) => (
    <div className="student-form-overlay">
        <form className="student-full-form" onSubmit={onSubmit}>
            <div className="student-form-header-row">
                <h2 className="student-form-title">{isEdit ? "Edit Course" : "Add Course"}</h2>
                <div className="student-form-group min-width-260">
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
                <div className="student-form-group flex-1">
                    <label>Course Code</label>
                    <input
                        type="text"
                        required
                        value={form.code}
                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., BSCS, BSIT, MSCS"
                        className="text-uppercase"
                    />
                </div>
                <div className="student-form-group flex-1">
                    <label>Course Name</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Full course name"
                    />
                </div>
            </div>

            <div className="student-form-row">
                <div className="student-form-group flex-1">
                    <label>Program Level</label>
                    <select
                        required
                        value={form.gender}
                        onChange={e => setForm({ ...form, gender: e.target.value })}
                    >
                        <option value="">Select Level</option>
                        <option>Undergraduate</option>
                        <option>Graduate</option>
                        <option>Postgraduate</option>
                        <option>Doctorate</option>
                    </select>
                </div>
                <div className="student-form-group flex-1">
                    <label>Program Duration (years)</label>
                    <input
                        type="number"
                        required
                        min="1"
                        max="10"
                        value={form.age}
                        onChange={e => setForm({ ...form, age: e.target.value })}
                        placeholder="e.g., 4"
                    />
                </div>
            </div>

            <div className="student-form-row">
                <div className="student-form-group flex-1">
                    <label>Description</label>
                    <textarea
                        required
                        value={form.about}
                        onChange={e => setForm({ ...form, about: e.target.value })}
                        placeholder="About this course"
                        className="min-height-60"
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
        code: "",
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
    
    // Filter state
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    
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

    const filteredList = activeCourseList.filter(c => {
        const matchesSearch = (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
                             (c.code || "").toLowerCase().includes(search.toLowerCase()) ||
                             (c.email || "").toLowerCase().includes(search.toLowerCase());
        const matchesDepartment = departmentFilter === 'all' || c.department === departmentFilter;
        const matchesLevel = levelFilter === 'all' || c.gender === levelFilter;
        return matchesSearch && matchesDepartment && matchesLevel;
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
        <div className="course-page-wrapper">
            <Navbar />
            <main className="course-main-container">
                {!selectedCourse && (
                    <div className="course-page-header">
                        <h1>Courses</h1>
                        <p>Manage course information</p>
                    </div>
                )}

                {!selectedCourse && (
                    <div className="course-toolbar">
                        <div className="course-search-wrapper">
                            <svg
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
                            />
                        </div>
                        <select
                            className="course-filter-select"
                            value={departmentFilter}
                            onChange={e => setDepartmentFilter(e.target.value)}
                        >
                            <option value="all">All Departments</option>
                            {departments.filter(d => d && d.name).map(d => (
                                <option key={d.id || d.name} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                        <select
                            className="course-filter-select"
                            value={levelFilter}
                            onChange={e => setLevelFilter(e.target.value)}
                        >
                            <option value="all">All Levels</option>
                            <option value="Undergraduate">Undergraduate</option>
                            <option value="Postgraduate">Postgraduate</option>
                        </select>
                        {selectedCourses.length > 0 && (
                            <button 
                                className="course-archive-btn"
                                onClick={handleArchiveAll}
                            >
                                📦 Archive Selected ({selectedCourses.length})
                            </button>
                        )}
                        <button 
                            className="course-add-btn-primary"
                            onClick={handleAdd}
                        >
                            <span>+</span>
                            Add Course
                        </button>
                    </div>
                )}

                {selectedCourse && (
                    <div className="student-header">
                        <button className="student-back-btn" onClick={handleBackToList} aria-label="Go back">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#183153" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
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
                                    {selectedCourse.code} - {selectedCourse.name}
                                </div>
                                <div style={{ color: "#888", fontSize: "1rem" }}>
                                    {selectedCourse.department}
                                </div>
                            </div>

                            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>About</div>
                            <div style={{ color: "#555", marginBottom: 24, lineHeight: 1.6 }}>{selectedCourse.about}</div>
                            
                            <div style={{ display: "flex", gap: 40, marginBottom: 24 }}>
                                <div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Duration</div>
                                    <div style={{ fontWeight: 600 }}>{selectedCourse.age} years</div>
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
                    <div className="student-table-container course-table-wrapper">
                        <table className="student-table">
                            <thead>
                                <tr>
                                    <th className="checkbox-col">
                                        <input
                                            type="checkbox"
                                            checked={sortedList.length > 0 && selectedCourses.length === sortedList.length}
                                            onChange={handleSelectAllToggle}
                                        />
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('code')}>
                                        Code {sortField === 'code' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('name')}>
                                        Course Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('department')}>
                                        Department {sortField === 'department' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('gender')}>
                                        Level {sortField === 'gender' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="sortable" onClick={() => handleSort('age')}>
                                        Duration {sortField === 'age' && (sortDirection === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="actions-col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedList.length === 0 && (
                                    <tr><td colSpan="7">No courses found.</td></tr>
                                )}
                                {sortedList.map((s, idx) => (
                                    <tr key={s.id ?? idx} className="clickable">
                                        <td className="checkbox-cell" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedCourses.includes(s.id)}
                                                onChange={() => handleCheckboxToggle(s.id)}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </td>
                                        <td onClick={() => handleCourseClick(s)}>
                                            <HighlightText text={s.code} highlight={search} />
                                        </td>
                                        <td onClick={() => handleCourseClick(s)}>
                                            <HighlightText text={s.name} highlight={search} />
                                        </td>
                                        <td onClick={() => handleCourseClick(s)}>
                                            <HighlightText text={s.department} highlight={search} />
                                        </td>
                                        <td onClick={() => handleCourseClick(s)}>{s.gender}</td>
                                        <td onClick={() => handleCourseClick(s)}>{s.age} years</td>
                                        <td className="actions-cell">
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