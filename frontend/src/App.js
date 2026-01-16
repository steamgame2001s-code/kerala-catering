import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';

// Public Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import FestivalsPage from './pages/FestivalsPage';
import FestivalDetailPage from './pages/FestivalDetailPage';
import FoodMenu from './pages/FoodMenu';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Components (FROM admin folder)
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import DashboardHome from './components/admin/DashboardHome';
import FestivalManagement from './components/admin/FestivalManagement';
import FestivalMenuManagement from './components/admin/FestivalMenuManagement';
import FestivalMenuImages from './components/admin/FestivalMenuImages';
import MenuManagement from './components/admin/MenuManagement';
import GalleryManagement from './components/admin/GalleryManagement';

// Password Reset Components (FROM admin folder)
import ForgotPassword from './components/admin/ForgotPassword';
import VerifyOTP from './components/admin/VerifyOTP';
import ResetPassword from './components/admin/ResetPassword';

import './App.css';

function App() {
  // Debug: Check environment
  React.useEffect(() => {
    console.log('=== APP STARTED ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    console.log('Backend URL:', process.env.NODE_ENV === 'production' 
      ? 'https://kerala-catering.onrender.com/api' 
      : 'http://localhost:5000/api');
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <CartProvider>
            <div className="App">
              <Routes>
                {/* ========== PUBLIC ROUTES ========== */}
                <Route path="/" element={
                  <>
                    <Navbar />
                    <HomePage />
                    <Footer />
                  </>
                } />
                
                <Route path="/festivals" element={
                  <>
                    <Navbar />
                    <FestivalsPage />
                    <Footer />
                  </>
                } />
                
                <Route path="/festival/:slug" element={
                  <>
                    <Navbar />
                    <FestivalDetailPage />
                    <Footer />
                  </>
                } />
                
                <Route path="/menu" element={
                  <>
                    <Navbar />
                    <FoodMenu />
                    <Footer />
                  </>
                } />
                
                <Route path="/gallery" element={
                  <>
                    <Navbar />
                    <GalleryPage />
                    <Footer />
                  </>
                } />
                
                <Route path="/about" element={
                  <>
                    <Navbar />
                    <AboutPage />
                    <Footer />
                  </>
                } />
                
                <Route path="/login" element={
                  <>
                    <Navbar />
                    <LoginPage />
                    <Footer />
                  </>
                } />
                
                <Route path="/register" element={
                  <>
                    <Navbar />
                    <RegisterPage />
                    <Footer />
                  </>
                } />

                {/* ========== ADMIN AUTH ROUTES ========== */}
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/forgot-password" element={<ForgotPassword />} />
                <Route path="/admin/verify-otp" element={<VerifyOTP />} />
                <Route path="/admin/reset-password" element={<ResetPassword />} />

                {/* ========== ADMIN DASHBOARD ROUTES (PROTECTED) ========== */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/admin/dashboard/home" replace />} />
                  <Route path="home" element={<DashboardHome />} />
                  <Route path="festivals" element={<FestivalManagement />} />
                  <Route path="festival-menu" element={<FestivalMenuManagement />} />
                  <Route path="festival-menu/:id" element={<FestivalMenuImages />} />
                  <Route path="menu" element={<MenuManagement />} />
                  <Route path="gallery" element={<GalleryManagement />} />
                </Route>

                {/* ========== CATCH ALL ========== */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </CartProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;