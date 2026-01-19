// frontend/src/components/admin/AdminLayout.jsx - FIXED
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  /* =========================
     SCREEN SIZE DETECTION
     ========================= */
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Reset states correctly on breakpoint change
      if (mobile) {
        setSidebarCollapsed(false);
      } else {
        setMobileSidebarOpen(false);
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  /* =========================
     BODY SCROLL LOCK (MOBILE) - FIXED
     ========================= */
  useEffect(() => {
    const body = document.body;
    if (isMobile && isMobileSidebarOpen) {
      body.style.overflow = "hidden";
      body.classList.add("sidebar-open"); // ADD THIS LINE
    } else {
      body.style.overflow = "";
      body.classList.remove("sidebar-open"); // ADD THIS LINE
    }
    
    // Cleanup on unmount
    return () => {
      body.style.overflow = "";
      body.classList.remove("sidebar-open");
    };
  }, [isMobile, isMobileSidebarOpen]);

  /* =========================
     SIDEBAR TOGGLES
     ========================= */
  const toggleSidebar = () => {
    console.log('📱 Toggle sidebar called, isMobile:', isMobile);
    if (isMobile) {
      setMobileSidebarOpen(prev => {
        console.log('📱 Mobile sidebar toggled to:', !prev);
        return !prev;
      });
    } else {
      setSidebarCollapsed(prev => {
        console.log('💻 Desktop sidebar toggled to:', !prev);
        return !prev;
      });
    }
  };

  const closeMobileSidebar = () => {
    console.log('📱 Closing mobile sidebar');
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  // Add click outside to close sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isMobileSidebarOpen) {
        const sidebar = document.querySelector('.admin-sidebar');
        const hamburger = document.querySelector('.mobile-sidebar-toggle');
        
        if (sidebar && !sidebar.contains(e.target) && 
            hamburger && !hamburger.contains(e.target)) {
          closeMobileSidebar();
        }
      }
    };

    if (isMobile && isMobileSidebarOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobile, isMobileSidebarOpen]);

  return (
    <div className={`admin-layout ${isMobile && isMobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
      {/* ================= SIDEBAR ================= */}
      <AdminSidebar
        isCollapsed={!isMobile && isSidebarCollapsed}
        isMobile={isMobile}
        isMobileOpen={isMobileSidebarOpen}
        toggleCollapse={toggleSidebar}
        onMobileClose={closeMobileSidebar}
      />

      {/* ================= MAIN CONTENT ================= */}
      <div
        className={`admin-main-content
          ${!isMobile && isSidebarCollapsed ? "sidebar-collapsed" : ""}
        `}
        onClick={() => {
          if (isMobile && isMobileSidebarOpen) {
            closeMobileSidebar();
          }
        }}
      >
        <AdminHeader
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;