import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Search from './pages/Search';
import ParkingSpotDetails from './pages/ParkingSpotDetails';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import AdminDashboard from './pages/Admin/Dashboard';
import NotFound from './pages/NotFound';
import PaymentPage from './pages/Payment/PaymentPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return <>{children}</>;
};

// Already logged in users shouldn't see login/register
const AlreadyLoggedInRoute = ({ element }: { element: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{element}</>;
};

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={<AlreadyLoggedInRoute element={<Login />} />} 
      />
      <Route 
        path="/register" 
        element={<AlreadyLoggedInRoute element={<Register />} />} 
      />
      <Route path="/search" element={<Search />} />
      <Route path="/parking/:id" element={<ParkingSpotDetails />} />
      <Route path="/contact" element={<Contact />} />
      
      {/* Protected routes */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment/:id" 
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;