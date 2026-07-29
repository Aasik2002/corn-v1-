import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight, User } from 'lucide-react';

const Register = () => {
  const { register, error: authError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [organization, setOrganization] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, phoneNumber, organization);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1611] flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lime-950/20 blur-[120px] pointer-events-none"></div>

      {/* Header Logo */}
      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-2xl tracking-wide p-6 self-start z-10">
        <Leaf className="w-7 h-7 text-emerald-500 fill-emerald-500/20" />
        <span>Corn<span className="text-[#84CC16]">AI</span></span>
      </div>

      {/* Main Container: Split layout on Desktop to show the field illustration at the bottom/side */}
      <div className="w-full flex flex-col items-center justify-center flex-grow py-6 px-4 z-10">
        
        {/* Main Glassmorphic Card */}
        <div className="w-full max-w-[460px] glass-panel rounded-3xl p-8 relative overflow-hidden">
          
          {/* Decorative SVG Watermark inside card */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none scale-110 select-none">
            <svg className="w-80 h-80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 80C65 70 65 30 50 15C35 30 35 70 50 80Z" fill="#10B981" />
              <path d="M50 65C56 55 56 35 50 25C44 35 44 55 50 65Z" fill="#FBBF24" />
            </svg>
          </div>

          {/* Card Header */}
          <div className="text-center mb-6 relative">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
            <p className="text-xs text-emerald-500/80 mt-1 font-medium">Join CornAI agricultural platform</p>
          </div>

          {/* Error Panel */}
          {(validationError || authError) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium text-center">
              {validationError || authError}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-sm"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm-corp.com"
                  className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-sm"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-10 pr-10 py-2 rounded-xl text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded-md text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-10 pr-10 py-2 rounded-xl text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Optional Fields: Organization & Phone (Flex) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                  Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Farm Corp"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 555-0199"
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Remember device checkbox */}
            <div className="flex items-center gap-2.5 pl-1 pt-1 select-none">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-white/10 bg-white/5 text-emerald-600 focus:ring-emerald-500/20 focus:ring-offset-0 focus:outline-none transition-all animate-none"
              />
              <label htmlFor="remember" className="text-[11px] font-medium text-slate-400 cursor-pointer">
                Remember this device for 30 days
              </label>
            </div>

            {/* Register button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 mt-2 rounded-xl bg-[#008A2E] hover:bg-emerald-600 active:scale-[0.98] font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg border border-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-white/10 my-4"></div>

          {/* Link to Login */}
          <p className="text-xs text-center text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline ml-1">
              Login
            </Link>
          </p>

        </div>

      </div>

      {/* Decorative Farmer in Cornfield Graphic at the bottom (matching screenshot) */}
      <div className="w-full h-44 md:h-52 relative mt-auto border-t border-emerald-950/40 bg-gradient-to-t from-emerald-950/20 to-transparent overflow-hidden">
        {/* CSS/SVG representation of farmer walking in the field */}
        <div className="absolute inset-0 flex items-end justify-center select-none pointer-events-none opacity-85">
          <svg className="w-full max-w-4xl h-full" viewBox="0 0 800 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Background hills */}
            <path d="M0 200C150 150 250 160 400 180C550 200 650 140 800 200V200H0Z" fill="#0A110D" />
            <path d="M0 200C100 120 300 130 500 170C700 210 750 150 800 200V200H0Z" fill="#132317" opacity="0.6" />
            
            {/* Corn leaves on sides */}
            <path d="M-50 200C50 100 100 150 150 200" stroke="#065F46" strokeWidth="12" strokeLinecap="round" />
            <path d="M0 200C80 80 120 120 180 200" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
            <path d="M850 200C750 100 700 150 650 200" stroke="#065F46" strokeWidth="12" strokeLinecap="round" />
            <path d="M800 200C720 80 680 120 620 200" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
            
            {/* Farmer in middle walking down path */}
            <g transform="translate(385, 90)">
              {/* Straw Hat */}
              <ellipse cx="15" cy="5" rx="16" ry="4" fill="#C5A880" />
              <path d="M6 5C6 -1 24 -1 24 5" fill="#D97706" />
              {/* Head */}
              <circle cx="15" cy="11" r="5" fill="#FDBA74" />
              {/* Body / Shirt */}
              <path d="M5 28C5 18 25 18 25 28V65H5V28Z" fill="#2563EB" /> {/* Blue shirt */}
              {/* Suspenders */}
              <rect x="8" y="20" width="3" height="45" fill="#475569" />
              <rect x="19" y="20" width="3" height="45" fill="#475569" />
              {/* Pants */}
              <rect x="5" y="65" width="9" height="40" fill="#1E293B" />
              <rect x="16" y="65" width="9" height="40" fill="#1E293B" />
              {/* Path indicators */}
              <line x1="-15" y1="110" x2="-45" y2="110" stroke="#1E293B" strokeWidth="3" />
            </g>

            {/* Path perspective lines */}
            <path d="M360 200L385 170M440 200L415 170" stroke="#263E2E" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>
      </div>

    </div>
  );
};

export default Register;
