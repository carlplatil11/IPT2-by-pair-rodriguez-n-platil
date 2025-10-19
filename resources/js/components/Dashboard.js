import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function SimpleBarChart({ data = [], labelKey = "label", valueKey = "value", height = 240 }) {
    if (!data || data.length === 0) return <div className="empty-chart">No data</div>;

    const max = Math.max(...data.map(d => d[valueKey]));

    return (
        <div className="simple-bar-chart" style={{ height }}>
            {data.map((d, i) => {
                const pct = max > 0 ? (d[valueKey] / max) * 100 : 0;
                return (
                    <div className="bar-row" key={i}>
                        <div className="bar-label">{d[labelKey]}</div>
                        <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${pct}%` }} title={`${d[valueKey]}`}></div>
                        </div>
                        <div className="bar-value">{d[valueKey]}</div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [totals, setTotals] = useState({ students: null, faculty: null });
    const [studentsByCourse, setStudentsByCourse] = useState([]);
    const [facultyByDept, setFacultyByDept] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        navigate("/login");
    };

    useEffect(() => {
        // Try sensible endpoints; if they don't exist, use mocked sample data
        const statsUrl = "/api/stats/totals";
        const studentsByCourseUrl = "/api/stats/students-by-course";
        const facultyByDeptUrl = "/api/stats/faculty-by-department";

        let mounted = true;

        async function fetchData() {
            try {
                const [tRes, sRes, fRes] = await Promise.allSettled([
                    fetch(statsUrl),
                    fetch(studentsByCourseUrl),
                    fetch(facultyByDeptUrl),
                ]);

                if (!mounted) return;

                // Totals
                if (tRes.status === "fulfilled" && tRes.value.ok) {
                    const json = await tRes.value.json();
                    setTotals({ students: json.students ?? json.total_students ?? json.students_count ?? null, faculty: json.faculty ?? json.total_faculty ?? json.faculty_count ?? null });
                } else {
                    // fallback sample
                    setTotals({ students: 124684, faculty: 12379 });
                }

                // Students per course
                if (sRes.status === "fulfilled" && sRes.value.ok) {
                    const json = await sRes.value.json();
                    // expect [{ course_id, course_name, count }]
                    const transformed = json.map(item => ({ label: item.course_name || item.label || `Course ${item.course_id}`, value: item.count || item.value || 0 }));
                    setStudentsByCourse(transformed);
                } else {
                    setStudentsByCourse([
                        { label: "BS Computer Science", value: 450 },
                        { label: "BS Information Technology", value: 320 },
                        { label: "BS Mathematics", value: 210 },
                        { label: "BS Psychology", value: 180 },
                    ]);
                }

                // Faculty per department
                if (fRes.status === "fulfilled" && fRes.value.ok) {
                    const json = await fRes.value.json();
                    const transformed = json.map(item => ({ label: item.department_name || item.label || `Dept ${item.department_id}`, value: item.count || item.value || 0 }));
                    setFacultyByDept(transformed);
                } else {
                    setFacultyByDept([
                        { label: "Computer Science", value: 18 },
                        { label: "Mathematics", value: 9 },
                        { label: "Humanities", value: 12 },
                        { label: "Business", value: 6 },
                    ]);
                }
            } catch (err) {
                // generic fallback
                if (mounted) {
                    setTotals({ students: 124684, faculty: 12379 });
                    setStudentsByCourse([
                        { label: "BS Computer Science", value: 450 },
                        { label: "BS Information Technology", value: 320 },
                    ]);
                    setFacultyByDept([
                        { label: "Computer Science", value: 18 },
                        { label: "Mathematics", value: 9 },
                    ]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchData();

        return () => { mounted = false; };
    }, []);

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
                        <div className="card-value" style={{ color: "#25406b" }}>{loading ? '—' : (totals.students ?? '—')}</div>
                        <div className="card-label">Students</div>
                    </div>
                    <div className="dashboard-card teachers">
                        <div className="card-change" style={{ color: "#ff6f61" }}>↓ 3%</div>
                        <div className="card-value" style={{ color: "#ff6f61" }}>{loading ? '—' : (totals.faculty ?? '—')}</div>
                        <div className="card-label">Faculty</div>
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
                        <div style={{ fontWeight: 600, marginBottom: "16px" }}>Students per Course</div>
                        <SimpleBarChart data={studentsByCourse} labelKey="label" valueKey="value" height={260} />
                    </div>
                    <div className="dashboard-students">
                        <div style={{ fontWeight: 600, marginBottom: "16px" }}>Faculty per Department</div>
                        <SimpleBarChart data={facultyByDept} labelKey="label" valueKey="value" height={260} />
                        <div className="students-label">Counts are grouped by department</div>
                    </div>
                </div>
            </main>
        </div>
    );
}