import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="home-bg">
            <div className="home-card">
                <div className="home-card-topbar"></div>
                <div className="home-card-content">
                    <div className="home-card-icon">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="6" stroke="#222" strokeWidth="2"/>
                            <path d="M4 20c0-4 4-7 8-7s8 3 8 7" stroke="#222" strokeWidth="2"/>
                        </svg>
                    </div>
                    <h2 className="home-card-title">Faculty and Student Management System</h2>
                    <hr className="home-card-hr" />
                    <div className="home-card-welcome">Welcome!</div>
                    <Link className="home-card-btn" to="/login">Continue</Link>
                </div>
            </div>
        </div>
    );
}