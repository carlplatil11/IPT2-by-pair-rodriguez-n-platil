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

        {/* Modern Header */}
        <div style={{ padding: '24px 40px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0, marginBottom: 4 }}>System Settings</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Manage archived items and system configuration</p>
        </div>

        {/* Search and Filters Bar */}
        <div style={{ display: 'flex', gap: 16, padding: '20px 40px', borderBottom: '1px solid #e5e7eb', alignItems: 'center' }}>
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
              placeholder={`Search archived ${activeTab}...`}
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
          <div style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>
            {activeTab === 'courses' && `${filteredCourses.length} of ${archivedCourseList.length} items`}
            {activeTab === 'departments' && `${filteredDepartments.length} of ${archivedDepartmentList.length} items`}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ padding: '0 40px' }}>
          <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}>
            <button
              onClick={() => setActiveTab('courses')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'courses' ? '3px solid #111827' : '3px solid transparent',
                padding: '14px 20px',
                cursor: 'pointer',
                fontWeight: activeTab === 'courses' ? 600 : 400,
                color: activeTab === 'courses' ? '#111827' : '#6b7280',
                marginBottom: -2,
                fontSize: 14,
                transition: 'all 0.2s'
              }}
            >
              📚 Archived Courses
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'departments' ? '3px solid #111827' : '3px solid transparent',
                padding: '14px 20px',
                cursor: 'pointer',
                fontWeight: activeTab === 'departments' ? 600 : 400,
                color: activeTab === 'departments' ? '#111827' : '#6b7280',
                marginBottom: -2,
                fontSize: 14,
                transition: 'all 0.2s'
              }}
            >
              🏛️ Archived Departments
            </button>
          </div>
        </div>

        {/* Courses Table */}
        {activeTab === 'courses' && (
          <div style={{ padding: '0 40px', marginBottom: 40 }}>
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Course Name</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Department</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Level</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Credits</th>
                    <th style={{ textAlign: 'center', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ marginBottom: 12 }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M3 3h18v4H3z" />
                            <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                          </svg>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
                          {search ? 'No archived courses match your search' : 'No archived courses'}
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>
                          {search ? 'Try adjusting your search terms' : 'Archived courses will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredCourses.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.department}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.gender}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.age}</td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          style={{
                            background: '#dcfce7',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            marginRight: 8,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#16a34a',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#bbf7d0'}
                          onMouseLeave={e => e.target.style.background = '#dcfce7'}
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#dc2626',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#fecaca'}
                          onMouseLeave={e => e.target.style.background = '#fee2e2'}
                          title="Delete Permanently"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div style={{ padding: '0 40px', marginBottom: 40 }}>
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Department Name</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Dean</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Contact</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</th>
                    <th style={{ textAlign: 'center', padding: '14px 20px', fontWeight: 600, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ marginBottom: 12 }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                            <path d="M3 3h18v4H3z" />
                            <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
                          </svg>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
                          {search ? 'No archived departments match your search' : 'No archived departments'}
                        </div>
                        <div style={{ fontSize: 13, color: '#9ca3af' }}>
                          {search ? 'Try adjusting your search terms' : 'Archived departments will appear here'}
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredDepartments.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#111827', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.head || '-'}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: '#6b7280' }}>{item.email || '-'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-block',
                          background: '#f3f4f6',
                          color: '#6b7280',
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600
                        }}>
                          Archived
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleUnarchive(item.id)}
                          style={{
                            background: '#dcfce7',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            marginRight: 8,
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#16a34a',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#bbf7d0'}
                          onMouseLeave={e => e.target.style.background = '#dcfce7'}
                          title="Restore"
                        >
                          ↻ Restore
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(item.id)}
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#dc2626',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => e.target.style.background = '#fecaca'}
                          onMouseLeave={e => e.target.style.background = '#fee2e2'}
                          title="Delete Permanently"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

