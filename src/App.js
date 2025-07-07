import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import RibbonForm from './RibbonForm';
import UserForm from './UserForm';
import MainLayout from './MainLayout';
import Dashboard from './Dashboard';
import RepClerk from './RepClerk';
import ReviewDN from './ReviewDN';
import PrintDN from './PrintDN';
import UserManagement from './UserManagement';
function App() {
  const isAuthenticated = true;//!!localStorage.getItem('token'); // You can customize token logic

  return (
    <Router>
      <Routes>
  {/* Public Routes */}
  <Route path="/login" element={<LoginPage />} />

  {/* Protected Routes */}
  {isAuthenticated ? (
    <Route path="/" element={<MainLayout />}>
      <Route path="form" element={<RibbonForm />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="create-user" element={<UserForm />} />
      <Route path="RepClerk" element={<RepClerk />} />
      <Route path="ReviewDN" element={<ReviewDN />} />
      <Route path="PrintDN" element={<PrintDN />} />
      <Route path="Users" element={<UserManagement />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Route>
  ) : (
    <Route path="*" element={<Navigate to="/" />} />
  )}
</Routes>
    </Router>
  );
}

export default App;
