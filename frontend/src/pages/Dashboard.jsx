import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUsers, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineArrowRight } from 'react-icons/hi';
import { getDashboardSummary, getEmployees } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [summaryRes, employeesRes] = await Promise.all([
                getDashboardSummary(),
                getEmployees(),
            ]);
            setSummary(summaryRes.data);
            setEmployees(employeesRes.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return <LoadingSpinner message="Loading dashboard..." />;
    if (error) return <ErrorState message={error} onRetry={fetchData} />;

    return (
        <div className="fade-in">
            {/* Admin Welcome Banner */}
            <div className="admin-welcome-banner">
                <div className="admin-welcome-left">
                    <div className="admin-avatar">A</div>
                    <div>
                        <h2>Welcome back, Admin</h2>
                        <p>Here's what's happening with your team today</p>
                    </div>
                </div>
                <div className="admin-welcome-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/employees')}>
                        <HiOutlineUsers /> Manage Employees
                    </button>
                    <button className="btn btn-success" onClick={() => navigate('/attendance')}>
                        <HiOutlineCheckCircle /> Mark Attendance
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card blue" onClick={() => navigate('/employees')} style={{ cursor: 'pointer' }}>
                    <div className="stat-icon blue"><HiOutlineUsers /></div>
                    <div className="stat-info">
                        <h3>{summary.total_employees}</h3>
                        <p>Total Employees</p>
                    </div>
                </div>
                <div className="stat-card green">
                    <div className="stat-icon green"><HiOutlineCheckCircle /></div>
                    <div className="stat-info">
                        <h3>{summary.present_today}</h3>
                        <p>Present Today</p>
                    </div>
                </div>
                <div className="stat-card red">
                    <div className="stat-icon red"><HiOutlineXCircle /></div>
                    <div className="stat-info">
                        <h3>{summary.absent_today}</h3>
                        <p>Absent Today</p>
                    </div>
                </div>
                <div className="stat-card orange">
                    <div className="stat-icon orange"><HiOutlineClock /></div>
                    <div className="stat-info">
                        <h3>{summary.not_marked_today}</h3>
                        <p>Not Marked</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-grid">
                <div className="quick-action-card" onClick={() => navigate('/employees')}>
                    <div className="quick-action-icon blue-bg"><HiOutlineUsers /></div>
                    <div>
                        <h4>Employee Management</h4>
                        <p>Add, view, search and delete employee records</p>
                    </div>
                    <HiOutlineArrowRight className="quick-action-arrow" />
                </div>
                <div className="quick-action-card" onClick={() => navigate('/attendance')}>
                    <div className="quick-action-icon green-bg"><HiOutlineCheckCircle /></div>
                    <div>
                        <h4>Attendance Management</h4>
                        <p>Mark daily attendance and view records with date filters</p>
                    </div>
                    <HiOutlineArrowRight className="quick-action-arrow" />
                </div>
            </div>

            {/* Employee Summary Table */}
            <div className="table-container">
                <div className="table-header">
                    <h3>Employee Attendance Summary</h3>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/employees')}>
                        View All <HiOutlineArrowRight />
                    </button>
                </div>
                {employees.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px' }}>
                        <div className="empty-state-icon">👥</div>
                        <h4>No Employees Registered</h4>
                        <p style={{ color: 'var(--text-muted)' }}>Start by adding employees to manage attendance</p>
                        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/employees')}>
                            Add First Employee
                        </button>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Present Days</th>
                                <th>Absent Days</th>
                                <th>Attendance Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => {
                                const total = emp.total_present + emp.total_absent;
                                const rate = total > 0 ? Math.round((emp.total_present / total) * 100) : 0;
                                return (
                                    <tr key={emp.employee_id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{emp.employee_id}</td>
                                        <td style={{ color: 'var(--text-primary)' }}>{emp.full_name}</td>
                                        <td>{emp.email}</td>
                                        <td><span className="badge department">{emp.department}</span></td>
                                        <td><span className="mini-badge present">&#10003; {emp.total_present}</span></td>
                                        <td><span className="mini-badge absent">&#10007; {emp.total_absent}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    flex: 1,
                                                    height: 6,
                                                    background: 'rgba(255,255,255,0.05)',
                                                    borderRadius: 3,
                                                    maxWidth: 100,
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${rate}%`,
                                                        height: '100%',
                                                        background: rate >= 75 ? 'var(--accent-green)' : rate >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)',
                                                        borderRadius: 3,
                                                        transition: 'width 0.5s ease'
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: rate >= 75 ? 'var(--accent-green)' : rate >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>
                                                    {total > 0 ? `${rate}%` : '--'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
