import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="home-bg" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div className="home-card" style={{ 
                maxWidth: 520,
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                animation: 'fadeIn 0.6s ease-out'
            }}>
                <div className="home-card-topbar" style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    height: 8
                }}></div>
                <div className="home-card-content" style={{ padding: '48px 40px' }}>
                    <div className="home-card-icon" style={{ marginBottom: 24 }}>
                        <div style={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)'
                        }}>
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <h2 className="home-card-title" style={{ 
                        fontSize: 26, 
                        fontWeight: 700, 
                        marginBottom: 12,
                        color: '#111827',
                        lineHeight: 1.3
                    }}>
                        EduManage
                    </h2>
                    <p style={{
                        fontSize: 15,
                        color: '#6b7280',
                        marginBottom: 32,
                        lineHeight: 1.6,
                        maxWidth: 400,
                        margin: '0 auto 32px'
                    }}>
                        Faculty and Student Management System
                    </p>
                    <hr className="home-card-hr" style={{ 
                        border: 'none',
                        borderTop: '1px solid #e5e7eb',
                        margin: '0 0 32px 0'
                    }} />
                    <div className="home-card-welcome" style={{ 
                        fontSize: 18,
                        fontWeight: 600,
                        marginBottom: 28,
                        color: '#374151'
                    }}>
                        Welcome to EduManage! 👋
                    </div>
                    <p style={{
                        fontSize: 14,
                        color: '#6b7280',
                        marginBottom: 32,
                        lineHeight: 1.6
                    }}>
                        Streamline your educational institution's operations with our comprehensive management platform.
                    </p>
                    <Link 
                        className="home-card-btn" 
                        to="/login"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '14px 32px',
                            borderRadius: 8,
                            fontSize: 15,
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseLeave={e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        Get Started
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </Link>
                    
                    <div style={{
                        marginTop: 40,
                        paddingTop: 24,
                        borderTop: '1px solid #e5e7eb',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 16,
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Students</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#667eea' }}>15K+</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Faculty</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#764ba2' }}>1.2K+</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Courses</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#667eea' }}>200+</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}