import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <Navbar />
            <main className="dashboard-main">
                <div className="dashboard-header">
                    <button className="logout-btn" onClick={handleLogout}>Log out</button>
                </div>
                <h2 className="dashboard-title">Welcome to your dashboard</h2>
                <div className="dashboard-record-buttons">
                    <button>STUDENT RECORD</button>
                    <button>FACULTY RECORD</button>
                </div>
                <div className="dashboard-cards">
                    <div className="dashboard-card">
                        <div className="card-change" style={{ color: "#1bc47d" }}>↑ 15%</div>
                        <div className="card-value" style={{ color: "#25406b" }}>124,684</div>
                        <div className="card-label">Students</div>
                    </div>
                    <div className="dashboard-card teachers">
                        <div className="card-change" style={{ color: "#ff6f61" }}>↓ 3%</div>
                        <div className="card-value" style={{ color: "#ff6f61" }}>12,379</div>
                        <div className="card-label">Teachers</div>
                    </div>
                    <div className="dashboard-card staffs">
                        <div className="card-change" style={{ color: "#4e8cff" }}>↑ 1%</div>
                        <div className="card-value" style={{ color: "#4e8cff" }}>29,300</div>
                        <div className="card-label">Staffs</div>
                    </div>
                    <div className="dashboard-card awards">
                        <div className="card-change" style={{ color: "#fbc02d" }}>↑ 7%</div>
                        <div className="card-value" style={{ color: "#fbc02d" }}>95,800</div>
                        <div className="card-label">Awards</div>
                    </div>
                </div>
                <div className="dashboard-charts">
                    <div className="dashboard-fees">
                        <div style={{ fontWeight: 600, marginBottom: "16px" }}>Fees Collection</div>
                        <div className="chart-placeholder">
                            [Chart Placeholder]
                        </div>
                    </div>
                    <div className="dashboard-students">
                        <div style={{ fontWeight: 600, marginBottom: "16px" }}>Students</div>
                        <div className="pie-placeholder">
                            45,414
                        </div>
                        <div className="students-label">40,270 last year</div>
                    </div>
                </div>
            </main>
        </div>
    );
}