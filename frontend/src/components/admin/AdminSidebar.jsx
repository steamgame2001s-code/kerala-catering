// frontend/src/components/admin/AdminSidebar.jsx - COMPLETE MOBILE-FRIENDLY VERSION
import React, { useState, useEffect } from 'react';
import { 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaUtensils, 
  FaCamera,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaFileImage
} from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminPages.css';

const AdminSidebar = ({ isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminName');
    setIsMobileOpen(false);
    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/dashboard/festivals', icon: <FaCalendarAlt />, label: 'Festivals' },
    { path: '/admin/dashboard/festival-menu', icon: <FaFileImage />, label: 'Festival Menu', new: true },
    { path: '/admin/dashboard/menu', icon: <FaUtensils />, label: 'Menu' },
    { path: '/admin/dashboard/gallery', icon: <FaCamera />, label: 'Gallery' },
  ];

  return (
    <>
      {/* Mobile Toggle Button - only show on mobile */}
      {isMobile && (
        <button 
          className="mobile-sidebar-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <FaTachometerAlt />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileOpen && (
        <div 
          className="sidebar-overlay active"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${isCollapsed && !isMobile ? 'collapsed' : ''} ${isMobile && isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          {(!isCollapsed || isMobile) && (
            <div className="sidebar-brand">
              <h2>Kerala Catering</h2>
              <p>Administration</p>
            </div>
          )}
          {!isMobile && (
            <button className="sidebar-collapse-btn" onClick={toggleCollapse}>
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          )}
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
              onClick={handleMenuItemClick}
            >
              <span className="menu-icon">{item.icon}</span>
              {(!isCollapsed || isMobile) && (
                <>
                  <span className="menu-label">{item.label}</span>
                  {item.new && <span className="new-badge">New</span>}
                </>
              )}
            </NavLink>
          ))}
          
          <button 
            className="menu-item home-btn"
            onClick={() => {
              handleMenuItemClick();
              navigate('/');
            }}
          >
            <span className="menu-icon"><FaHome /></span>
            {(!isCollapsed || isMobile) && <span className="menu-label">Back to Home</span>}
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            {(!isCollapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;