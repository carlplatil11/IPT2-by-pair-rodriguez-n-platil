import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store admin info in localStorage
                localStorage.setItem('adminUser', JSON.stringify(data.admin));
                navigate("/dashboard");
            } else {
                setError(data.error || "Invalid username or password.");
            }
        } catch (error) {
            console.error('Login error:', error);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="home-bg">
            <div className="home-card">
                <div className="home-card-topbar"></div>
                <div className="home-card-content">
                    <div className="home-card-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4" stroke="#183153" strokeWidth="2"/>
                            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#183153" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2 className="home-card-title">Admin Login</h2>
                    <p className="home-card-subtitle">Enter your credentials to continue</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        
                        <div className="forgot-password-link">
                            <a href="#">Forgot Password?</a>
                        </div>
                        
                        {error && (
                            <div className="error-message">
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
                            disabled={loading}
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    
                    <p className="login-note">
                        Default credentials: <strong>admin / admin</strong><br/>
                        <span>You can change these in your Profile settings</span>
                    </p>
                </div>
            </div>
        </div>
    );
}