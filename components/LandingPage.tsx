import React from 'react';
import { Camera, FileText, ChevronRight, School } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="relative h-screen w-screen overflow-x-hidden overflow-y-auto bg-transparent">
      {/* Animated Background Blobs - Fixed and behind everything */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-[30rem] h-[30rem] bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-full w-full p-4 md:p-8 py-16">
        <div className="max-w-5xl w-full text-center space-y-8 md:space-y-12">
          
          {/* Logo Section - Framed Inside a Camera Lens */}
          <div className="relative mx-auto w-32 h-32 md:w-44 md:h-44 flex items-center justify-center animate-float">
            {/* Viewfinder Corners */}
            <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl-sm"></div>
            <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr-sm"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl-sm"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br-sm"></div>
            
            {/* Lens Barrel / Body */}
            <a 
              href="https://www.instagram.com/spen3pacet?igsh=MWNldXhnZ2l6bXZ4Zw==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative block w-28 h-28 md:w-36 md:h-36 rounded-full shadow-2xl overflow-hidden ring-4 md:ring-8 ring-black/40 bg-zinc-900 border-2 md:border-4 border-zinc-800 transition-all hover:scale-110 active:scale-95 group"
              title="Kunjungi Instagram SMPN 3 PACET"
            >
              <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-white/20"></div>
              <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="absolute inset-0 z-10 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none"></div>

              <div className="relative w-full h-full bg-white p-3 md:p-4 flex items-center justify-center">
                <img 
                  src="https://iili.io/fkGmlUP.png" 
                  alt="Logo SMPN 3 PACET" 
                  className="w-full h-full object-contain grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
            </a>
            
            {/* Camera 'Focus' Indicator */}
            <div className="absolute -right-8 md:-right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-60">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[8px] md:text-[10px] font-black text-white tracking-tighter uppercase">REC</span>
            </div>
          </div>

          {/* Hero Text with Lighting Effect */}
          <div className="space-y-4 md:space-y-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl leading-tight">
              <span className="text-shine">Dokumentasi</span> <br />
              <span className="text-shine">Digital Sekolah</span>
            </h1>
            <p className="text-base md:text-xl text-white font-semibold max-w-2xl mx-auto leading-relaxed drop-shadow-xl bg-black/20 rounded-2xl py-4 px-6 md:px-8 backdrop-blur-md border border-white/10">
              Simpan, kelola, dan akses arsip foto serta dokumen kegiatan <br className="hidden md:block" /> 
              <span className="text-blue-300">SMPN 3 PACET</span> dengan antarmuka modern yang elegan.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center justify-center gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={onEnter}
              className="group relative flex items-center gap-3 px-8 md:px-12 py-4 md:py-6 bg-white text-indigo-950 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-2xl shadow-2xl shadow-white/10 transition-all hover:scale-105 active:scale-95 hover:shadow-white/30"
            >
              Masuk ke Sistem
              <ChevronRight className="transition-transform group-hover:translate-x-1" strokeWidth={3} />
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 pt-8 md:pt-16 animate-fade-in-up px-2" style={{ animationDelay: '0.4s' }}>
            <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] text-left space-y-4 transition-all hover:-translate-y-2 hover:bg-white/20 shadow-2xl border border-white/20">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <Camera size={28} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-xl">Dokumentasi Foto</h3>
                <p className="text-sm text-white/80 font-medium leading-relaxed mt-2">Upload hingga 10 foto per kegiatan dengan preview instan beresolusi tinggi.</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] text-left space-y-4 transition-all hover:-translate-y-2 hover:bg-white/20 shadow-2xl border border-white/20">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-xl">Arsip PDF</h3>
                <p className="text-sm text-white/80 font-medium leading-relaxed mt-2">Lampirkan laporan kegiatan resmi dalam format PDF agar arsip lebih lengkap.</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] text-left space-y-4 transition-all hover:-translate-y-2 hover:bg-white/20 shadow-2xl border border-white/20 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                <School size={28} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-xl">Pustaka Sekolah</h3>
                <p className="text-sm text-white/80 font-medium leading-relaxed mt-2">Pusat informasi visual yang aman dan terorganisir untuk seluruh civitas sekolah.</p>
              </div>
            </div>
          </div>

          {/* Footer Branding - Updated with new text */}
          <div className="pt-8 md:pt-12 pb-6 space-y-2">
            <div className="text-white/80 font-black text-xs md:text-sm tracking-[0.2em] uppercase drop-shadow-md">
              E-DOKUMENTASI DIGITAL SMPN 3 PACET
            </div>
            <div className="text-white/40 font-bold text-[10px] tracking-[0.4em] uppercase">
              CREATE BY ERHA @2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};