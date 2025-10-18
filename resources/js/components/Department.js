import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const StudentFullForm = memo(({ isEdit, onSubmit, onCancel, form, setForm }) => (
    <div className="student-form-overlay">
        <form className="student-full-form" onSubmit={onSubmit}>
            <div className="student-form-header-row">
                <h2 className="student-form-title">{isEdit ? "Edit Student" : "Add Student"}</h2>
                <div className="student-form-group" style={{ minWidth: 260 }}>
                    <input
                        type="text"
                        required
                        className="student-form-designation"
                        value={form.department}
                        onChange={e => setForm({ ...form, department: e.target.value })}
                        placeholder="Department"
                    />
                </div>
            </div>

            <div className="student-form-section-label"></div>

            <div className="student-form-row">
                <div className="student-form-group" style={{ flex: 1 }}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Full Name"
                    />
                </div>
            </div>

            <div className="student-form-row">
                <div className="student-form-group" style={{ flex: 2 }}>
                    <label>Email address</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="Email address"
                    />
                </div>
                <div className="student-form-group" style={{ flex: 1 }}>
                    <label>Class</label>
                    <input
                        type="text"
                        required
                        value={form.class}
                        onChange={e => setForm({ ...form, class: e.target.value })}
                        placeholder="Class"
                    />
                </div>
                <div className="student-form-group" style={{ flex: 1 }}>
                    <label>Gender</label>
                    <select
                        required
                        value={form.gender}
                        onChange={e => setForm({ ...form, gender: e.target.value })}
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
                        type="text"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="Phone number"
                    />
                </div>
            </div>

            <div className="student-form-row">
                <div className="student-form-group" style={{ flex: 1 }}>
                    <label>Subject</label>
                    <input
                        type="text"
                        required
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="Subject"
                    />
                </div>
                <div className="student-form-group" style={{ flex: 1 }}>
                    <label>Age</label>
                    <input
                        type="number"
                        required
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
                        required
                        value={form.about}
                        onChange={e => setForm({ ...form, about: e.target.value })}
                        placeholder="About this student"
                        style={{ minHeight: 60 }}
                    />
                </div>
            </div>

            <div className="student-form-actions">
                <button type="submit" className="student-form-submit">
                    {isEdit ? "Save Changes" : "Add Student"}
                </button>
                <button type="button" className="student-form-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    </div>
));

