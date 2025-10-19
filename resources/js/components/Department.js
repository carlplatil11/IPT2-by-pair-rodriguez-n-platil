import React, { useState, memo } from "react";
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
                        placeholder="HOD Name"
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
        description: ""
    };

    const [departments, setDepartments] = useState([]);
    React.useEffect(() => {
        fetch('/api/departments')
            .then(res => res.json())
            .then(data => setDepartments(data))
            .catch(() => setDepartments([]));
    }, []);

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [search, setSearch] = useState("");

    const handleAdd = () => {
        setForm(defaultForm);
        setShowAdd(true);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const newDept = await res.json();
                setDepartments([...departments, newDept]);
                setShowAdd(false);
            }
        } catch (err) {}
    };

    const handleEdit = (idx) => {
        setEditIndex(idx);
        setForm({ ...defaultForm, ...departments[idx] });
        setShowEdit(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const id = departments[editIndex].id;
            const res = await fetch(`/api/departments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const updated = await res.json();
                const copy = [...departments];
                copy[editIndex] = updated;
                setDepartments(copy);
                setShowEdit(false);
            }
        } catch (err) {}
    };

    const handleDelete = async (idx) => {
        if (!window.confirm('Delete this department?')) return;
        const id = departments[idx].id;
        try {
            const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
            if (res.ok) setDepartments(departments.filter((_, i) => i !== idx));
        } catch (err) {}
    };

    const filtered = departments.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <main className="department-container" style={{ flex: 1 }}>
                <div className="dashboard-header">
                    <button className="logout-btn" onClick={() => navigate('/login')}>Log out</button>
                </div>

                <div className="department-header">
                    <button className="department-back-btn" onClick={() => navigate(-1)}>
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

                <div className="department-table-container">
                    <table className="department-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>HOD</th>
                                <th>Contact</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((d, idx) => (
                                <tr key={idx} style={{ cursor: 'pointer' }}>
                                    <td onClick={() => navigate(`/department/${d.id}`)}>{d.name}</td>
                                    <td onClick={() => navigate(`/department/${d.id}`)}>{d.head}</td>
                                    <td onClick={() => navigate(`/department/${d.id}`)}>{d.email}</td>
                                    <td>
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
