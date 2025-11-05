import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [search, setSearch] = useState('');

  // Fetch courses from API
  const [courseList, setCourseList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  
  // Filter to show only ARCHIVED items in Settings (opposite of other components)
  const archivedCourseList = courseList.filter(c => c.status === 'archived' || c.archived === true);
  const archivedDepartmentList = departmentList.filter(d => d.status === 'Archived' || d.archived === true);
  
  // Apply search filtering
  const filteredCourses = archivedCourseList.filter(c =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.department || "").toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredDepartments = archivedDepartmentList.filter(d =>
    (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.head || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.email || "").toLowerCase().includes(search.toLowerCase())
  );
  
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourseList(Array.isArray(data) ? data : []))
      .catch(() => setCourseList([]));
  }, []);

  useEffect(() => {
    fetch('/api/departments')
      .then(res => res.json())
      .then(data => setDepartmentList(Array.isArray(data) ? data : []))
      .catch(() => setDepartmentList([]));
  }, []);

  const years = useLocalList('settings_years', []);

  const courseDefault = { name: '', department: '', age: '', gender: 'Undergraduate', about: '' };
  const departmentDefault = { name: '', head: '', email: '', description: '', status: 'Active' };
  
  const [form, setForm] = useState(courseDefault);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'courses') {
      setForm(courseDefault);
    } else if (activeTab === 'departments') {
      setForm(departmentDefault);
    }
    setEditing(null);
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (activeTab === 'courses') {
      if (!form.name || form.name.trim().length < 2) {
        alert('Course name is required (min 2 chars)');
        return;
      }

      const payload = { 
        ...form,
        age: form.age === "" ? null : Number(form.age)
      };
      
      try {
        if (editing) {
          const res = await fetch(`/api/courses/${editing}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const updated = await res.json();
            setCourseList(prev => prev.map(c => c.id === editing ? updated : c));
          }
        } else {
          const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const newCourse = await res.json();
            setCourseList(prev => [...prev, newCourse]);
          }
        }
      } catch (error) {
        console.error('Error saving course:', error);
      }
      
    } else if (activeTab === 'departments') {
      if (!form.name || form.name.trim().length < 2) {
        alert('Department name is required (min 2 chars)');
        return;
      }

      const payload = { ...form };
      
      try {
        if (editing) {
          const res = await fetch(`/api/departments/${editing}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const updated = await res.json();
            setDepartmentList(prev => prev.map(d => d.id === editing ? updated : d));
          }
        } else {
          const res = await fetch('/api/departments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            const newDept = await res.json();
            setDepartmentList(prev => [...prev, newDept]);
          }
        }
      } catch (error) {
        console.error('Error saving department:', error);
      }
    }
    
    setForm(activeTab === 'courses' ? courseDefault : departmentDefault);
    setEditing(null);
    setShowModal(false);
  };

  const startEdit = (item) => {
    setEditing(item.id);
    if (activeTab === 'courses') {
      setForm({ 
        name: item.name || '', 
        department: item.department || '', 
        age: item.age || '',
        gender: item.gender || 'Undergraduate',
        about: item.about || ''
      });
    } else if (activeTab === 'departments') {
      setForm({
        name: item.name || '',
        head: item.head || '',
        email: item.email || '',
        description: item.description || '',
        status: item.status || 'Active'
      });
    }
    setShowModal(true);
  };

  const confirmArchive = async (id) => {
    if (!window.confirm('Archive this item?')) return;
    
    try {
      if (activeTab === 'courses') {
        const res = await fetch(`/api/courses/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived', archived: true })
        });
        if (res.ok) {
          const updated = await res.json();
          setCourseList(prev => prev.map(c => c.id === id ? updated : c));
        }
      } else if (activeTab === 'departments') {
        const res = await fetch(`/api/departments/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Archived', archived: true })
        });
        if (res.ok) {
          const updated = await res.json();
          setDepartmentList(prev => prev.map(d => d.id === id ? updated : d));
        }
      }
    } catch (error) {
      console.error('Error archiving item:', error);
    }
  };

  const handleUnarchive = async (id) => {
    if (!window.confirm('Restore this item? Note: Archived courses in this department must be restored separately.')) return;
    
    try {
      if (activeTab === 'courses') {
        const res = await fetch(`/api/courses/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active', archived: false })
        });
        if (res.ok) {
          const updated = await res.json();
          setCourseList(prev => prev.map(c => c.id === id ? updated : c));
        }
      } else if (activeTab === 'departments') {
        const res = await fetch(`/api/departments/${id}`, { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Active', archived: false })
        });
        if (res.ok) {
          const updated = await res.json();
          setDepartmentList(prev => prev.map(d => d.id === id ? updated : d));
        }
      }
    } catch (error) {
      console.error('Error unarchiving item:', error);
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('Permanently delete this item? This cannot be undone!')) return;
    
    try {
      if (activeTab === 'courses') {
        const res = await fetch(`/api/courses/${id}`, { 
          method: 'DELETE'
        });
        if (res.ok) {
          setCourseList(prev => prev.filter(c => c.id !== id));
        }
      } else if (activeTab === 'departments') {
        const res = await fetch(`/api/departments/${id}`, { 
          method: 'DELETE'
        });
        if (res.ok) {
          setDepartmentList(prev => prev.filter(d => d.id !== id));
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <main className="student-container" style={{ flex: 1 }}>
        <div className="dashboard-header">
          <button className="logout-btn" onClick={() => window.location.href = '/login'}>Log out</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Archived Items</h2>
          <p style={{ color: '#6b7280', marginTop: 8 }}>Manage archived courses and departments</p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder={`Search archived ${activeTab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 400,
              padding: '10px 16px',
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = '#222'}
            onBlur={e => e.target.style.borderColor = '#d1d5db'}
          />
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 16, borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('courses')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'courses' ? '2px solid #222' : '2px solid transparent',
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: activeTab === 'courses' ? 600 : 400,
              color: activeTab === 'courses' ? '#222' : '#6b7280',
              marginBottom: -2,
              fontSize: 15
            }}
          >
            Archived Courses
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'departments' ? '2px solid #222' : '2px solid transparent',
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: activeTab === 'departments' ? 600 : 400,
              color: activeTab === 'departments' ? '#222' : '#6b7280',
              marginBottom: -2,
              fontSize: 15
            }}
          >
            Archived Departments
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>
            {activeTab === 'courses' && `${filteredCourses.length} of ${archivedCourseList.length} archived course${archivedCourseList.length !== 1 ? 's' : ''}`}
            {activeTab === 'departments' && `${filteredDepartments.length} of ${archivedDepartmentList.length} archived department${archivedDepartmentList.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Courses Table */}
        {activeTab === 'courses' && (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafbfc', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Course Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Department</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Level</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Credits</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px 16px', textAlign: 'center', color: '#9ca3af' }}>
                      {search ? 'No archived courses match your search.' : 'No archived courses found.'}
                    </td>
                  </tr>
                )}
                {filteredCourses.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{item.department}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{item.gender}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{item.age}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleUnarchive(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 6,
                          marginRight: 4
                        }}
                        title="Restore"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                          <path d="M3 3h18v4H3z" />
                          <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                          <path d="M9 11v6" />
                          <path d="M15 11v6" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handlePermanentDelete(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 6
                        }}
                        title="Delete Permanently"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafbfc', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Department Name</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Dean</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Contact</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px 16px', textAlign: 'center', color: '#9ca3af' }}>
                      {search ? 'No archived departments match your search.' : 'No archived departments found.'}
                    </td>
                  </tr>
                )}
                {filteredDepartments.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{item.head || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{item.email || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        background: '#9ca3af',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        Archived
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleUnarchive(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 6,
                          marginRight: 4
                        }}
                        title="Restore"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                          <path d="M3 3h18v4H3z" />
                          <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                          <path d="M9 11v6" />
                          <path d="M15 11v6" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handlePermanentDelete(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 6
                        }}
                        title="Delete Permanently"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
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

