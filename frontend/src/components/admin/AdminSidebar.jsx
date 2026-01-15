// frontend/src/components/admin/AdminSidebar.jsx - COMPLETE UPDATED FILE
import React from 'react';
import { 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaUtensils, 
  FaCamera,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaFileImage // NEW ICON
} from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminPages.css';

const AdminSidebar = ({ isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminName');
    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/dashboard/festivals', icon: <FaCalendarAlt />, label: 'Festivals' },
    { path: '/admin/dashboard/festival-menu', icon: <FaFileImage />, label: 'Festival Menu', new: true }, // NEW MENU ITEM
    { path: '/admin/dashboard/menu', icon: <FaUtensils />, label: 'Menu' },
    { path: '/admin/dashboard/gallery', icon: <FaCamera />, label: 'Gallery' },
  ];

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-brand">
            <h2>Kerala Catering</h2>
            <p>Administration</p>
          </div>
        )}
        <button className="sidebar-collapse-btn" onClick={toggleCollapse}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `menu-item ${isActive ? 'active' : ''} ${item.new ? 'new-item' : ''}`
            }
            end={item.path === '/admin/dashboard'}
          >
            <span className="menu-icon">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="menu-label">{item.label}</span>
                {item.new && <span className="new-badge">New</span>}
              </>
            )}
          </NavLink>
        ))}
        
        <button 
          className="menu-item home-btn"
          onClick={() => navigate('/')}
        >
          <span className="menu-icon"><FaHome /></span>
          {!isCollapsed && <span className="menu-label">Back to Home</span>}
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;