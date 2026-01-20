// frontend/src/components/admin/AdminSidebar.jsx - COMPLETE FIXED
import React from "react";
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
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = ({
  isCollapsed,
  isMobile,
  isMobileOpen,
  toggleCollapse,
  onMobileClose
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("adminName");
    onMobileClose();
    navigate("/");
  };

  const menuItems = [
    { path: "/admin/dashboard/home", icon: <FaTachometerAlt />, label: "Dashboard", tooltip: "Dashboard" },
    { path: "/admin/dashboard/festivals", icon: <FaCalendarAlt />, label: "Festivals", tooltip: "Festivals" },
    { path: "/admin/dashboard/festival-menu", icon: <FaFileImage />, label: "Festival Menu", tooltip: "Festival Menu" },
    { path: "/admin/dashboard/menu", icon: <FaUtensils />, label: "Menu", tooltip: "Menu" },
    { path: "/admin/dashboard/gallery", icon: <FaCamera />, label: "Gallery", tooltip: "Gallery" }
  ];

  // Handle menu click
  const handleMenuItemClick = () => {
    if (isMobile) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      {/* Main Sidebar */}
      <aside
        className={`admin-sidebar
          ${isCollapsed && !isMobile ? "collapsed" : ""}
          ${isMobile && isMobileOpen ? "mobile-open" : ""}
        `}
      >
        {/* Header */}
        <div className="sidebar-header">
          {(!isCollapsed || isMobile) && (
            <div className="sidebar-brand">
              <h2>UPASANA</h2>
              <p>Admin Panel</p>
            </div>
          )}

          {/* Desktop collapse button */}
          {!isMobile && (
            <button
              className="sidebar-collapse-btn"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          )}

          {/* Mobile close button */}
          {isMobile && (
            <button
              className="sidebar-close-btn"
              onClick={onMobileClose}
              aria-label="Close sidebar"
            >
              ×
            </button>
          )}
        </div>

        {/* Scrollable Menu Container */}
        <div className="sidebar-scroll-container">
          <nav className="sidebar-menu">
            {menuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/dashboard/home"}
                className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
                onClick={handleMenuItemClick}
                data-tooltip={isCollapsed && !isMobile ? item.tooltip : undefined}
              >
                <span className="menu-icon">{item.icon}</span>
                {(!isCollapsed || isMobile) && <span className="menu-label">{item.label}</span>}
              </NavLink>
            ))}

            {/* Home button */}
            <button
              className="menu-item home-btn"
              onClick={() => {
                handleMenuItemClick();
                navigate("/");
              }}
              data-tooltip={isCollapsed && !isMobile ? "Back to Home" : undefined}
            >
              <span className="menu-icon"><FaHome /></span>
              {(!isCollapsed || isMobile) && <span className="menu-label">Back to Home</span>}
            </button>
          </nav>
        </div>

        {/* Footer - Always at bottom */}
        <div className="sidebar-footer">
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            data-tooltip={isCollapsed && !isMobile ? "Logout" : undefined}
          >
            <FaSignOutAlt />
            {(!isCollapsed || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;