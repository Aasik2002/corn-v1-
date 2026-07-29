import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanHistory from './pages/ScanHistory';
import Profile from './pages/Profile';
import About from './pages/About';

// Dashboard layout container with top Navbar
const Layout = () => {
  return (
    <div className="min-h-screen bg-[#0E1611] text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Private Protected Dashboard Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-scan" element={<NewScan />} />
            <Route path="/history" element={<ScanHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
