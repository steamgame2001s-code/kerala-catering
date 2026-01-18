// frontend/src/components/admin/AdminHeader.jsx - CLEAN VERSION (NO NOTIFICATIONS)
import React from 'react';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import './AdminPages.css';
import './AdminPages.css';  // Single CSS file

const AdminHeader = ({ toggleSidebar }) => {
  const adminName = localStorage.getItem('adminName') || 'Admin';

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <div className="header-brand">
          <h1>Kerala Catering</h1>
          <span className="header-subtitle">Admin Panel</span>
        </div>
      </div>
      
      <div className="header-right">
        {/* Notification bell completely removed */}
        
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