import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Mail, Lock, Key, ArrowRight, ArrowLeft, Leaf, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  // States: 'request' | 'reset'
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [testPinCode, setTestPinCode] = useState(''); // Exposed in UI for easy testing

  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.forgotPassword(email);
      setSuccessMsg('Reset code generated successfully! Check below for your code.');
      
      // Save code for display in UI (development convenience)
      if (data.resetCode) {
        setTestPinCode(data.resetCode);
      }
      setStep('reset');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to request reset code. Ensure email is registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!resetCode || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, resetCode, newPassword);
      setSuccessMsg('Password reset successful! Redirecting to login screen...');
      setTestPinCode('');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to reset password. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1611] flex flex-col justify-between p-6 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-lime-950/20 blur-[120px] pointer-events-none"></div>

      {/* Top Logo */}
      <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-2xl tracking-wide self-start z-10">
        <Leaf className="w-7 h-7 text-emerald-500 fill-emerald-500/20" />
        <span>Corn<span className="text-[#84CC16]">AI</span></span>
      </div>

      {/* Card container */}
      <div className="w-full max-w-[440px] mx-auto my-auto glass-panel rounded-3xl p-8 relative overflow-hidden z-10">
        
        {/* SVG Decorative Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none scale-110 select-none">
          <svg className="w-80 h-80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 80C65 70 65 30 50 15C35 30 35 70 50 80Z" fill="#10B981" />
            <path d="M50 65C56 55 56 35 50 25C44 35 44 55 50 65Z" fill="#FBBF24" />
          </svg>
        </div>

        {/* Card Header */}
        <div className="text-center mb-6 relative">
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-emerald-500/80 mt-1 font-medium">Recover access to your account</p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: REQUEST CODE */}
        {step === 'request' && (
          <form onSubmit={handleRequestCode} className="space-y-6 relative">
            <p className="text-xs text-slate-400 leading-normal">
              Enter your registered email address. We will generate a 6-digit password reset code to help you set a new password.
            </p>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#008A2E] hover:bg-emerald-600 active:scale-[0.98] font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Request Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY & RESET */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4 relative">
            
            {/* Development testing box containing generated code */}
            {testPinCode && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-semibold mb-4 text-center">
                🛠️ Development Test PIN: <span className="font-mono text-white text-sm select-all tracking-wider ml-1">{testPinCode}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase pl-1">Email</label>
              <input
                type="text"
                readOnly
                value={email}
                className="w-full glass-input px-4 py-2 rounded-xl text-xs opacity-65 cursor-not-allowed"
              />
            </div>

            {/* Reset code */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1 block">
                6-Digit Reset Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 524912"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-mono tracking-widest text-center"
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1 block">
                New Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1 block">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 mt-2 rounded-xl bg-[#008A2E] hover:bg-emerald-600 active:scale-[0.98] font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="border-t border-white/10 my-5"></div>

        {/* Back to Login Link */}
        <Link 
          to="/login" 
          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>

      </div>

      {/* Footer */}
      <div className="text-[10px] text-center text-slate-500 mt-6 z-10 select-none">
        © 2026 CornAI. Sustainable computer-vision diagnostics support.
      </div>
      
    </div>
  );
};

export default ForgotPassword;
