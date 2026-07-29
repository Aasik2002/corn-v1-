import React from 'react';
import { Leaf, Award, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-12 space-y-8">
      
      {/* Title Header */}
      <div className="relative inline-block px-8 py-3.5 glass-panel rounded-2xl border-emerald-500/20">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br-lg"></div>
        <h1 className="text-xl font-bold text-white tracking-wide uppercase">About CornAI</h1>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="glass-panel rounded-3xl p-8 border-white/5 space-y-6">
        
        <div className="flex items-center gap-3 text-[#84CC16] font-bold text-sm border-b border-white/5 pb-4">
          <BookOpen className="w-5 h-5" />
          <span>Our Mission</span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          CornAI is a state-of-the-art agricultural decision support system designed to help farmers, agronomists, and independent growers identify and treat crop diseases instantly. Powered by advanced deep learning computer vision algorithms, CornAI analyzes photographs of corn plant leaves to detect fungal and bacterial pathogens in real-time, providing immediate actionable remedies.
        </p>

        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          By catching infections early, CornAI aims to prevent widespread crop losses, optimize pesticide applications, reduce environmental footprints, and improve agricultural yields sustainably.
        </p>

      </div>

      {/* Model Supported Classes Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white tracking-wide uppercase pl-2">Supported Classifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Class 1: Common Rust */}
          <div className="glass-panel rounded-3xl p-6 border-white/5 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Common Rust</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Elongated, golden-brown pustules on leaf surfaces caused by <em>Puccinia sorghi</em>. Common in cooler, moist climates.
            </p>
          </div>

          {/* Class 2: Gray Leaf Spot */}
          <div className="glass-panel rounded-3xl p-6 border-white/5 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Gray Leaf Spot</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tan or gray rectangular block lesions restricted by leaf veins. Caused by <em>Cercospora zeae-maydis</em> under high humidity.
            </p>
          </div>

          {/* Class 3: Healthy Leaf */}
          <div className="glass-panel rounded-3xl p-6 border-white/5 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Healthy Leaf</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Leaf structures show normal chlorophyll densities and are free of lesions or pathogen spots.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default About;
