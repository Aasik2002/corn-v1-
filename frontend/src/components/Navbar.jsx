import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Settings, LogOut, User, Leaf } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 mb-6 border-b border-white/5 bg-[#0E1611]/75 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 text-emerald-400 font-extrabold text-2xl tracking-wide transition-all hover:opacity-90">
          <Leaf className="w-7 h-7 text-emerald-500 fill-emerald-500/20" />
          <span>Corn<span className="text-[#84CC16]">AI</span></span>
        </Link>

        {/* Center NavLinks */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition-all duration-200 hover:text-emerald-400 ${
                isActive ? 'text-emerald-400 border-b-2 border-emerald-500 pb-1 font-semibold' : 'text-slate-400'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/new-scan"
            className={({ isActive }) =>
              `text-sm font-medium transition-all duration-200 hover:text-emerald-400 ${
                isActive ? 'text-emerald-400 border-b-2 border-emerald-500 pb-1 font-semibold' : 'text-slate-400'
              }`
            }
          >
            New Scan
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `text-sm font-medium transition-all duration-200 hover:text-emerald-400 ${
                isActive ? 'text-emerald-400 border-b-2 border-emerald-500 pb-1 font-semibold' : 'text-slate-400'
              }`
            }
          >
            History
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-sm font-medium transition-all duration-200 hover:text-emerald-400 ${
                isActive ? 'text-emerald-400 border-b-2 border-emerald-500 pb-1 font-semibold' : 'text-slate-400'
              }`
            }
          >
            About
          </NavLink>
        </div>

        {/* Right Section: Search & Actions */}
        <div className="flex items-center gap-4">
          
          {/* Search Bar */}
          <div className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search data..."
              className="glass-input pl-10 pr-4 py-1.5 rounded-full text-sm w-60 border-[#263e2e]/60"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Action Icons */}
          <button className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>
          
          <Link to="/profile" className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-5 h-5" />
          </Link>

          {/* User Profile Avatar / Logout Dropdown */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-400">
                {user?.fullName ? (
                  <span className="text-emerald-400 font-bold text-sm">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors leading-tight">
                  {user?.fullName || 'Farmer'}
                </p>
                <p className="text-[10px] text-slate-400 leading-none">
                  {user?.organization || 'Independent'}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all ml-1"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
