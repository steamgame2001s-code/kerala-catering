// frontend/src/components/admin/DashboardHome.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import './DashboardHome.css';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalActions: 0,
    pendingInquiries: 0,
    totalMenuItems: 0,
    festivals: 0,
    foodItems: 0,
    gallery: 0,
    festivalMenu: 0,
    totalInquiries: 0,
    recentActivities: [],
    recentActions: [],
    recentInquiries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const dashboardConfig = {
    title: 'Dashboard Overview',
    sections: {
      recentActivities: 'Recent Activities',
      recentInquiries: 'Recent Inquiries'
    },
    emptyStates: {
      activities: 'No recent activities',
      inquiries: 'No recent inquiries'
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Fetching dashboard stats...');
      
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        console.error('❌ No admin token found');
        navigate('/admin/login');
        return;
      }

      const response = await axios.get('/admin/dashboard/stats', {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      console.log('✅ Dashboard data received:', response.data);
      
      if (response.data.success) {
        setStats(response.data.stats);
        console.log('📈 Stats updated');
      } else {
        setError('Failed to load dashboard data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      
      setError(error.response?.data?.message || 'Failed to load dashboard data');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleQuickAccess = (page) => {
    navigate(`/admin/dashboard/${page}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-home">
        <div className="error-container">
          <h3 className="error-title">Error Loading Dashboard</h3>
          <p className="error-message">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="error-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <h1 className="dashboard-title">{dashboardConfig.title}</h1>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Festivals Card */}
        <div className="stat-card blue" onClick={() => handleQuickAccess('festivals')}>
          <div className="stat-card-header">
            <div className="stat-card-info">
              <p className="stat-card-label">Festivals</p>
              <p className="stat-card-value">{stats.festivals || 0}</p>
            </div>
            <div className="stat-card-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Menu Card */}
        <div className="stat-card green" onClick={() => handleQuickAccess('menu')}>
          <div className="stat-card-header">
            <div className="stat-card-info">
              <p className="stat-card-label">Menu Items</p>
              <p className="stat-card-value">{stats.foodItems || 0}</p>
            </div>
            <div className="stat-card-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Gallery Card */}
        <div className="stat-card purple" onClick={() => handleQuickAccess('gallery')}>
          <div className="stat-card-header">
            <div className="stat-card-info">
              <p className="stat-card-label">Gallery Items</p>
              <p className="stat-card-value">{stats.gallery || 0}</p>
            </div>
            <div className="stat-card-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Festival Menu Card */}
        <div className="stat-card orange" onClick={() => handleQuickAccess('festival-menu')}>
          <div className="stat-card-header">
            <div className="stat-card-info">
              <p className="stat-card-label">Festival Menu</p>
              <p className="stat-card-value">{stats.festivalMenu || 0}</p>
            </div>
            <div className="stat-card-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="activity-grid">
        {/* Recent Activities */}
        <div className="activity-card">
          <div className="activity-card-header">
            <h2 className="activity-card-title">{dashboardConfig.sections.recentActivities}</h2>
            <span className="activity-badge">
              {stats.recentActivities?.length || 0} activities
            </span>
          </div>
          
          {stats.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="activity-list">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-content">
                    <p className="activity-title">
                      {activity.action || 'User Action'}
                    </p>
                    {activity.details && (
                      <p className="activity-details">{activity.details}</p>
                    )}
                    <p className="activity-time">
                      {formatTime(activity.timestamp || activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="empty-state-text">{dashboardConfig.emptyStates.activities}</p>
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="activity-card">
          <div className="activity-card-header">
            <h2 className="activity-card-title">{dashboardConfig.sections.recentInquiries}</h2>
            <span className="activity-badge">
              {stats.recentInquiries?.length || 0} inquiries
            </span>
          </div>
          
          {stats.recentInquiries && stats.recentInquiries.length > 0 ? (
            <div className="activity-list">
              {stats.recentInquiries.map((inquiry) => (
                <div key={inquiry._id} className="inquiry-item">
                  <div className="inquiry-header">
                    <div className="inquiry-user-info">
                      <p className="inquiry-name">{inquiry.name}</p>
                      <p className="inquiry-contact">{inquiry.email || inquiry.phone}</p>
                    </div>
                    <span className={`inquiry-status ${inquiry.status === 'responded' ? 'responded' : 'pending'}`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="inquiry-message">{inquiry.message || inquiry.comments}</p>
                  <p className="inquiry-time">{formatTime(inquiry.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="empty-state-text">{dashboardConfig.emptyStates.inquiries}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;