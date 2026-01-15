import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaUsers, 
  FaShoppingCart, 
  FaRupeeSign, 
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch orders
    try {
      const ordersRes = await fetch('http://localhost:5000/api/orders');
      const ordersData = await ordersRes.json();
      setOrders(ordersData);
      
      // Calculate stats
      const totalOrders = ordersData.length;
      const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
      const completedOrders = ordersData.filter(o => o.status === 'completed').length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + order.total, 0);
      
      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        totalUsers: 45 // Mock data
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    
    setLoading(false);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      // In real app, call API to update
      alert(`Order ${orderId} status updated to ${status}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        // In real app, call API to delete
        alert(`Order ${orderId} deleted`);
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullPage text="Loading admin dashboard..." />;
  }

  const statusBadge = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    
    const icons = {
      pending: <FaClock className="me-1" />,
      confirmed: <FaCheckCircle className="me-1" />,
      preparing: <FaClock className="me-1" />,
      delivered: <FaCheckCircle className="me-1" />,
      cancelled: <FaTimesCircle className="me-1" />
    };
    
    return (
      <span className={`badge bg-${colors[status] || 'secondary'}`}>
        {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-2 col-md-3">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4">Admin Panel</h5>
              <div className="list-group list-group-flush">
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <FaChartLine className="me-2" /> Dashboard
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <FaShoppingCart className="me-2" /> Orders
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <FaUsers className="me-2" /> Users
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeTab === 'menu' ? 'active' : ''}`}
                  onClick={() => setActiveTab('menu')}
                >
                  <FaEdit className="me-2" /> Menu Management
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-lg-10 col-md-9">
          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
              <div className="card bg-primary text-white shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-white-50">Total Orders</h6>
                      <h3 className="fw-bold">{stats.totalOrders}</h3>
                    </div>
                    <FaShoppingCart className="fa-3x opacity-50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
              <div className="card bg-warning text-white shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-white-50">Pending</h6>
                      <h3 className="fw-bold">{stats.pendingOrders}</h3>
                    </div>
                    <FaClock className="fa-3x opacity-50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
              <div className="card bg-success text-white shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-white-50">Completed</h6>
                      <h3 className="fw-bold">{stats.completedOrders}</h3>
                    </div>
                    <FaCheckCircle className="fa-3x opacity-50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 col-sm-6 mb-3">
              <div className="card bg-info text-white shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-white-50">Revenue</h6>
                      <h3 className="fw-bold">₹{stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                    <FaRupeeSign className="fa-3x opacity-50" />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
              <div className="card bg-secondary text-white shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="text-white-50">Users</h6>
                      <h3 className="fw-bold">{stats.totalUsers}</h3>
                    </div>
                    <FaUsers className="fa-3x opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {activeTab === 'orders' && (
            <div className="card shadow">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Orders</h5>
                <button className="btn btn-sm btn-primary" onClick={fetchData}>
                  Refresh
                </button>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td>
                            <strong>{order.orderId}</strong>
                          </td>
                          <td>
                            <div>
                              <div>{order.customer?.name || 'N/A'}</div>
                              <small className="text-muted">{order.customer?.phone || ''}</small>
                            </div>
                          </td>
                          <td>
                            <small>{order.items?.length || 0} items</small>
                          </td>
                          <td>₹{order.total || 0}</td>
                          <td>{statusBadge(order.status)}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary"
                                onClick={() => updateOrderStatus(order.orderId, 'confirmed')}
                                title="Confirm Order"
                              >
                                <FaCheckCircle />
                              </button>
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => deleteOrder(order.orderId)}
                                title="Delete Order"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          {activeTab === 'users' && (
            <div className="card shadow">
              <div className="card-header bg-white">
                <h5 className="mb-0">Users Management</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">User management features coming soon...</p>
              </div>
            </div>
          )}

          {/* Menu Management */}
          {activeTab === 'menu' && (
            <div className="card shadow">
              <div className="card-header bg-white">
                <h5 className="mb-0">Menu Management</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">Menu management features coming soon...</p>
              </div>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="row">
              <div className="col-md-8">
                <div className="card shadow mb-4">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Recent Activity</h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {orders.slice(0, 5).map(order => (
                        <li key={order._id} className="list-group-item">
                          <div className="d-flex justify-content-between">
                            <div>
                              <strong>Order #{order.orderId}</strong>
                              <div className="text-muted small">
                                {order.customer?.name} • {order.items?.length} items
                              </div>
                            </div>
                            <div className="text-end">
                              <div>₹{order.total}</div>
                              {statusBadge(order.status)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card shadow">
                  <div className="card-header bg-white">
                    <h5 className="mb-0">Quick Actions</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-grid gap-2">
                      <button className="btn btn-primary">
                        <FaEdit className="me-2" /> Add New Menu Item
                      </button>
                      <button className="btn btn-success">
                        <FaUsers className="me-2" /> View All Users
                      </button>
                      <button className="btn btn-info">
                        <FaChartLine className="me-2" /> Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;