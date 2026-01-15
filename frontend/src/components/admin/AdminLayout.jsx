// frontend/src/components/admin/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import './AdminPages.css';

const AdminLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleSidebar}
      />
      
      <div className={`admin-main ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <AdminHeader toggleSidebar={toggleSidebar} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;