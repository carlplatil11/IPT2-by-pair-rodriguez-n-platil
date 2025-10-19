// ...existing code...
import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

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
const FacultyFullForm = memo(({ isEdit, onSubmit, onCancel, form, setForm }) => (
  <div className="faculty-form-overlay" role="dialog" aria-modal="true">
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

      <div className="faculty-form-row">
        <div className="faculty-form-group" style={{ flex: 1 }}>
          <label>Full Name</label>
          <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
        </div>
      </div>

      <div className="faculty-form-row">
        <div className="faculty-form-group" style={{ flex: 2 }}>
          <label>Email address</label>
          <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email address" />
        </div>
        <div className="faculty-form-group" style={{ flex: 1 }}>
          <label>Gender</label>
          <select required value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
      </div>

      <div className="faculty-form-row">
        <div className="faculty-form-group" style={{ flex: 1 }}>
          <label>Phone number</label>
          <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
        </div>
      </div>

      <div className="faculty-form-row">
        <div className="faculty-form-group" style={{ flex: 1 }}>
          <label>Subject</label>
          <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" />
        </div>
        <div className="faculty-form-group" style={{ flex: 1 }}>
          <label>Age</label>
          <input type="number" required value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="Age" />
        </div>
      </div>

      <div className="faculty-form-row">
        <div className="faculty-form-group" style={{ flex: 1 }}>
          <label>About</label>
          <textarea required value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} placeholder="About this faculty member" style={{ minHeight: 60 }} />
        </div>
      </div>

      <div className="faculty-form-actions">
        <button type="submit" className="faculty-form-submit">{isEdit ? "Save Changes" : "Add Faculty"}</button>
        <button type="button" className="faculty-form-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  </div>
));

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
    name: "", subject: "", email: "", age: "", gender: "Male", avatar: "", about: "", phone: "", department: ""
  };

  const [facultyList, setFacultyList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/faculties');
        if (res.ok) {
          const json = await res.json();
          if (mounted) setFacultyList(Array.isArray(json) ? json : []);
        } else throw new Error("no api");
      } catch {
        try {
          const local = await localDB.readAll();
          if (mounted) setFacultyList(Array.isArray(local) ? local : []);
        } catch {
          if (mounted) setFacultyList([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
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

  const handleEdit = (idx) => { setEditIndex(idx); setForm({ ...defaultForm, ...facultyList[idx] }); setShowEdit(true); };
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

  const handleDelete = async (idx) => {
    const target = facultyList[idx];
    if (!target) return;
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/faculties/${target.id}`, { method: 'DELETE' });
      if (res.ok) setFacultyList(prev => prev.filter((_, i) => i !== idx));
      else { await localDB.delete(target.id); setFacultyList(prev => prev.filter((_, i) => i !== idx)); }
    } catch {
      await localDB.delete(target.id);
      setFacultyList(prev => prev.filter((_, i) => i !== idx));
    }
    if (selectedUser && selectedUser.id === target.id) setSelectedUser(null);
  };

  const handleFilter = () => setShowFilter(true);
  const handleLogout = () => navigate("/login");
  const handleUserClick = (user) => setSelectedUser(user);
  const handleBackToList = () => setSelectedUser(null);

  const filteredList = facultyList.filter(f =>
    (f.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const fontStyle = { fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", ...fontStyle }}>
      <Navbar />
      <main className="faculty-container" style={{ flex: 1 }}>
        <div className="dashboard-header">
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>

        <div className="faculty-header">
          <button className="faculty-back-btn" onClick={() => selectedUser ? handleBackToList() : navigate(-1)}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#222" opacity="0.12"/><path d="M14 8l-4 4 4 4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className="faculty-actions">
            {!selectedUser && (
              <>
                <button className="faculty-add-btn" onClick={handleAdd}>Add Faculty</button>
                <input className="faculty-search" type="text" placeholder="Search for by name or email" value={search} onChange={e => setSearch(e.target.value)} />
              </>
            )}
          </div>
        </div>

        {showAdd && <FacultyFullForm isEdit={false} onSubmit={handleAddSubmit} onCancel={() => setShowAdd(false)} form={form} setForm={setForm} />}
        {showEdit && <FacultyFullForm isEdit={true} onSubmit={handleEditSubmit} onCancel={() => setShowEdit(false)} form={form} setForm={setForm} />}

        {!showAdd && !showEdit && selectedUser ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", marginTop: 40, gap: 60 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 320 }}>
              <img src={selectedUser.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={selectedUser.name} style={{ width: 220, height: 220, borderRadius: "50%", objectFit: "cover", boxShadow: "0 4px 24px #e6eaf1" }} />
              <div style={{ marginTop: 24, fontWeight: 700, fontSize: "1.3rem", textAlign: "center" }}>{selectedUser.name}</div>
              <div style={{ color: "#888", fontSize: "1rem", marginBottom: 24, textAlign: "center" }}>{selectedUser.subject}</div>

              <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                <button style={{ background: "#0033ff", border: "none", borderRadius: 12, padding: 12, cursor: "pointer", fontFamily: fontStyle.fontFamily, fontWeight: 600, color: "#fff" }} onClick={() => { const idx = facultyList.findIndex(f => f.id === selectedUser.id); if (idx !== -1) handleEdit(idx); }}>
                  Edit
                </button>
                <button style={{ background: "#ff2d2d", border: "none", borderRadius: 12, padding: 12, cursor: "pointer", fontFamily: fontStyle.fontFamily, fontWeight: 600, color: "#fff" }} onClick={() => { const idx = facultyList.findIndex(f => f.id === selectedUser.id); if (idx !== -1) handleDelete(idx); handleBackToList(); }}>
                  Delete
                </button>
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
            </div>
          </div>
        ) : (
          <div className="faculty-table-container">
            <table className="faculty-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Email address</th>
                  <th>Department</th>
                  <th>Gender</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(!loading && filteredList.length === 0) && <tr><td colSpan="6">No faculty found.</td></tr>}
                {(loading) && <tr><td colSpan="6">Loading…</td></tr>}
                {filteredList.map((f, idx) => (
                  <tr key={f.id ?? idx} style={{ cursor: "pointer" }}>
                    <td onClick={() => handleUserClick(f)}>
                      <div className="faculty-avatar-name">
                        <img src={f.avatar || "https://randomuser.me/api/portraits/lego/1.jpg"} alt={f.name} className="faculty-avatar" />
                        <span>{f.name}</span>
                      </div>
                    </td>
                    <td onClick={() => handleUserClick(f)}>{f.subject}</td>
                    <td onClick={() => handleUserClick(f)}>{f.email}</td>
                    <td onClick={() => handleUserClick(f)}>{f.department}</td>
                    <td onClick={() => handleUserClick(f)}>{f.gender}</td>
                    <td>
                      <button className="faculty-icon-btn" title="Edit" onClick={e => { e.stopPropagation(); handleEdit(idx); }}>
                        <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
                      </button>
                      <button className="faculty-icon-btn" title="Delete" onClick={e => { e.stopPropagation(); handleDelete(idx); }}>
                        <svg width="20" height="20" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
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