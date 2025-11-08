import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

// API Cache utility - same as in Student.js
const apiCache = {
    cache: new Map(),
    pendingRequests: new Map(),
    
    async fetch(url, ttl = 60000) {
        const now = Date.now();
        const cached = this.cache.get(url);
        
        // Return cached data if still valid
        if (cached && (now - cached.timestamp) < ttl) {
            return cached.data;
        }
        
        // If there's already a pending request for this URL, wait for it
        if (this.pendingRequests.has(url)) {
            return this.pendingRequests.get(url);
        }
        
        // Make new request
        const promise = fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then(data => {
                this.cache.set(url, { data, timestamp: now });
                this.pendingRequests.delete(url);
                return data;
            })
            .catch(err => {
                this.pendingRequests.delete(url);
                throw err;
            });
        
        this.pendingRequests.set(url, promise);
        return promise;
    },
    
    clear(url) {
        if (url) {
            this.cache.delete(url);
        } else {
            this.cache.clear();
        }
    }
};

function SimpleBarChart({ data = [], labelKey = "label", valueKey = "value", height = 240 }) {
    if (!data || data.length === 0) return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: height,
            color: '#9ca3af',
            fontSize: 14,
            fontStyle: 'italic'
        }}>
            No data available
        </div>
    );

    const max = Math.max(...data.map(d => d[valueKey]));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 0' }}>
            {data.map((d, i) => {
                const pct = max > 0 ? (d[valueKey] / max) * 100 : 0;
                return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ 
                            minWidth: 100, 
                            fontSize: 14, 
                            color: '#1f2937',
                            fontWeight: 600,
                            textAlign: 'right'
                        }}>
                            {d[labelKey]}
                        </div>
                        <div style={{ 
                            flex: 1, 
                            background: '#f1f5f9', 
                            borderRadius: 8,
                            height: 36,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ 
                                width: `${pct}%`, 
                                background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                                height: '100%',
                                borderRadius: 8,
                                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: pct > 15 ? 'flex-end' : 'flex-start',
                                paddingLeft: pct <= 15 ? 8 : 0,
                                paddingRight: pct > 15 ? 12 : 0,
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                            }}>
                                <span style={{ 
                                    color: pct > 15 ? 'white' : '#3b82f6', 
                                    fontSize: 13, 
                                    fontWeight: 700,
                                    textShadow: pct > 15 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                                }}>
                                    {d[valueKey]}
                                </span>
                            </div>
                        </div>
                        <div style={{ 
                            minWidth: 50, 
                            fontSize: 15, 
                            color: '#3b82f6',
                            fontWeight: 700,
                            textAlign: 'right'
                        }}>
                            {d[valueKey]}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function SimplePieChart({ data = [], labelKey = "label", valueKey = "value", height = 300 }) {
    if (!data || data.length === 0) return (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: height,
            color: '#9ca3af',
            fontSize: 14,
            fontStyle: 'italic'
        }}>
            No data available
        </div>
    );

    const total = data.reduce((sum, d) => sum + d[valueKey], 0);
    
    // Enhanced color palette with better contrast
    const colors = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#84cc16', // lime
    ];

    let currentAngle = -90; // Start at top
    const radius = 100;
    const centerX = 120;
    const centerY = 120;

    const slices = data.map((d, i) => {
        const value = d[valueKey];
        const percentage = total > 0 ? (value / total) * 100 : 0;
        const sliceAngle = (value / total) * 360;
        
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;
        
        currentAngle = endAngle;

        // Calculate path for pie slice
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);
        
        const largeArc = sliceAngle > 180 ? 1 : 0;
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        return {
            path: pathData,
            color: colors[i % colors.length],
            label: d[labelKey],
            value: value,
            percentage: percentage.toFixed(1)
        };
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <svg width="260" height="260" viewBox="0 0 260 260" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                {slices.map((slice, i) => (
                    <g key={i}>
                        <path
                            d={slice.path}
                            fill={slice.color}
                            stroke="white"
                            strokeWidth="3"
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transformOrigin: '120px 120px'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.opacity = '0.85';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.opacity = '1';
                                e.target.style.transform = 'scale(1)';
                            }}
                        />
                    </g>
                ))}
                {/* Center circle for donut effect */}
                <circle 
                    cx="120" 
                    cy="120" 
                    r="50" 
                    fill="#f8fafc"
                    stroke="white"
                    strokeWidth="2"
                />
                <text
                    x="120"
                    y="120"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        fill: '#1f2937'
                    }}
                >
                    {total}
                </text>
                <text
                    x="120"
                    y="140"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                        fontSize: '12px',
                        fill: '#6b7280'
                    }}
                >
                    Total
                </text>
            </svg>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 450, padding: '0 16px' }}>
                {slices.map((slice, i) => (
                    <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        padding: '6px 12px',
                        background: '#f8fafc',
                        borderRadius: 8,
                        border: '1px solid #e5e7eb'
                    }}>
                        <div style={{ 
                            width: 14, 
                            height: 14, 
                            borderRadius: 3,
                            background: slice.color,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                        <div style={{ fontSize: 13, color: '#374151' }}>
                            <span style={{ fontWeight: 700 }}>{slice.label}</span>
                            <span style={{ color: '#6b7280', marginLeft: 6, fontWeight: 600 }}>({slice.value})</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [totals, setTotals] = useState({ students: null, faculty: null });
    const [studentsByCourse, setStudentsByCourse] = useState([]);
    const [facultyByDept, setFacultyByDept] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            // Only fetch if the document is visible (tab is active)
            if (document.hidden) return;
            
            try {
                // Use apiCache with 2-minute TTL for dashboard stats
                const [totalsData, studentsCourseData, facultyDeptData] = await Promise.allSettled([
                    apiCache.fetch('/api/stats/totals', 120000),
                    apiCache.fetch('/api/stats/students-by-course', 120000),
                    apiCache.fetch('/api/stats/faculty-by-department', 120000),
                ]);

                if (!mounted) return;

                // Totals
                if (totalsData.status === "fulfilled") {
                    const json = totalsData.value;
                    setTotals({ 
                        students: json.students ?? json.total_students ?? 0, 
                        faculty: json.faculty ?? json.total_faculty ?? 0 
                    });
                } else {
                    setTotals({ students: 0, faculty: 0 });
                }

                // Students per course
                if (studentsCourseData.status === "fulfilled") {
                    const json = studentsCourseData.value;
                    setStudentsByCourse(Array.isArray(json) ? json : []);
                } else {
                    setStudentsByCourse([]);
                }

                // Faculty per department
                if (facultyDeptData.status === "fulfilled") {
                    const json = facultyDeptData.value;
                    setFacultyByDept(Array.isArray(json) ? json : []);
                } else {
                    setFacultyByDept([]);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                if (mounted) {
                    setTotals({ students: 0, faculty: 0 });
                    setStudentsByCourse([]);
                    setFacultyByDept([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchData();
        
        // Refresh dashboard every 10 minutes to reflect archive/restore changes
        // Combined with 2-minute cache TTL, this prevents excessive API calls
        const interval = setInterval(() => {
            if (mounted && !document.hidden) fetchData();
        }, 600000); // 10 minutes

        // Also refresh when tab becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden && mounted) {
                fetchData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => { 
            mounted = false;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                {/* Modern Header Section */}
                <div style={{ 
                    padding: '32px 40px', 
                    borderBottom: '2px solid #e5e7eb',
                    background: 'linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: 0 }}>Dashboard</h1>
                    </div>
                    <p style={{ fontSize: 15, color: '#6b7280', margin: 0, marginLeft: 44 }}>
                        Overview of students and faculty statistics
                    </p>
                </div>

                <div style={{ padding: '32px 40px', background: '#f8fafc' }}>
                    {/* Top Metrics - Two Cards Side by Side */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, marginBottom: 36 }}>
                        {/* Total Faculty Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                            borderRadius: 20,
                            padding: '36px',
                            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 15px 35px rgba(16, 185, 129, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.4)';
                        }}>
                            {/* Background decoration */}
                            <div style={{
                                position: 'absolute',
                                top: -20,
                                right: -20,
                                width: 140,
                                height: 140,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                filter: 'blur(40px)'
                            }} />
                            <div style={{ 
                                position: 'absolute', 
                                top: 24, 
                                right: 24,
                                width: 56,
                                height: 56,
                                background: 'rgba(255, 255, 255, 0.25)',
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div style={{ fontSize: 15, opacity: 0.95, marginBottom: 12, fontWeight: 600, letterSpacing: '0.5px' }}>
                                TOTAL FACULTY
                            </div>
                            <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 12, lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {loading ? '—' : (totals.faculty ?? 0)}
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>Active faculty members</div>
                        </div>

                        {/* Total Students Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            borderRadius: 20,
                            padding: '36px',
                            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.4)',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.4)';
                        }}>
                            {/* Background decoration */}
                            <div style={{
                                position: 'absolute',
                                top: -20,
                                right: -20,
                                width: 140,
                                height: 140,
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                filter: 'blur(40px)'
                            }} />
                            <div style={{ 
                                position: 'absolute', 
                                top: 24, 
                                right: 24,
                                width: 56,
                                height: 56,
                                background: 'rgba(255, 255, 255, 0.25)',
                                borderRadius: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <div style={{ fontSize: 15, opacity: 0.95, marginBottom: 12, fontWeight: 600, letterSpacing: '0.5px' }}>
                                TOTAL STUDENTS
                            </div>
                            <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 12, lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {loading ? '—' : (totals.students ?? 0)}
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 500 }}>Active students enrolled</div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 28 }}>
                        {/* Bar Chart - Students per Course */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: 20,
                            padding: '32px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '1px solid #e5e7eb',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        }}>
                            <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: '2px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                    }} />
                                    <div style={{ fontWeight: 800, fontSize: 20, color: '#111827' }}>
                                        Students per Course
                                    </div>
                                </div>
                                <div style={{ fontSize: 13, color: '#6b7280', marginLeft: 20 }}>
                                    Distribution of students across courses
                                </div>
                            </div>
                            <SimpleBarChart data={studentsByCourse} labelKey="label" valueKey="value" height={300} />
                        </div>

                        {/* Pie Chart - Faculty per Department */}
                        <div style={{
                            background: '#ffffff',
                            borderRadius: 20,
                            padding: '32px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '1px solid #e5e7eb',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        }}>
                            <div style={{ marginBottom: 28, paddingBottom: 16, borderBottom: '2px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                    <div style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    }} />
                                    <div style={{ fontWeight: 800, fontSize: 20, color: '#111827' }}>
                                        Faculty per Department
                                    </div>
                                </div>
                                <div style={{ fontSize: 13, color: '#6b7280', marginLeft: 20 }}>
                                    Distribution of faculty across departments
                                </div>
                            </div>
                            <SimplePieChart data={facultyByDept} labelKey="label" valueKey="value" height={300} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}