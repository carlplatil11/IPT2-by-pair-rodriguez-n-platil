import React, { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const FacultyFullForm = memo(({ isEdit, onSubmit, onCancel, form, setForm }) => (
    <div className="faculty-form-overlay">
        <form className="faculty-full-form" onSubmit={onSubmit}>
            <div className="faculty-form-header-row">
                <h2 className="faculty-form-title">{isEdit ? "Edit Faculty" : "Add Faculty"}</h2>
                <div className="faculty-form-group" style={{ minWidth: 260 }}>
                    <input
                        type="text"
                        required
                        className="faculty-form-designation"
                        value={form.department}
                        onChange={e => setForm({ ...form, department: e.target.value })}
                        placeholder="Department"
                    />
                </div>
            </div>
            <div className="faculty-form-section-label"></div>
            <div className="faculty-form-row">
                <div className="faculty-form-group" style={{ flex: 1 }}>
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
            <div className="faculty-form-row">
                <div className="faculty-form-group" style={{ flex: 2 }}>
                    <label>Email address</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="Email address"
                    />
                </div>
                <div className="faculty-form-group" style={{ flex: 1 }}>
                    <label>Class</label>
                    <input
                        type="text"
                        required
                        value={form.class}
                        onChange={e => setForm({ ...form, class: e.target.value })}
                        placeholder="Class"
                    />
                </div>
                <div className="faculty-form-group" style={{ flex: 1 }}>
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
            <div className="faculty-form-row">
                <div className="faculty-form-group" style={{ flex: 1 }}>
                    <label>Phone number</label>
                    <input
                        type="text"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="Phone number"
                    />
                </div>
            </div>
            <div className="faculty-form-row">
                <div className="faculty-form-group" style={{ flex: 1 }}>
                    <label>Subject</label>
                    <input
                        type="text"
                        required
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="Subject"
                    />
                </div>
                <div className="faculty-form-group" style={{ flex: 1 }}>
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
            <div className="faculty-form-row">
                <div className="faculty-form-group" style={{ flex: 1 }}>
                    <label>About</label>
                    <textarea
                        required
                        value={form.about}
                        onChange={e => setForm({ ...form, about: e.target.value })}
                        placeholder="About this faculty member"
                        style={{ minHeight: 60 }}
                    />
                </div>
            </div>
            <div className="faculty-form-actions">
                <button type="submit" className="faculty-form-submit">
                    {isEdit ? "Save Changes" : "Add Faculty"}
                </button>
                <button type="button" className="faculty-form-cancel" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    </div>
));

export default function Faculty() {
    const navigate = useNavigate();

    // Default form object to ensure all fields are present
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

    // Faculty list state
    const [facultyList, setFacultyList] = useState([]);

    // Fetch faculty list from backend on mount
    React.useEffect(() => {
        fetch('/api/faculties')
            .then(res => res.json())
            .then(data => setFacultyList(data))
            .catch(() => setFacultyList([]));
    }, []);

    // Modal and form state
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [form, setForm] = useState(defaultForm);
    const [search, setSearch] = useState("");
    const [showFilter, setShowFilter] = useState(false);

    // Profile view state
    const [selectedUser, setSelectedUser] = useState(null);

    // Add Faculty
    const handleAdd = () => {
        setForm(defaultForm);
        setShowAdd(true);
    };
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/faculties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    avatar: form.avatar || "https://randomuser.me/api/portraits/men/34.jpg"
                })
            });
            if (res.ok) {
                const newFaculty = await res.json();
                setFacultyList([...facultyList, newFaculty]);
                setShowAdd(false);
            }
        } catch (err) {}
    };

    // Edit Faculty
    const handleEdit = (idx) => {
        setEditIndex(idx);
        setForm({ ...defaultForm, ...facultyList[idx] });
        setShowEdit(true);
    };
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const id = facultyList[editIndex].id;
            const res = await fetch(`/api/faculties/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const updatedFaculty = await res.json();
                const updated = [...facultyList];
                updated[editIndex] = updatedFaculty;
                setFacultyList(updated);
                setShowEdit(false);
            }
        } catch (err) {}
    };

    // Delete Faculty
    const handleDelete = async (idx) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            const id = facultyList[idx].id;
            try {
                const res = await fetch(`/api/faculties/${id}`, { method: 'DELETE' });
                if (res.ok) {
                    setFacultyList(facultyList.filter((_, i) => i !== idx));
                }
            } catch (err) {}
        }
    };

    // Filter (demo: just toggles a modal)
    const handleFilter = () => setShowFilter(true);

    // Search
    const filteredList = facultyList.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleLogout = () => {
        navigate("/login");
    };

    // Profile view
    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const handleBackToList = () => {
        setSelectedUser(null);
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <main className="faculty-container" style={{ flex: 1 }}>
                <div className="dashboard-header">
                    <button className="logout-btn" onClick={handleLogout}>Log out</button>
                </div>
                <div className="faculty-header">
                    <button className="faculty-back-btn" onClick={() => selectedUser ? handleBackToList() : navigate(-1)}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="12" fill="#222" opacity="0.12"/>
                            <path d="M14 8l-4 4 4 4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="faculty-actions">
                        {!selectedUser && (
                            <>
                                <button className="faculty-add-btn" onClick={handleAdd}>Add Faculty</button>
                                <input
                                    className="faculty-search"
                                    type="text"
                                    placeholder="Search for by name or email"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </>
                        )}
                        {selectedUser && (
                            <input
                                className="faculty-search"
                                type="text"
                                placeholder="Search for by name or email"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ display: "none" }}
                            />
                        )}
                    </div>
                </div>

                {/* Add Faculty Full Page */}
                {showAdd && (
                    <FacultyFullForm
                        isEdit={false}
                        onSubmit={handleAddSubmit}
                        onCancel={() => setShowAdd(false)}
                        form={form}
                        setForm={setForm}
                    />
                )}

                {/* Edit Faculty Full Page */}
                {showEdit && (
                    <FacultyFullForm
                        isEdit={true}
                        onSubmit={handleEditSubmit}
                        onCancel={() => setShowEdit(false)}
                        form={form}
                        setForm={setForm}
                    />
                )}

                {/* Profile View */}
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
                                src={selectedUser.avatar}
                                alt={selectedUser.name}
                                style={{
                                    width: 220,
                                    height: 220,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    boxShadow: "0 4px 24px #e6eaf1"
                                }}
                            />
                            <div style={{ marginTop: 24, fontWeight: 700, fontSize: "1.3rem", textAlign: "center" }}>
                                {selectedUser.name}
                            </div>
                            <div style={{ color: "#888", fontSize: "1rem", marginBottom: 24, textAlign: "center" }}>
                                {selectedUser.subject}
                            </div>
                            <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                                <button style={{
                                    background: "#f5f6fa",
                                    border: "none",
                                    borderRadius: 12,
                                    padding: 16,
                                    cursor: "pointer"
                                }}>
                                    <svg width="28" height="28" fill="none" stroke="#2584ff" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7.5"/>
                                        <path d="M16 2v4"/>
                                        <path d="M8 2v4"/>
                                        <path d="M3 10h18"/>
                                    </svg>
                                </button>
                                <button style={{
                                    background: "#f5f6fa",
                                    border: "none",
                                    borderRadius: 12,
                                    padding: 16,
                                    cursor: "pointer"
                                }}>
                                    <svg width="28" height="28" fill="none" stroke="#2584ff" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M22 16.92V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"/>
                                        <path d="M16 3v4"/>
                                        <path d="M8 3v4"/>
                                        <path d="M3 10h18"/>
                                    </svg>
                                </button>
                                <button style={{
                                    background: "#f5f6fa",
                                    border: "none",
                                    borderRadius: 12,
                                    padding: 16,
                                    cursor: "pointer"
                                }}>
                                    <svg width="28" height="28" fill="none" stroke="#2584ff" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7.5"/>
                                        <path d="M16 2v4"/>
                                        <path d="M8 2v4"/>
                                        <path d="M3 10h18"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div style={{ minWidth: 320, maxWidth: 400 }}>
                            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>About</div>
                            <div style={{ color: "#555", marginBottom: 24, lineHeight: 1.6 }}>
                                {selectedUser.about}
                            </div>
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
                        </div>
                    </div>
                ) : (
                    // Table View
                    <div className="faculty-table-container">
                        <table className="faculty-table">
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
                                {filteredList.map((f, idx) => (
                                    <tr key={idx} style={{ cursor: "pointer" }}>
                                        <td onClick={() => handleUserClick(f)}>
                                            <div className="faculty-avatar-name">
                                                <img src={f.avatar} alt={f.name} className="faculty-avatar" />
                                                <span>{f.name}</span>
                                            </div>
                                        </td>
                                        <td onClick={() => handleUserClick(f)}>{f.subject}</td>
                                        <td onClick={() => handleUserClick(f)}>{f.class}</td>
                                        <td onClick={() => handleUserClick(f)}>{f.email}</td>
                                        <td onClick={() => handleUserClick(f)}>{f.department}</td>
                                        <td onClick={() => handleUserClick(f)}>{f.gender}</td>
                                        <td>
                                            <button className="faculty-icon-btn" title="Edit" onClick={e => { e.stopPropagation(); handleEdit(idx); }}>
                                                <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path d="M12 20h9" />
                                                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                                                </svg>
                                            </button>
                                            <button className="faculty-icon-btn" title="Delete" onClick={e => { e.stopPropagation(); handleDelete(idx); }}>
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
                )}

                {/* Filter Modal (demo only) */}
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