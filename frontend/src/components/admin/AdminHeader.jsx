// frontend/src/components/admin/AdminHeader.jsx - FIXED
import React from 'react';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import './AdminHeader.css';

const AdminHeader = ({ toggleSidebar, isMobile }) => {
  const adminName = localStorage.getItem('adminName') || 'Admin';

  return (
    <header className="admin-header">
      <div className="header-left">
        {/* Sidebar Toggle Button - Works on both mobile and desktop */}
        <button 
          className={isMobile ? "mobile-sidebar-toggle" : "desktop-sidebar-toggle"} 
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
        
        <div className="header-brand">
          <h1>Kerala Catering</h1>
          <span className="header-subtitle">Admin Panel</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="admin-profile">
          <div className="admin-avatar">
            <FaUserCircle />
          </div>
          <div className="admin-info">
            <span className="admin-name">{adminName}</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;