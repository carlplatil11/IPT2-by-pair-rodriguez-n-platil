import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear any stored admin data
        localStorage.removeItem('adminUser');
        // Redirect to login page
        navigate('/login');
    };

    return (
        <aside className="navbar-sidebar">
            <div className="navbar-avatar">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="#183153" strokeWidth="2"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#183153" strokeWidth="2"/>
                </svg>
                <div className="navbar-admin-label">Admin</div>
            </div>
            <nav className="navbar-nav">
                <ul>
                    <li>
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/faculty" className={({ isActive }) => isActive ? "active" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Faculty
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/student" className={({ isActive }) => isActive ? "active" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Students
                        </NavLink>  
                    </li>
                    <li>
                        <NavLink to="/department" className={({ isActive }) => isActive ? "active" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Departments
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/courses" className={({ isActive }) => isActive ? "active" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Courses
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Settings
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <div className="navbar-bottom">
                <nav className="navbar-nav-bottom">
                    <ul>
                        <li>
                            <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                                Profile
                            </NavLink>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="navbar-logout">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Logout
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}