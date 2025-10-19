// ...existing code...
import React, { useState, memo, useEffect } from "react";
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
                        <option value="Offline">Offline</option>
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
    useEffect(() => {
        fetch('/api/departments')
            .then(res => res.json())
            .then(data => setDepartments(Array.isArray(data) ? data : []))
            .catch(() => setDepartments([]));
    }, []);

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
        setForm({ ...defaultForm, ...departments[idx] });
        setShowEdit(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (editIndex === null) return;
        try {
            const id = departments[editIndex].id;
            const payload = { ...form };
            const res = await fetch(`/api/departments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const updated = await res.json();
                const copy = [...departments];
                copy[editIndex] = updated;
                setDepartments(copy);
                setShowEdit(false);
            } else {
                const copy = [...departments];
                copy[editIndex] = { ...copy[editIndex], ...payload };
                setDepartments(copy);
                setShowEdit(false);
            }
        } catch {
            const copy = [...departments];
            copy[editIndex] = { ...copy[editIndex], ...form };
            setDepartments(copy);
            setShowEdit(false);
        } finally {
            setEditIndex(null);
            setForm(defaultForm);
        }
    };

    const handleDelete = async (idx) => {
        if (!window.confirm('Delete this department?')) return;
        const id = departments[idx].id;
        try {
            const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
            if (res.ok) setDepartments(prev => prev.filter((_, i) => i !== idx));
        } catch {
            setDepartments(prev => prev.filter((_, i) => i !== idx));
        }
        // if deleting currently selected, clear view
        if (selectedDept && selectedDept.id === id) setSelectedDept(null);
    };

    const handleUserClick = (dept) => {
        setSelectedDept(dept);
    };

    const handleBackToList = () => {
        setSelectedDept(null);
    };

    const filtered = departments.filter(d =>
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

                <div className="department-header">
                    <button className="department-back-btn" onClick={() => selectedDept ? handleBackToList() : navigate(-1)}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="12" fill="#222" opacity="0.12"/>
                            <path d="M14 8l-4 4 4 4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="department-actions">
                        <button className="department-add-btn" onClick={handleAdd}>Add Department</button>
                        <input
                            className="department-search"
                            type="text"
                            placeholder="Search by name"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
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
                                        const idx = departments.findIndex(d => d.id === selectedDept.id);
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
                                    title="Delete"
                                    onClick={() => {
                                        const idx = departments.findIndex(d => d.id === selectedDept.id);
                                        if (idx !== -1) handleDelete(idx);
                                        handleBackToList();
                                    }}
                                >
                                    <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
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
                                        <td onClick={() => handleUserClick(d)}>{d.students ?? ""}</td>
                                        <td onClick={() => handleUserClick(d)}>{d.status ?? "Active"}</td>
                                        <td style={{ textAlign: "center" }}>
                                            <div className="actions-cell">
                                                <button className="department-icon-btn" title="Edit" onClick={e => { e.stopPropagation(); handleEdit(idx); }}>
                                                    <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M12 20h9" />
                                                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                                                    </svg>
                                                </button>
                                                <button className="department-icon-btn" title="Delete" onClick={e => { e.stopPropagation(); handleDelete(idx); }}>
                                                    <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M3 6h18" />
                                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                        <path d="M10 11v6" />
                                                        <path d="M14 11v6" />
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
// ...existing code...