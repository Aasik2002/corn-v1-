import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Building, Save, LogOut, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate fields from context user state
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phoneNumber || '');
      setOrganization(user.organization || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!fullName || !email) {
      setErrorMsg('Full Name and Email Address are required.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        fullName,
        email,
        phoneNumber,
        organization,
      });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update profile changes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-12">
      
      {/* Title Header */}
      <div className="relative inline-block px-8 py-3.5 glass-panel rounded-2xl border-emerald-500/20 mb-8">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br-lg"></div>
        <h1 className="text-xl font-bold text-white tracking-wide uppercase">Profile Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar display and sign out */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-between gap-6 border-white/5 h-fit text-center">
          
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">User Profile Info</span>
            
            {/* Avatar Circle Container */}
            <div className="relative group w-28 h-28 mx-auto">
              <div className="w-full h-full rounded-full bg-emerald-950/40 border-2 border-emerald-500/30 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-400">
                {fullName ? (
                  <span className="text-emerald-400 font-extrabold text-4xl select-none">
                    {fullName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-12 h-12 text-emerald-400" />
                )}
              </div>
              
              {/* Edit Icon Overlay */}
              <button 
                type="button" 
                className="absolute bottom-1 right-1 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg cursor-pointer transition-colors active:scale-95"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-white tracking-tight leading-tight">{fullName || 'Farmer Name'}</h2>
              <p className="text-xs text-[#84CC16] mt-0.5 font-bold uppercase tracking-wider">{organization || 'Independent'}</p>
              <p className="text-[10px] text-slate-500 mt-2 font-mono">Member since: 2026</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-400 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-6 border-white/5">
          
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-3.5 mb-6">
            Account Details
          </span>

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm-corp.com"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 555-0199"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1 block">
                Organization / Farm
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Corn Growers Association"
                  className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#008A2E] hover:bg-emerald-600 font-bold text-white text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default Profile;
