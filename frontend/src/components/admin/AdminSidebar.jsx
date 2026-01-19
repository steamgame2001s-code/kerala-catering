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
    { path: "/admin/dashboard/home", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/admin/dashboard/festivals", icon: <FaCalendarAlt />, label: "Festivals" },
    { path: "/admin/dashboard/festival-menu", icon: <FaFileImage />, label: "Festival Menu" },
    { path: "/admin/dashboard/menu", icon: <FaUtensils />, label: "Menu" },
    { path: "/admin/dashboard/gallery", icon: <FaCamera />, label: "Gallery" }
  ];

  // Handle menu click
  const handleMenuItemClick = () => {
    if (isMobile) {
      onMobileClose();
    }
  };

  return (
    <>
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

        {/* Menu */}
        <nav className="sidebar-menu">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin/dashboard/home"}
              className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}
              onClick={handleMenuItemClick}
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
          >
            <span className="menu-icon"><FaHome /></span>
            {(!isCollapsed || isMobile) && <span className="menu-label">Back to Home</span>}
          </button>
        </nav>

        {/* Footer */}
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