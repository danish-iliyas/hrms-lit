import { useState, useEffect } from 'react';
import { HiOutlineCheckCircle, HiOutlineFilter } from 'react-icons/hi';
import { getEmployees, getAttendance, markAttendance } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

function Attendance() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mark Attendance
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [markForm, setMarkForm] = useState({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' });
    const [markError, setMarkError] = useState('');
    const [marking, setMarking] = useState(false);

    // View Attendance
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceError, setAttendanceError] = useState(null);

    // Filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getEmployees();
            setEmployees(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const fetchAttendance = async (empId) => {
        if (!empId) {
            setAttendanceRecords([]);
            return;
        }
        setAttendanceLoading(true);
        setAttendanceError(null);
        try {
            const res = await getAttendance(empId, dateFrom || null, dateTo || null);
            setAttendanceRecords(res.data);
        } catch (err) {
            setAttendanceError(err.response?.data?.detail || 'Failed to load attendance');
        } finally {
            setAttendanceLoading(false);
        }
    };

    useEffect(() => {
        if (selectedEmployee) {
            fetchAttendance(selectedEmployee);
        }
    }, [selectedEmployee, dateFrom, dateTo]);

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        setMarkError('');

        if (!markForm.employee_id || !markForm.date || !markForm.status) {
            setMarkError('All fields are required');
            return;
        }

        setMarking(true);
        try {
            await markAttendance(markForm);
            toast.success('Attendance marked successfully!');
            setShowMarkModal(false);
            setMarkForm({ employee_id: '', date: new Date().toISOString().split('T')[0], status: 'Present' });
            // Refresh if viewing the same employee
            if (selectedEmployee === markForm.employee_id) {
                fetchAttendance(selectedEmployee);
            }
            fetchEmployees();
        } catch (err) {
            setMarkError(err.response?.data?.detail || 'Failed to mark attendance');
        } finally {
            setMarking(false);
        }
    };

    const presentCount = attendanceRecords.filter(r => r.status === 'Present').length;
    const absentCount = attendanceRecords.filter(r => r.status === 'Absent').length;

    if (loading) return <LoadingSpinner message="Loading attendance..." />;
    if (error) return <ErrorState message={error} onRetry={fetchEmployees} />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>Attendance Management</h2>
                <p>Mark and view daily attendance records</p>
            </div>

            {/* Top Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
                <div className="filter-bar">
                    <select
                        className="form-control"
                        style={{color:"black",minWidth: 220}}
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                    
                    >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                            <option key={emp.employee_id} value={emp.employee_id}>
                                {emp.full_name} ({emp.employee_id})
                            </option>
                        ))}
                    </select>

                    {selectedEmployee && (
                        <>
                            <input
                                type="date"
                                className="form-control"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                placeholder="From"
                                title="Filter from date"
                            />
                            <input
                                type="date"
                                className="form-control"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                placeholder="To"
                                title="Filter to date"
                            />
                            {(dateFrom || dateTo) && (
                                <button className="btn btn-outline btn-sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                                    Clear Filters
                                </button>
                            )}
                        </>
                    )}
                </div>

                <button className="btn btn-success" onClick={() => setShowMarkModal(true)}>
                    <HiOutlineCheckCircle /> Mark Attendance
                </button>
            </div>

            {/* Summary Cards when employee selected */}
            {selectedEmployee && attendanceRecords.length > 0 && (
                <div className="stats-grid" style={{ marginBottom: 24 }}>
                    <div className="stat-card green">
                        <div className="stat-icon green"><HiOutlineCheckCircle /></div>
                        <div className="stat-info">
                            <h3>{presentCount}</h3>
                            <p>Present Days</p>
                        </div>
                    </div>
                    <div className="stat-card red">
                        <div className="stat-icon red">✕</div>
                        <div className="stat-info">
                            <h3>{absentCount}</h3>
                            <p>Absent Days</p>
                        </div>
                    </div>
                    <div className="stat-card blue">
                        <div className="stat-icon blue"><HiOutlineFilter /></div>
                        <div className="stat-info">
                            <h3>{presentCount + absentCount}</h3>
                            <p>Total Records</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Table */}
            {!selectedEmployee ? (
                <div className="table-container">
                    <EmptyState
                        icon="📋"
                        title="Select an Employee"
                        message="Choose an employee from the dropdown above to view their attendance records"
                    />
                </div>
            ) : attendanceLoading ? (
                <LoadingSpinner message="Loading attendance records..." />
            ) : attendanceError ? (
                <ErrorState message={attendanceError} onRetry={() => fetchAttendance(selectedEmployee)} />
            ) : attendanceRecords.length === 0 ? (
                <div className="table-container">
                    <EmptyState
                        icon="📅"
                        title="No Attendance Records"
                        message={`No attendance records found${dateFrom || dateTo ? ' for the selected date range' : ''}. Mark attendance to get started.`}
                        action={
                            <button className="btn btn-success" onClick={() => {
                                setMarkForm({ ...markForm, employee_id: selectedEmployee });
                                setShowMarkModal(true);
                            }}>
                                <HiOutlineCheckCircle /> Mark Attendance
                            </button>
                        }
                    />
                </div>
            ) : (
                <div className="table-container">
                    <div className="table-header">
                        <h3>Attendance Records — {employees.find(e => e.employee_id === selectedEmployee)?.full_name}</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Day</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.map((record, idx) => {
                                const dateObj = new Date(record.date + 'T00:00:00');
                                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                                const formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                                return (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formattedDate}</td>
                                        <td>{dayName}</td>
                                        <td>
                                            <span className={`badge ${record.status.toLowerCase()}`}>
                                                {record.status === 'Present' ? '✓' : '✕'} {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mark Attendance Modal */}
            <Modal isOpen={showMarkModal} onClose={() => { setShowMarkModal(false); setMarkError(''); }} title="Mark Attendance">
                <form onSubmit={handleMarkAttendance}>
                    {markError && <div className="form-error">{markError}</div>}
                    <div className="form-group">
                        <label>Employee *</label>
                        <select
                            style={{color:"black"}}
                            className="form-control"
                            name="employee_id"
                            value={markForm.employee_id}
                            onChange={(e) => setMarkForm({ ...markForm, employee_id: e.target.value })}
                        >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.full_name} ({emp.employee_id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date *</label>
                            <input
                                type="date"
                                className="form-control"
                                value={markForm.date}
                                onChange={(e) => setMarkForm({ ...markForm, date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status *</label>
                            <select
                                className="form-control"
                                value={markForm.status}
                                onChange={(e) => setMarkForm({ ...markForm, status: e.target.value })}
                            >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={() => { setShowMarkModal(false); setMarkError(''); }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-success" disabled={marking}>
                            {marking ? 'Marking...' : 'Mark Attendance'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Attendance;
