import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
    const [stats, setStats] = useState({
        students: 0,
        faculty: 0,
        courses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/stats/totals');
            const data = await response.json();
            setStats({
                students: data.students || 0,
                faculty: data.faculty || 0,
                courses: data.courses || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K+';
        }
        return num.toString();
    };

    return (
        <div className="home-bg">
            <div className="home-card">
                <div className="home-card-topbar"></div>
                <div className="home-card-content">
                    <div className="home-card-icon">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                            <path d="M12 14l9-5-9-5-9 5 9 5z" stroke="#183153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke="#183153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h2 className="home-card-title">EduManage</h2>
                    <p className="home-card-subtitle">Faculty and Student Management System</p>
                    <hr className="home-card-hr" />
                    <div className="home-card-welcome">Welcome to EduManage! 👋</div>
                    <p className="home-card-description">
                        Streamline your educational institution's operations with our comprehensive management platform.
                    </p>
                    <Link className="home-card-btn" to="/login">
                        Get Started
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </Link>
                    
                    <div className="home-card-stats">
                        <div className="stat-item">
                            <div className="stat-label">Students</div>
                            <div className="stat-value">
                                {loading ? '...' : formatNumber(stats.students)}
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Faculty</div>
                            <div className="stat-value">
                                {loading ? '...' : formatNumber(stats.faculty)}
                            </div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Courses</div>
                            <div className="stat-value">
                                {loading ? '...' : formatNumber(stats.courses)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}