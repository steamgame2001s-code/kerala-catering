import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    totalInquiries: 0,
    recentActivities: [],
    recentActions: [],
    recentInquiries: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // You could move these to a config file or get from backend
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
      const token = localStorage.getItem('adminToken');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get('http://localhost:5000/api/admin/dashboard/stats', config);
      console.log('Dashboard data:', response.data);
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const getActionIcon = (type) => {
    // ... icon functions remain the same ...
  };

  const getActionLabel = (type) => {
    // ... label function remains the same ...
  };

  const formatTime = (timestamp) => {
    // ... formatTime function remains the same ...
  };

  const handleQuickAccess = (page) => {
    navigate(`/admin/dashboard/${page}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Using config for title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {dashboardConfig.title}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Festivals Card */}
        <div 
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer hover:shadow-xl"
          onClick={() => handleQuickAccess('festivals')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Festivals</p>
              <p className="text-4xl font-bold mt-2">{stats.festivals || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Menu Card */}
        <div 
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer hover:shadow-xl"
          onClick={() => handleQuickAccess('menu')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Menu Items</p>
              <p className="text-4xl font-bold mt-2">{stats.foodItems || stats.totalMenuItems || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Gallery Card */}
        <div 
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer hover:shadow-xl"
          onClick={() => handleQuickAccess('gallery')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Gallery Items</p>
              <p className="text-4xl font-bold mt-2">{stats.gallery || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Festival Menu Card */}
        <div 
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer hover:shadow-xl"
          onClick={() => handleQuickAccess('festival-menu')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Festival Menu</p>
              <p className="text-4xl font-bold mt-2">{stats.festivalMenu || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-full">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {dashboardConfig.sections.recentActivities}
            </h2>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
              {stats.recentActivities?.length || 0} activities
            </span>
          </div>
          
          {stats.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-100 hover:shadow-md transition-shadow">
                  {getActionIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {activity.action || getActionLabel(activity.type)}
                    </p>
                    {activity.details && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {activity.details}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time || formatTime(activity.timestamp || activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500">
                {dashboardConfig.emptyStates.activities}
              </p>
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {dashboardConfig.sections.recentInquiries}
            </h2>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
              {stats.recentInquiries?.length || 0} inquiries
            </span>
          </div>
          
          {stats.recentInquiries && stats.recentInquiries.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.recentInquiries.map((inquiry) => (
                <div key={inquiry._id} className="p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{inquiry.name}</p>
                      <p className="text-sm text-gray-600">{inquiry.email || inquiry.phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2 font-semibold ${
                      inquiry.status === 'responded' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{inquiry.message || inquiry.comments}</p>
                  <p className="text-xs text-gray-400">{formatTime(inquiry.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-gray-500">
                {dashboardConfig.emptyStates.inquiries}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;