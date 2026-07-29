import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    
    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Errors are handled inside Context and exposed via authError
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1611] flex flex-col justify-between p-6 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lime-950/20 blur-[120px] pointer-events-none"></div>

      {/* Top Navbar Logo */}
      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-2xl tracking-wide self-start z-10">
        <Leaf className="w-7 h-7 text-emerald-500 fill-emerald-500/20" />
        <span>Corn<span className="text-[#84CC16]">AI</span></span>
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-[440px] mx-auto my-auto glass-panel rounded-3xl p-8 relative overflow-hidden z-10">
        
        {/* Background Watermark/Decoration representing Corn in a sack (Aesthetic SVG) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none scale-110 select-none">
          <svg className="w-80 h-80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Leaves */}
            <path d="M50 80C65 70 65 30 50 15C35 30 35 70 50 80Z" fill="#10B981" />
            <path d="M50 70C60 60 75 40 70 25C58 35 52 55 50 70Z" fill="#047857" />
            <path d="M50 70C40 60 25 40 30 25C42 35 48 55 50 70Z" fill="#047857" />
            {/* Corn Ear */}
            <path d="M50 65C56 55 56 35 50 25C44 35 44 55 50 65Z" fill="#FBBF24" />
            {/* Sack */}
            <path d="M35 75C35 70 65 70 65 75C65 85 35 85 35 75Z" fill="#78350F" />
            <path d="M30 75C30 80 35 90 50 90C65 90 70 80 70 75H30Z" fill="#92400E" />
          </svg>
        </div>

        {/* Card Header */}
        <div className="text-center mb-8 relative">
          <h2 className="text-2xl font-bold text-white tracking-tight">Secure Login</h2>
          <p className="text-xs text-emerald-500/80 mt-1 font-medium">Access your crop management dashboard</p>
        </div>

        {/* Error Panels */}
        {(validationError || authError) && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium text-center">
            {validationError || authError}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6 relative">
          
          {/* Email field */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@farm-corp.com"
                className="w-full glass-input pl-11 pr-4 py-3 rounded-2xl text-sm"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-11 pr-11 py-3 rounded-2xl text-sm"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-md text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me Checkbox */}
          <div className="flex items-center gap-2.5 pl-1 select-none">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded-md border-white/10 bg-white/5 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 focus:outline-none transition-all"
            />
            <label htmlFor="remember" className="text-[11px] font-medium text-slate-400 cursor-pointer">
              Remember this device for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#008A2E] hover:bg-emerald-600 active:scale-[0.98] font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-white/10 my-6"></div>

        {/* Footer */}
        <p className="text-xs text-center text-slate-400 font-medium">
          Don't have an enterprise account?{' '}
          <Link to="/register" className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline ml-1">
            Register
          </Link>
        </p>

      </div>

      {/* Page Footer */}
      <div className="text-[10px] text-center text-slate-500 mt-6 z-10 select-none">
        © 2026 CornAI. Empowering sustainable agriculture through advanced computer vision.
      </div>
      
    </div>
  );
};

export default Login;
