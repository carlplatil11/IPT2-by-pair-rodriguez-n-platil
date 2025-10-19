import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

// Reusable localStorage-backed list manager
function useLocalList(key, initial = []) {
  const [list, setList] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
  }, [key, list]);

  const add = item => setList(prev => [...prev, { ...item, id: Date.now(), archived: false }]);
  const update = (id, patch) => setList(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  const remove = id => setList(prev => prev.filter(i => i.id !== id));
  const archive = id => update(id, { archived: true });

  return { list, setList, add, update, remove, archive };
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('courses');

  const courses = useLocalList('settings_courses', []);
  const departments = useLocalList('settings_departments', []);
  const years = useLocalList('settings_years', []);

  const [form, setForm] = useState({ title: '', code: '' });
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('active'); // active | archived | all
  const [error, setError] = useState('');

  useEffect(() => { setForm({ title: '', code: '' }); setEditing(null); setFilter('active'); setError(''); }, [activeTab]);

  const current = activeTab === 'courses' ? courses : activeTab === 'departments' ? departments : years;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.title || form.title.trim().length < 2) {
      setError('Title is required (min 2 chars)');
      return;
    }

    if (editing) {
      current.update(editing, { ...form });
    } else {
      current.add({ ...form });
    }
    setForm({ title: '', code: '' });
    setEditing(null);
    setShowModal(false);
  };

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({ title: item.title || item.name || '', code: item.code || item.class || '' });
    setShowModal(true);
  };

  const confirmDelete = (id) => {
    if (window.confirm('Delete this item permanently?')) current.remove(id);
  };

  const toggleArchive = (item) => {
    current.update(item.id, { archived: !item.archived });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <main className="student-container" style={{ flex: 1 }}>
        <div className="dashboard-header">
          <h2 style={{ margin: 0 }}>System Settings</h2>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
          <aside style={{ minWidth: 220 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
              <button className={`student-add-btn`} style={{ width: '100%', marginBottom: 8 }} onClick={() => setActiveTab('courses')}>Courses</button>
              <button className={`student-add-btn`} style={{ width: '100%', marginBottom: 8 }} onClick={() => setActiveTab('departments')}>Departments</button>
              <button className={`student-add-btn`} style={{ width: '100%' }} onClick={() => setActiveTab('years')}>Academic Years</button>
            </div>
          </aside>

          <section style={{ flex: 1 }}>
            <div className="student-table-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginTop: 0, marginBottom: 12 }}>{activeTab === 'courses' ? 'Courses' : activeTab === 'departments' ? 'Departments' : 'Academic Years'}</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: 8 }}>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="all">All</option>
                  </select>
                  <button className="student-form-submit" onClick={() => { setShowModal(true); setEditing(null); setForm({ title: '', code: '' }); }}>Add new</button>
                </div>
              </div>

              <table className="student-table">
                <thead>
                  <tr><th>Title</th><th>Code</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {current.list.filter(it => filter === 'all' ? true : filter === 'archived' ? it.archived : !it.archived).length === 0 && (
                    <tr><td colSpan="4">No items.</td></tr>
                  )}
                  {current.list.filter(it => filter === 'all' ? true : filter === 'archived' ? it.archived : !it.archived).map(item => (
                    <tr key={item.id}>
                      <td>{item.title || item.name}</td>
                      <td>{item.code || item.class}</td>
                      <td>{item.archived ? 'Archived' : 'Active'}</td>
                      <td>
                        <button className="student-icon-btn" onClick={() => startEdit(item)} aria-label="Edit">✏️</button>
                        <button className="student-icon-btn" onClick={() => toggleArchive(item)} aria-label="Archive">{item.archived ? '↩️' : '🗄️'}</button>
                        <button className="student-icon-btn" onClick={() => confirmDelete(item.id)} aria-label="Delete">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {showModal && (
                <div className="student-form-overlay">
                  <div className="student-full-form">
                    <div className="student-form-header-row">
                      <h2 className="student-form-title">{editing ? 'Edit item' : 'Add item'}</h2>
                      <button className="student-form-cancel" onClick={() => { setShowModal(false); setEditing(null); setError(''); }}>Close</button>
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="student-form-row">
                        <div className="student-form-group" style={{ flex: 1 }}>
                          <label>Title</label>
                          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                        </div>
                        <div className="student-form-group" style={{ width: 200 }}>
                          <label>Code</label>
                          <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                        </div>
                      </div>
                      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
                      <div className="student-form-actions">
                        <button type="submit" className="student-form-submit">{editing ? 'Save changes' : 'Add'}</button>
                        <button type="button" className="student-form-cancel" onClick={() => { setShowModal(false); setEditing(null); setError(''); }}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
