import { NavLink } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineClipboardCheck, HiOutlineShieldCheck } from 'react-icons/hi';

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">&#128101;</div>
                <div>
                    <h1>HRMS Lite</h1>
                    <span>Admin Panel</span>
                </div>
            </div>

            {/* Admin Profile Section */}
            <div className="sidebar-admin-profile">
                <div className="admin-profile-avatar">A</div>
                <div className="admin-profile-info">
                    <span className="admin-profile-name">Administrator</span>
                    <span className="admin-profile-role">Super Admin</span>
                </div>
            </div>

            <div className="sidebar-section-label">MAIN MENU</div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
                    <HiOutlineViewGrid className="icon" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/employees" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <HiOutlineUsers className="icon" />
                    <span>Employees</span>
                </NavLink>
                <NavLink to="/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                    <HiOutlineClipboardCheck className="icon" />
                    <span>Attendance</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="admin-badge">
                    <HiOutlineShieldCheck />
                    Admin Access
                </div>
                <p>&copy; 2026 HRMS Lite v1.0</p>
            </div>
        </aside>
    );
}

export default Sidebar;
