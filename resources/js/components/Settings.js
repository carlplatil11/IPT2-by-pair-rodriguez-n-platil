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

// simple profile hook backed by localStorage
function useProfile(key = 'settings_profile') {
  const [profile, setProfile] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : { name: '', email: '', avatar: '', role: 'Administrator' };
    } catch {
      return { name: '', email: '', avatar: '', role: 'Administrator' };
    }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(profile)); } catch {}
  }, [key, profile]);

  return { profile, setProfile };
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('courses');

  const courses = useLocalList('settings_courses', []);
  const departments = useLocalList('settings_departments', []);
  const years = useLocalList('settings_years', []);

  const { profile, setProfile } = useProfile();

  const [form, setForm] = useState({ title: '', code: '' });
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('active'); // active | archived | all
  const [error, setError] = useState('');

  // profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);

  // Academic Years specific state
  const yearDefault = { title: '', start: '', end: '', status: 'Active', description: '' };
  const [showYearModal, setShowYearModal] = useState(false);
  const [yearForm, setYearForm] = useState(yearDefault);
  const [yearEditing, setYearEditing] = useState(null);

  useEffect(() => {
    setForm({ title: '', code: '' });
    setEditing(null);
    setFilter('active');
    setError('');
  }, [activeTab]);

  useEffect(() => {
    setProfileDraft(profile);
  }, [profile, showProfileModal]);

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

  const saveProfile = (e) => {
    e.preventDefault();
    const cleaned = {
      name: (profileDraft.name || '').trim(),
      email: (profileDraft.email || '').trim(),
      avatar: (profileDraft.avatar || '').trim(),
      role: (profileDraft.role || '').trim() || 'Administrator'
    };
    setProfile(cleaned);
    setShowProfileModal(false);
  };

  // Academic Years handlers
  const openAddYear = () => {
    setYearForm(yearDefault);
    setYearEditing(null);
    setShowYearModal(true);
  };

  const startEditYear = (item) => {
    setYearEditing(item.id);
    setYearForm({ title: item.title, start: item.start, end: item.end, status: item.status || 'Active', description: item.description || '' });
    setShowYearModal(true);
  };

  const saveYear = (e) => {
    e.preventDefault();
    if (!yearForm.title || yearForm.title.trim().length < 3) return;
    const payload = { ...yearForm };
    if (yearEditing) {
      years.update(yearEditing, payload);
    } else {
      years.add(payload);
    }
    setShowYearModal(false);
    setYearForm(yearDefault);
    setYearEditing(null);
  };

  const deleteYear = (id) => {
    if (!window.confirm('Delete this academic year?')) return;
    years.remove(id);
  };

  const filteredList = (list) => list.filter(it => filter === 'all' ? true : filter === 'archived' ? it.archived : !it.archived);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <main className="student-container" style={{ flex: 1 }}>
        <div className="dashboard-header">
          <h2 style={{ margin: 0 }}>System Settings</h2>
        </div>

        <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
          <aside style={{ minWidth: 260 }}>
            <div className="settings-sidebar">
              <button
                className={`settings-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveTab('courses')}
              >
                Courses
              </button>
              <button
                className={`settings-tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
                onClick={() => setActiveTab('departments')}
              >
                Departments
              </button>
              <button
                className={`settings-tab-btn ${activeTab === 'years' ? 'active' : ''}`}
                onClick={() => setActiveTab('years')}
              >
                Academic Years
              </button>

              <button
                className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                style={{ marginTop: 12 }}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
            </div>
          </aside>

          <section style={{ flex: 1 }}>
            <div className="student-table-container">
              {activeTab === 'profile' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ marginTop: 0 }}>Profile</h3>
                    <div>
                      <button className="student-form-submit" onClick={() => { setProfileDraft(profile); setShowProfileModal(true); }}>Edit Profile</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ width: 96, height: 96, borderRadius: 12, overflow: 'hidden', background: '#f3f6f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="#94a3b8" strokeWidth="1.5"/><path d="M4 20v-1c0-2.8 3.6-4 8-4s8 1.2 8 4v1" stroke="#94a3b8" strokeWidth="1.5"/></svg>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{profile.name || 'No name set'}</div>
                      <div style={{ color: '#6b7280', marginTop: 6 }}>{profile.email || 'No email set'}</div>
                      <div style={{ color: '#6b7280', marginTop: 4 }}>{profile.role || 'Administrator'}</div>
                    </div>
                  </div>

                  {showProfileModal && (
                    <div className="student-form-overlay">
                      <form className="student-full-form" onSubmit={saveProfile}>
                        <div className="student-form-header-row">
                          <h2 className="student-form-title">Edit Profile</h2>
                          <button type="button" className="student-form-cancel" onClick={() => setShowProfileModal(false)}>Close</button>
                        </div>

                        <div className="student-form-row">
                          <div className="student-form-group" style={{ flex: 1 }}>
                            <label>Full Name</label>
                            <input value={profileDraft.name} onChange={e => setProfileDraft(p => ({ ...p, name: e.target.value }))} placeholder="Full name" required />
                          </div>
                          <div className="student-form-group" style={{ width: 300 }}>
                            <label>Contact Email</label>
                            <input type="email" value={profileDraft.email} onChange={e => setProfileDraft(p => ({ ...p, email: e.target.value }))} placeholder="Email" />
                          </div>
                        </div>

                        <div className="student-form-row">
                          <div className="student-form-group" style={{ flex: 1 }}>
                            <label>Avatar URL</label>
                            <input value={profileDraft.avatar} onChange={e => setProfileDraft(p => ({ ...p, avatar: e.target.value }))} placeholder="https://..." />
                          </div>
                          <div className="student-form-group" style={{ width: 240 }}>
                            <label>Role</label>
                            <select value={profileDraft.role} onChange={e => setProfileDraft(p => ({ ...p, role: e.target.value }))}>
                              <option>Administrator</option>
                              <option>Registrar</option>
                              <option>Staff</option>
                            </select>
                          </div>
                        </div>

                        <div className="student-form-actions">
                          <button type="submit" className="student-form-submit">Save Profile</button>
                          <button type="button" className="student-form-cancel" onClick={() => setShowProfileModal(false)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              ) : activeTab === 'years' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Academic Years</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: 8 }}>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                        <option value="all">All</option>
                      </select>
                      <button className="student-form-submit" onClick={openAddYear}>Add new</button>
                    </div>
                  </div>

                  <table className="settings-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList(years.list).length === 0 && (
                        <tr><td colSpan="5">No items.</td></tr>
                      )}
                      {filteredList(years.list).map(item => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td>{item.start || '-'}</td>
                          <td>{item.end || '-'}</td>
                          <td>{item.archived ? 'Archived' : (item.status || 'Active')}</td>
                          <td>
                            <button className="student-icon-btn" onClick={() => startEditYear(item)} aria-label="Edit">✏️</button>
                            <button className="student-icon-btn" onClick={() => years.update(item.id, { archived: !item.archived })} aria-label="Archive">{item.archived ? '↩️' : '🗄️'}</button>
                            <button className="student-icon-btn" onClick={() => deleteYear(item.id)} aria-label="Delete">🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {showYearModal && (
                    <div className="student-form-overlay">
                      <form className="student-full-form" onSubmit={saveYear}>
                        <div className="student-form-header-row">
                          <h2 className="student-form-title">{yearEditing ? 'Edit Academic Year' : 'Add Academic Year'}</h2>
                          <button type="button" className="student-form-cancel" onClick={() => setShowYearModal(false)}>Close</button>
                        </div>

                        <div className="student-form-row">
                          <div className="student-form-group" style={{ flex: 1 }}>
                            <label>Academic Year</label>
                            <input value={yearForm.title} onChange={e => setYearForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. 2024 - 2025" required />
                          </div>
                          <div className="student-form-group" style={{ width: 180 }}>
                            <label>Start Date</label>
                            <input type="date" value={yearForm.start} onChange={e => setYearForm(p => ({ ...p, start: e.target.value }))} />
                          </div>
                          <div className="student-form-group" style={{ width: 180 }}>
                            <label>End Date</label>
                            <input type="date" value={yearForm.end} onChange={e => setYearForm(p => ({ ...p, end: e.target.value }))} />
                          </div>
                          <div className="student-form-group" style={{ width: 160 }}>
                            <label>Status</label>
                            <select value={yearForm.status} onChange={e => setYearForm(p => ({ ...p, status: e.target.value }))}>
                              <option>Active</option>
                              <option>Offline</option>
                              <option>Archived</option>
                            </select>
                          </div>
                        </div>

                        <div className="student-form-row">
                          <div className="student-form-group" style={{ flex: 1 }}>
                            <label>Description</label>
                            <textarea value={yearForm.description} onChange={e => setYearForm(p => ({ ...p, description: e.target.value }))} placeholder="Short notes (optional)" style={{ minHeight: 80 }} />
                          </div>
                        </div>

                        <div className="student-form-actions">
                          <button type="submit" className="student-form-submit">{yearEditing ? 'Save Changes' : 'Add Academic Year'}</button>
                          <button type="button" className="student-form-cancel" onClick={() => setShowYearModal(false)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>{activeTab === 'courses' ? 'Courses' : 'Departments'}</h3>
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
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}