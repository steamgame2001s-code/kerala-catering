// frontend/src/components/admin/AdminSidebar.jsx
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
import "./AdminSidebar.css";  // Single CSS file

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
    setTimeout(() => window.location.reload(), 100);
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/admin/dashboard/festivals", icon: <FaCalendarAlt />, label: "Festivals" },
    {
      path: "/admin/dashboard/festival-menu",
      icon: <FaFileImage />,
      label: "Festival Menu",
      new: true
    },
    { path: "/admin/dashboard/menu", icon: <FaUtensils />, label: "Menu" },
    { path: "/admin/dashboard/gallery", icon: <FaCamera />, label: "Gallery" }
  ];

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      {isMobile && (
        <button 
          className="mobile-sidebar-toggle"
          onClick={toggleCollapse}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      )}
      
      {/* Sidebar Overlay for Mobile */}
      {isMobile && isMobileOpen && (
        <div
          className="sidebar-overlay active"
          onClick={onMobileClose}
        />
      )}
      
      {/* Main Sidebar */}
      <aside
        className={`admin-sidebar
          ${isCollapsed && !isMobile ? "collapsed" : ""}
          ${isMobile && isMobileOpen ? "mobile-open" : ""}
        `}
      >
        {/* ================= HEADER ================= */}
        <div className="sidebar-header">
          {(!isCollapsed || isMobile) && (
            <div className="sidebar-brand">
              <h2>UPASANA</h2>
              <p>Admin Panel</p>
            </div>
          )}

          {!isMobile && (
            <button
              className="sidebar-collapse-btn"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          )}
        </div>

        {/* ================= MENU ================= */}
        <nav className="sidebar-menu">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin/dashboard"}
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
              onClick={onMobileClose}
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
              onMobileClose();
              navigate("/");
            }}
          >
            <span className="menu-icon">
              <FaHome />
            </span>
            {(!isCollapsed || isMobile) && (
              <span className="menu-label">Back to Home</span>
            )}
          </button>
        </nav>

        {/* ================= FOOTER ================= */}
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