import React from 'react';
import './AdminPages.css';

const DashboardHome = () => {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>
          <i className="fas fa-chart-line" style={{ marginRight: '10px', color: '#FF6B35' }}></i>
          Dashboard Overview
        </h2>
        <p>Welcome to Kerala Catering Admin Panel</p>
      </div>
      
      <div className="page-content">
        <div className="welcome-card">
          <h3>
            <i className="fas fa-rocket" style={{ marginRight: '8px' }}></i>
            Getting Started
          </h3>
          <p>Manage your catering business efficiently with these tools:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '10px 0', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-calendar-alt" style={{ marginRight: '12px', color: '#FF6B35', fontSize: '18px', width: '24px' }}></i>
              <span>Add and manage festival menus</span>
            </li>
            <li style={{ padding: '10px 0', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-images" style={{ marginRight: '12px', color: '#FF6B35', fontSize: '18px', width: '24px' }}></i>
              <span>Upload food gallery images</span>
            </li>
            <li style={{ padding: '10px 0', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-shopping-cart" style={{ marginRight: '12px', color: '#FF6B35', fontSize: '18px', width: '24px' }}></i>
              <span>Track customer orders</span>
            </li>
            <li style={{ padding: '10px 0', display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-users" style={{ marginRight: '12px', color: '#FF6B35', fontSize: '18px', width: '24px' }}></i>
              <span>Manage user accounts</span>
            </li>
          </ul>
        </div>

        {/* Quick Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginTop: '30px' 
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Total Orders</h4>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>0</p>
              </div>
              <i className="fas fa-shopping-bag" style={{ fontSize: '48px', opacity: 0.3 }}></i>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Menu Items</h4>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>0</p>
              </div>
              <i className="fas fa-utensils" style={{ fontSize: '48px', opacity: 0.3 }}></i>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Gallery Items</h4>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>0</p>
              </div>
              <i className="fas fa-camera" style={{ fontSize: '48px', opacity: 0.3 }}></i>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '25px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', opacity: 0.9 }}>Active Users</h4>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>0</p>
              </div>
              <i className="fas fa-user-check" style={{ fontSize: '48px', opacity: 0.3 }}></i>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '20px', color: '#2D3748' }}>
            <i className="fas fa-bolt" style={{ marginRight: '10px', color: '#FF6B35' }}></i>
            Quick Actions
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px' 
          }}>
            <button style={{
              padding: '15px',
              background: '#FF6B35',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <i className="fas fa-plus-circle"></i>
              Add Festival
            </button>

            <button style={{
              padding: '15px',
              background: '#4299E1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <i className="fas fa-image"></i>
              Upload Image
            </button>

            <button style={{
              padding: '15px',
              background: '#48BB78',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <i className="fas fa-clipboard-list"></i>
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;