import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import './AdminPages.css';

const AdminLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true); // Auto-collapse sidebar on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Admin Sidebar */}
      <AdminSidebar 
        isCollapsed={isMobile ? false : isSidebarCollapsed}
        isMobile={isMobile}
        isMobileOpen={isMobileSidebarOpen}
        toggleCollapse={toggleSidebar}
        onMobileClose={closeMobileSidebar}
      />
      
      {/* Main Content Area */}
      <div 
        className={`admin-main ${
          isSidebarCollapsed && !isMobile ? 'sidebar-collapsed' : ''
        } ${
          isMobile && isMobileSidebarOpen ? 'mobile-sidebar-open' : ''
        }`}
      >
        <AdminHeader 
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />
        <main className="admin-content" onClick={closeMobileSidebar}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;