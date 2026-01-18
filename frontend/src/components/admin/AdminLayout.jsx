import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import './admin-layout.css';
import './admin-sidebar.css';
import './admin-dashboard.css';
import './admin-pages.css';
import "./AdminPages.css";

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
     BODY SCROLL LOCK (MOBILE)
     ========================= */
  useEffect(() => {
    if (isMobile && isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobile, isMobileSidebarOpen]);

  /* =========================
     SIDEBAR TOGGLES
     ========================= */
  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setSidebarCollapsed(prev => !prev);
    }
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* ================= MOBILE OVERLAY ================= */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={closeMobileSidebar}
        />
      )}

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
        onClick={closeMobileSidebar}
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
