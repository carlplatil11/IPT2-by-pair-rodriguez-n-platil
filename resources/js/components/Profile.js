import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const [adminData, setAdminData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "System Administrator",
        dateOfBirth: "",
        country: "",
        city: "",
        postalCode: ""
    });

    const [editForm, setEditForm] = useState({ ...adminData });
    
    const [credentialsForm, setCredentialsForm] = useState({
        username: "",
        current_password: "",
        new_password: "",
        new_password_confirmation: ""
    });

    // Fetch admin profile on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/admin/profile');
            const data = await response.json();
            
            if (response.ok) {
                const formattedData = {
                    firstName: data.first_name || "",
                    lastName: data.last_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    role: data.role || "System Administrator",
                    dateOfBirth: data.date_of_birth || "",
                    country: data.country || "",
                    city: data.city || "",
                    postalCode: data.postal_code || ""
                };
                setAdminData(formattedData);
                setEditForm(formattedData);
                setCredentialsForm(prev => ({ ...prev, username: data.username || "" }));
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            showMessage('error', 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditForm({ ...adminData });
        setMessage({ type: '', text: '' });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({ ...adminData });
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: editForm.firstName,
                    last_name: editForm.lastName,
                    email: editForm.email,
                    phone: editForm.phone,
                    date_of_birth: editForm.dateOfBirth,
                    country: editForm.country,
                    city: editForm.city,
                    postal_code: editForm.postalCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                setAdminData({ ...editForm });
                setIsEditing(false);
                showMessage('success', 'Profile updated successfully!');
            } else {
                showMessage('error', data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            showMessage('error', 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleCredentialsChange = (e) => {
        setCredentialsForm({
            ...credentialsForm,
            [e.target.name]: e.target.value
        });
    };

    const handleCredentialsSave = async () => {
        if (!credentialsForm.current_password || !credentialsForm.new_password) {
            showMessage('error', 'Please fill in all password fields');
            return;
        }

        if (credentialsForm.new_password !== credentialsForm.new_password_confirmation) {
            showMessage('error', 'New passwords do not match');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch('/api/admin/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: credentialsForm.username,
                    current_password: credentialsForm.current_password,
                    new_password: credentialsForm.new_password,
                    new_password_confirmation: credentialsForm.new_password_confirmation
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowCredentials(false);
                setCredentialsForm({
                    username: data.username,
                    current_password: "",
                    new_password: "",
                    new_password_confirmation: ""
                });
                showMessage('success', 'Login credentials updated successfully!');
            } else {
                showMessage('error', data.error || 'Failed to update credentials');
            }
        } catch (error) {
            console.error('Error updating credentials:', error);
            showMessage('error', 'Failed to update credentials');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="profile-container">
                    <div className="profile-wrapper">
                        <div style={{ textAlign: 'center', padding: '40px', color: '#183153' }}>
                            Loading profile...
                        </div>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="profile-container">
                <div className="profile-wrapper">
                    {/* Message Alert */}
                    {message.text && (
                        <div className={`profile-alert profile-alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Profile Header Card */}
                    <div className="profile-card profile-header-card">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="8" r="4" stroke="#183153" strokeWidth="2"/>
                                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#183153" strokeWidth="2"/>
                                </svg>
                            </div>
                            <div className="profile-header-info">
                                <h2 className="profile-name">{adminData.firstName} {adminData.lastName}</h2>
                                <p className="profile-role">{adminData.role}</p>
                                <p className="profile-location">{adminData.city}, {adminData.country}</p>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information Card */}
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <h3 className="profile-card-title">Personal Information</h3>
                            {!isEditing ? (
                                <button className="profile-edit-btn" onClick={handleEdit}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px' }}>
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Edit
                                </button>
                            ) : (
                                <div className="profile-edit-actions">
                                    <button className="profile-cancel-btn" onClick={handleCancel}>Cancel</button>
                                    <button className="profile-save-btn" onClick={handleSave}>Save</button>
                                </div>
                            )}
                        </div>
                        
                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <label className="profile-info-label">First Name</label>
                                {!isEditing ? (
                                    <p className="profile-info-value">{adminData.firstName}</p>
                                ) : (
                                    <input 
                                        type="text" 
                                        name="firstName" 
                                        className="profile-input"
                                        value={editForm.firstName}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div className="profile-info-item">
                                <label className="profile-info-label">Last Name</label>
                                {!isEditing ? (
                                    <p className="profile-info-value">{adminData.lastName}</p>
                                ) : (
                                    <input 
                                        type="text" 
                                        name="lastName" 
                                        className="profile-input"
                                        value={editForm.lastName}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div className="profile-info-item">
                                <label className="profile-info-label">Date of Birth</label>
                                {!isEditing ? (
                                    <p className="profile-info-value">{adminData.dateOfBirth}</p>
                                ) : (
                                    <input 
                                        type="text" 
                                        name="dateOfBirth" 
                                        className="profile-input"
                                        value={editForm.dateOfBirth}
                                        onChange={handleChange}
                                        placeholder="DD-MM-YYYY"
                                    />
                                )}
                            </div>

                            <div className="profile-info-item">
                                <label className="profile-info-label">Email Address</label>
                                {!isEditing ? (
                                    <p className="profile-info-value">{adminData.email}</p>
                                ) : (
                                    <input 
                                        type="email" 
                                        name="email" 
                                        className="profile-input"
                                        value={editForm.email}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div className="profile-info-item">
                                <label className="profile-info-label">Phone Number</label>
                                {!isEditing ? (
                                    <p className="profile-info-value">{adminData.phone}</p>
                                ) : (
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        className="profile-input"
                                        value={editForm.phone}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div className="profile-info-item">
                                <label className="profile-info-label">User Role</label>
                                <p className="profile-info-value profile-role-badge">{adminData.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Information Card */}
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <h3 className="profile-card-title">Address</h3>
                        </div>
                        
                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <label className="profile-info-label">Country</label>
                                {!isEditing ? (
                                    <p className="profile-info-value">{adminData.country}</p>
                                ) : (
                                    <input 
                                        type="text" 
                                        name="country" 
                                        className="profile-input"
                                        value={editForm.country}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div className="profile-info-item">
                                <label className="profile-info-label">City</label>
                                {!isEditing ? (
                                    <p className="profile-info-value">{adminData.city}</p>
                                ) : (
                                    <input 
                                        type="text" 
                                        name="city" 
                                        className="profile-input"
                                        value={editForm.city}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>

                            <div className="profile-info-item">
                                <label className="profile-info-label">Postal Code</label>
                                {!isEditing ? (
                                    <p className="profile-info-value">{adminData.postalCode}</p>
                                ) : (
                                    <input 
                                        type="text" 
                                        name="postalCode" 
                                        className="profile-input"
                                        value={editForm.postalCode}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Login Credentials Card */}
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <h3 className="profile-card-title">Login Credentials</h3>
                            {!showCredentials ? (
                                <button className="profile-edit-btn" onClick={() => setShowCredentials(true)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '6px' }}>
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Change Credentials
                                </button>
                            ) : (
                                <div className="profile-edit-actions">
                                    <button className="profile-cancel-btn" onClick={() => {
                                        setShowCredentials(false);
                                        setCredentialsForm(prev => ({
                                            ...prev,
                                            current_password: "",
                                            new_password: "",
                                            new_password_confirmation: ""
                                        }));
                                    }}>Cancel</button>
                                    <button 
                                        className="profile-save-btn" 
                                        onClick={handleCredentialsSave}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {showCredentials ? (
                            <div className="profile-info-grid">
                                <div className="profile-info-item">
                                    <label className="profile-info-label">Username</label>
                                    <input 
                                        type="text" 
                                        name="username" 
                                        className="profile-input"
                                        value={credentialsForm.username}
                                        onChange={handleCredentialsChange}
                                        placeholder="Enter username"
                                    />
                                </div>

                                <div className="profile-info-item">
                                    <label className="profile-info-label">Current Password</label>
                                    <input 
                                        type="password" 
                                        name="current_password" 
                                        className="profile-input"
                                        value={credentialsForm.current_password}
                                        onChange={handleCredentialsChange}
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="profile-info-item">
                                    <label className="profile-info-label">New Password</label>
                                    <input 
                                        type="password" 
                                        name="new_password" 
                                        className="profile-input"
                                        value={credentialsForm.new_password}
                                        onChange={handleCredentialsChange}
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div className="profile-info-item">
                                    <label className="profile-info-label">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        name="new_password_confirmation" 
                                        className="profile-input"
                                        value={credentialsForm.new_password_confirmation}
                                        onChange={handleCredentialsChange}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="profile-credentials-info">
                                <p className="profile-info-text">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ verticalAlign: 'middle', marginRight: '8px' }}>
                                        <circle cx="12" cy="12" r="10" stroke="#4e8cff" strokeWidth="2"/>
                                        <path d="M12 16v-4M12 8h.01" stroke="#4e8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Your login username is: <strong>{credentialsForm.username}</strong>
                                </p>
                                <p className="profile-info-text" style={{ marginTop: '12px', color: '#6c757d', fontSize: '14px' }}>
                                    Click "Change Credentials" to update your username and password.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
