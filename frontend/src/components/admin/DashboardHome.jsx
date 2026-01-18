import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import '../components/admin/AdminPages.css';
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
        console.log('📈 Stats updated:', {
          festivals: response.data.stats.festivals,
          foodItems: response.data.stats.foodItems,
          gallery: response.data.stats.gallery,
          festivalMenu: response.data.stats.festivalMenu,
          inquiries: response.data.stats.totalInquiries
        });
      } else {
        setError('Failed to load dashboard data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      setError(error.response?.data?.message || 'Failed to load dashboard data');
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (type) => {
    const icons = {
      whatsapp: (
        <div className="bg-green-100 p-2 rounded-full">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
      ),
      call: (
        <div className="bg-blue-100 p-2 rounded-full">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
      ),
      form: (
        <div className="bg-purple-100 p-2 rounded-full">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )
    };
    return icons[type] || icons.form;
  };

  const getActionLabel = (type) => {
    const labels = {
      whatsapp: 'WhatsApp Contact',
      call: 'Phone Call',
      form: 'Form Submission'
    };
    return labels[type] || 'User Action';
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
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 px-4 sm:px-6">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-red-800 font-semibold mb-2 text-lg sm:text-xl">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
        {dashboardConfig.title}
      </h1>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Festivals Card */}
        <div 
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer hover:shadow-xl min-h-[100px] sm:min-h-[140px]"
          onClick={() => handleQuickAccess('festivals')}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex-1">
              <p className="text-blue-100 text-xs sm:text-sm font-medium mb-2 sm:mb-4">Festivals</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.festivals || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Menu Card */}
        <div 
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer hover:shadow-xl min-h-[100px] sm:min-h-[140px]"
          onClick={() => handleQuickAccess('menu')}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex-1">
              <p className="text-green-100 text-xs sm:text-sm font-medium mb-2 sm:mb-4">Menu Items</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.foodItems || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Gallery Card */}
        <div 
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer hover:shadow-xl min-h-[100px] sm:min-h-[140px]"
          onClick={() => handleQuickAccess('gallery')}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex-1">
              <p className="text-purple-100 text-xs sm:text-sm font-medium mb-2 sm:mb-4">Gallery Items</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.gallery || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Festival Menu Card */}
        <div 
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 sm:p-6 text-white transform hover:scale-105 transition-transform duration-200 cursor-pointer hover:shadow-xl min-h-[100px] sm:min-h-[140px]"
          onClick={() => handleQuickAccess('festival-menu')}
        >
          <div className="flex items-center justify-between h-full">
            <div className="flex-1">
              <p className="text-orange-100 text-xs sm:text-sm font-medium mb-2 sm:mb-4">Festival Menu</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{stats.festivalMenu || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {dashboardConfig.sections.recentActivities}
            </h2>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              {stats.recentActivities?.length || 0} activities
            </span>
          </div>
          
          {stats.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[350px] sm:max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-100 hover:shadow-md transition-all duration-200 hover:translate-x-1">
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
                      {formatTime(activity.timestamp || activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-center text-sm sm:text-base">
                {dashboardConfig.emptyStates.activities}
              </p>
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 min-h-[300px] sm:min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              {dashboardConfig.sections.recentInquiries}
            </h2>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap">
              {stats.recentInquiries?.length || 0} inquiries
            </span>
          </div>
          
          {stats.recentInquiries && stats.recentInquiries.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[350px] sm:max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {stats.recentInquiries.map((inquiry) => (
                <div key={inquiry._id} className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-white rounded-lg border border-orange-100 hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">{inquiry.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{inquiry.email || inquiry.phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold w-fit ${
                      inquiry.status === 'responded' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">{inquiry.message || inquiry.comments}</p>
                  <p className="text-xs text-gray-400">{formatTime(inquiry.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-gray-500 text-center text-sm sm:text-base">
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