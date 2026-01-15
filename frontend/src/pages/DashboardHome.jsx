import React from 'react';
import './AdminPages.css';

const DashboardHome = () => {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome to Kerala Catering Admin Panel</p>
      </div>
      
      <div className="page-content">
        <div className="welcome-card">
          <h3>🚀 Getting Started</h3>
          <p>Manage your catering business efficiently with these tools:</p>
          <ul>
            <li>Add and manage festival menus</li>
            <li>Upload food gallery images</li>
            <li>Track customer orders</li>
            <li>Manage user accounts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;