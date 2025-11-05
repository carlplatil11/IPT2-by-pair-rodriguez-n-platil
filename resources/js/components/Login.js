import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username === "admin" && password === "admin") {
            setError("");
            // alert("Login successful!");
            navigate("/dashboard"); // Redirect to dashboard
        } else {
            setError("Invalid username or password.");
        }
    };

    return (
        <div className="home-bg" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh'
        }}>
            <div className="home-card" style={{ 
                maxWidth: 440,
                width: '100%',
                margin: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
                <div className="home-card-topbar" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
                <div className="home-card-content" style={{ padding: '40px 32px' }}>
                    <div className="home-card-icon" style={{ marginBottom: 20 }}>
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto',
                            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
                                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                        </div>
                    </div>
                    <h2 className="home-card-title" style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Admin Login</h2>
                    <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>Enter your credentials to continue</p>
                    
                    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label htmlFor="username" style={{ 
                                display: 'block', 
                                marginBottom: 8, 
                                fontSize: 14, 
                                fontWeight: 600,
                                color: '#374151' 
                            }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    left: 12, 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="admin@edumanage.com"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 42px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#667eea'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                        </div>
                        
                        <div className="form-group" style={{ marginBottom: 16 }}>
                            <label htmlFor="password" style={{ 
                                display: 'block', 
                                marginBottom: 8, 
                                fontSize: 14, 
                                fontWeight: 600,
                                color: '#374151' 
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ 
                                    position: 'absolute', 
                                    left: 12, 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 42px',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#667eea'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                        </div>
                        
                        <div style={{ textAlign: "right", width: "100%", marginBottom: 24 }}>
                            <a href="#" style={{ 
                                color: '#667eea', 
                                textDecoration: 'none',
                                fontSize: 13,
                                fontWeight: 500
                            }}>
                                Forgot Password?
                            </a>
                        </div>
                        
                        {error && (
                            <div style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                marginBottom: 20,
                                padding: '12px 16px',
                                borderRadius: 8,
                                fontSize: 14,
                                textAlign: 'left',
                                border: '1px solid #fecaca',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}
                        
                        <button 
                            className="home-card-btn" 
                            type="submit"
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                width: '100%',
                                padding: '14px',
                                border: 'none',
                                borderRadius: 8,
                                color: 'white',
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            Sign In
                        </button>
                    </form>
                    
                    <p style={{ 
                        marginTop: 24, 
                        fontSize: 13, 
                        color: '#6b7280',
                        textAlign: 'center'
                    }}>
                        Default credentials: <strong>admin / admin</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}