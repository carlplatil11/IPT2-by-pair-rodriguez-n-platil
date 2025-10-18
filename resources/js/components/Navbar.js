import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
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
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/faculty" className={({ isActive }) => isActive ? "active" : ""}>Faculty</NavLink>
                    </li>
                    <li>
                        <NavLink to="/student" className={({ isActive }) => isActive ? "active" : ""}>Students/Classes</NavLink>
                    </li>
                    <li>
                        <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>Settings and profile</NavLink>
                    </li>
                    <li>
                        <NavLink to="/department" className={({ isActive }) => isActive ? "active" : ""}>Department</NavLink>
                    </li>
                    <li>
                        <NavLink to="/courses" className={({ isActive }) => isActive ? "active" : ""}>Courses</NavLink>
                    </li>
                </ul>
            </nav>
            <div className="navbar-features">
                <span>Features</span>
                <span className="navbar-new-badge">NEW</span>
            </div>
        </aside>
    );
}