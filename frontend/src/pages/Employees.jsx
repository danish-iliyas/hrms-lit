import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineMail } from 'react-icons/hi';
import { getEmployees, createEmployee, deleteEmployee } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({ employee_id: '', full_name: '', email: '', department: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Client-side validation
        if (!formData.employee_id.trim() || !formData.full_name.trim() || !formData.email.trim() || !formData.department.trim()) {
            setFormError('All fields are required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormError('Please enter a valid email address');
            return;
        }

        setSubmitting(true);
        try {
            await createEmployee(formData);
            toast.success(`Employee "${formData.full_name}" added successfully!`);
            setShowAddModal(false);
            setFormData({ employee_id: '', full_name: '', email: '', department: '' });
            fetchEmployees();
        } catch (err) {
            setFormError(err.response?.data?.detail || 'Failed to add employee');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteEmployee(deleteTarget.employee_id);
            toast.success(`Employee "${deleteTarget.full_name}" deleted successfully`);
            setDeleteTarget(null);
            fetchEmployees();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to delete employee');
        } finally {
            setDeleting(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner message="Loading employees..." />;
    if (error) return <ErrorState message={error} onRetry={fetchEmployees} />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2>Employee Management</h2>
                <p>Add, view, and manage employee records</p>
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ maxWidth: 320 }}
                />
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <HiOutlinePlus /> Add Employee
                </button>
            </div>

            {/* Employee Table */}
            {employees.length === 0 ? (
                <div className="table-container">
                    <EmptyState
                        icon="👥"
                        title="No Employees Yet"
                        message="Start by adding your first employee to the system"
                        action={
                            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                                <HiOutlinePlus /> Add First Employee
                            </button>
                        }
                    />
                </div>
            ) : filteredEmployees.length === 0 ? (
                <div className="table-container">
                    <EmptyState
                        icon="🔍"
                        title="No Results Found"
                        message={`No employees match "${searchTerm}"`}
                    />
                </div>
            ) : (
                <div className="table-container">
                    <div className="table-header">
                        <h3>All Employees ({filteredEmployees.length})</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Attendance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.employee_id}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{emp.employee_id}</td>
                                    <td style={{ color: 'var(--text-primary)' }}>{emp.full_name}</td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <HiOutlineMail style={{ opacity: 0.5 }} /> {emp.email}
                                        </span>
                                    </td>
                                    <td><span className="badge department">{emp.department}</span></td>
                                    <td>
                                        <div className="attendance-summary">
                                            <span className="mini-badge present">✓ {emp.total_present}</span>
                                            <span className="mini-badge absent">✕ {emp.total_absent}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => setDeleteTarget(emp)}
                                            title="Delete employee"
                                        >
                                            <HiOutlineTrash /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Employee Modal */}
            <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setFormError(''); }} title="Add New Employee">
                <form onSubmit={handleSubmit}>
                    {formError && <div className="form-error">{formError}</div>}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Employee ID *</label>
                            <input
                                type="text"
                                className="form-control"
                                name="employee_id"
                                placeholder="e.g. EMP001"
                                value={formData.employee_id}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Department *</label>
                            <input
                                type="text"
                                className="form-control"
                                name="department"
                                placeholder="e.g. Engineering"
                                value={formData.department}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            name="full_name"
                            placeholder="e.g. John Doe"
                            value={formData.full_name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address *</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            placeholder="e.g. john@company.com"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={() => { setShowAddModal(false); setFormError(''); }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Employee?"
                message={deleteTarget ? `Are you sure you want to delete "${deleteTarget.full_name}" (${deleteTarget.employee_id})? This will also remove all attendance records for this employee.` : ''}
                loading={deleting}
            />
        </div>
    );
}

export default Employees;
