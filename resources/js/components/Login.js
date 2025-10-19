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
        <div className="home-bg">
            <div className="home-card">
                <div className="home-card-topbar"></div>
                <div className="home-card-content">
                    <div className="home-card-icon">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4" stroke="#000" strokeWidth="2"/>
                            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h2 className="home-card-title">Admin LogIn</h2>
                    <hr className="home-card-hr" />
                    <div className="home-card-welcome">Welcome!</div>
                    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                        <div className="form-group">
                            <label htmlFor="username">Admin Email ID</label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
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
                        <div style={{ textAlign: "right", width: "100%", marginBottom: "18px", fontSize: "0.9rem", color: "#666" }}>
                            <a href="#" style={{ color: "#666", textDecoration: "none" }}>Forgot Password?</a>
                        </div>
                        {error && (
                            <div style={{
                                color: "red",
                                marginBottom: "10px",
                                fontSize: "0.9rem",
                                textAlign: "center",
                                width: "100%"
                            }}>
                                {error}
                            </div>
                        )}
                        <button className="home-card-btn" type="submit">LogIn</button>
                    </form>
                </div>
            </div>
        </div>
    );
}