export default function Student() {
    const navigate = useNavigate();

    const defaultForm = {
        name: "",
        subject: "",
        class: "",
        email: "",
        age: "",
        gender: "Male",
        avatar: "",
        about: "",
        phone: "",
        department: ""
    };

    const [studentList, setStudentList] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [search, setSearch] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch("/api/students");
                if (!res.ok) throw new Error("API error");
                const data = await res.json();
                if (mounted) setStudentList(Array.isArray(data) ? data : []);
            } catch {
                // fallback to empty list
                if (mounted) setStudentList([]);
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
            age: form.age === "" ? null : Number(form.age),
            avatar: form.avatar || "https://randomuser.me/api/portraits/men/34.jpg"
        };
        try {
            const res = await fetch("/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const newStudent = await res.json();
                setStudentList(prev => [...prev, newStudent]);
            } else {
                setStudentList(prev => [...prev, { ...payload, id: Date.now() }]);
            }
        } catch {
            setStudentList(prev => [...prev, { ...payload, id: Date.now() }]);
        } finally {
            setShowAdd(false);
            setForm(defaultForm);
        }
    };

    const handleEdit = (idx) => {
        setEditIndex(idx);
        setForm({ ...defaultForm, ...studentList[idx] });
        setShowEdit(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editIndex === null) return;
        const id = studentList[editIndex]?.id;
        if (!id) return;
        const payload = { ...form, age: form.age === "" ? null : Number(form.age) };
        try {
            const res = await fetch(`/api/students/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const updated = await res.json();
                setStudentList(prev => prev.map(s => s.id === updated.id ? updated : s));
            } else {
                setStudentList(prev => {
                    const copy = [...prev];
                    copy[editIndex] = { ...copy[editIndex], ...payload };
                    return copy;
                });
            }
        } catch {
            setStudentList(prev => {
                const copy = [...prev];
                copy[editIndex] = { ...copy[editIndex], ...payload };
                return copy;
            });
        } finally {
            setShowEdit(false);
            setEditIndex(null);
            setForm(defaultForm);
        }
    };

    const handleDelete = async (idx) => {
        const target = studentList[idx];
        if (!target) return;
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            const res = await fetch(`/api/students/${target.id}`, { method: "DELETE" });
            if (res.ok) {
                setStudentList(prev => prev.filter((_, i) => i !== idx));
            } else {
                setStudentList(prev => prev.filter((_, i) => i !== idx));
            }
        } catch {
            setStudentList(prev => prev.filter((_, i) => i !== idx));
        }
    };

    const handleFilter = () => setShowFilter(true);

    const filteredList = studentList.filter(s =>
        (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.email || "").toLowerCase().includes(search.toLowerCase())
    );

    const handleLogout = () => navigate("/login");

    const handleUserClick = (user) => setSelectedUser(user);
    const handleBackToList = () => setSelectedUser(null);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <main className="student-container" style={{ flex: 1 }}>
                <div className="dashboard-header">
                    <button className="logout-btn" onClick={handleLogout}>Log out</button>
                </div>

                <div className="student-header">
                    <button className="student-back-btn" onClick={() => selectedUser ? handleBackToList() : navigate(-1)}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="12" fill="#222" opacity="0.12"/>
                            <path d="M14 8l-4 4 4 4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="student-actions">
                        {!selectedUser && (
                            <>
                                <button className="student-add-btn" onClick={handleAdd}>Add Department</button>
                                <input
                                    className="student-search"
                                    type="text"
                                    placeholder="Search for by name or email"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </>
                        )}
                    </div>
                </div>

                {showAdd && (
                    <StudentFullForm
                        isEdit={false}
                        onSubmit={handleAddSubmit}
                        onCancel={() => { setShowAdd(false); setForm(defaultForm); }}
                        form={form}
                        setForm={setForm}
                    />
                )}

                {showEdit && (
                    <StudentFullForm
                        isEdit={true}
                        onSubmit={handleEditSubmit}
                        onCancel={() => { setShowEdit(false); setForm(defaultForm); setEditIndex(null); }}
                        form={form}
                        setForm={setForm}
                    />
                )}

                {!showAdd && !showEdit && selectedUser ? (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        marginTop: "40px",
                        gap: "60px"
                    }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 320 }}>
                            <img
                                src={selectedUser.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"}
                                alt={selectedUser.name}
                                style={{ width: 220, height: 220, borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 24px #e6eaf1" }}
                            />
                            <div style={{ marginTop: 24, fontWeight: 700, fontSize: "1.3rem", textAlign: "center" }}>
                                {selectedUser.name}
                            </div>
                            <div style={{ color: "#888", fontSize: "1rem", marginBottom: 24, textAlign: "center" }}>
                                {selectedUser.subject}
                            </div>
                        </div>

                        <div style={{ minWidth: 320, maxWidth: 400 }}>
                            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>About</div>
                            <div style={{ color: "#555", marginBottom: 24, lineHeight: 1.6 }}>{selectedUser.about}</div>
                            <div style={{ display: "flex", gap: 40 }}>
                                <div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Age</div>
                                    <div style={{ fontWeight: 600 }}>{selectedUser.age}</div>
                                </div>
                                <div>
                                    <div style={{ color: "#888", fontSize: 13 }}>Gender</div>
                                    <div style={{ fontWeight: 600 }}>{selectedUser.gender}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <button
                                    className="student-icon-btn"
                                    title="Edit"
                                    aria-label="Edit student"
                                    onClick={() => {
                                        const idx = studentList.findIndex(s => s.id === selectedUser.id);
                                        if (idx !== -1) handleEdit(idx);
                                    }}
                                    style={{ marginRight: 8 }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                                <button
                                    className="student-icon-btn"
                                    title="Delete"
                                    aria-label="Delete student"
                                    onClick={() => {
                                        const idx = studentList.findIndex(s => s.id === selectedUser.id);
                                        if (idx !== -1) handleDelete(idx);
                                        handleBackToList();
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M3 6h18" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L6 6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M10 11v6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M14 11v6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                                    <th>Name</th>
                                    <th>Subject</th>
                                    <th>Class</th>
                                    <th>Email address</th>
                                    <th>Department</th>
                                    <th>Gender</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.length === 0 && (
                                    <tr><td colSpan="7">No students found.</td></tr>
                                )}
                                {filteredList.map((s, idx) => (
                                    <tr key={s.id ?? idx} style={{ cursor: "pointer" }}>
                                        <td onClick={() => handleUserClick(s)}>
                                            <div className="student-avatar-name">
                                                <img src={s.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={s.name} className="student-avatar" />
                                                <span>{s.name}</span>
                                            </div>
                                        </td>
                                        <td onClick={() => handleUserClick(s)}>{s.subject}</td>
                                        <td onClick={() => handleUserClick(s)}>{s.class}</td>
                                        <td onClick={() => handleUserClick(s)}>{s.email}</td>
                                        <td onClick={() => handleUserClick(s)}>{s.department}</td>
                                        <td onClick={() => handleUserClick(s)}>{s.gender}</td>
                                        <td>
                                            <button
                                                className="student-icon-btn"
                                                title="Edit"
                                                aria-label="Edit student"
                                                onClick={e => { e.stopPropagation(); handleEdit(idx); }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
                                            <button
                                                className="student-icon-btn"
                                                title="Delete"
                                                aria-label="Delete student"
                                                onClick={e => { e.stopPropagation(); handleDelete(idx); }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path d="M3 6h18" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L6 6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M10 11v6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M14 11v6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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