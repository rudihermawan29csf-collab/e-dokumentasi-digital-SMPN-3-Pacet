
import React, { useState, useEffect, useCallback } from 'react';
import { MacWindow } from './components/MacWindow.tsx';
import { DocForm } from './components/DocForm.tsx';
import { DocList } from './components/DocList.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { DocumentationItem, FormData, DocFile } from './types.ts';
import { 
  School, 
  PlusCircle, 
  Home, 
  Wifi, 
  Battery, 
  Search as SearchIcon, 
  Settings,
  Image as ImageIcon,
  CloudUpload,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  Info,
  X
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Link yang Anda berikan
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyErX1k4jAQ6kZaWDTi5-Oy3wfYFE-ivk5cqMHlbn5saxSwDmz2rOEuMmEIuI2P13Rh/exec"; 

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-3 md:px-4 py-1.5 text-[11px] md:text-[13px] font-bold transition-all ${
      active 
        ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/20' 
        : 'text-[#424242] hover:bg-black/5'
    }`}
  >
    <span className={active ? 'text-white' : 'text-[#007AFF]'}>{icon}</span>
    <span className={label === 'Gallery' || label === 'Tambah' ? 'block' : 'hidden sm:block'}>{label}</span>
  </button>
);

const DockIcon: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <div className="group relative flex flex-col items-center">
    <div className="absolute -top-10 scale-0 rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold text-white transition-all group-hover:scale-100 backdrop-blur-md whitespace-nowrap">
      {label}
    </div>
    <button
      onClick={onClick}
      className={`relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg ring-1 ring-white/20 transition-all hover:scale-125 hover:-translate-y-2 active:scale-95 backdrop-blur-xl ${
        active ? 'after:absolute after:-bottom-2 after:h-1 after:w-1 after:rounded-full after:bg-white/80' : ''
      }`}
    >
      <div className="transition-transform group-hover:scale-110">
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
    </button>
  </div>
);

const App: React.FC = () => {
  const [items, setItems] = useState<DocumentationItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'form'>('list'); 
  const [currentPage, setCurrentPage] = useState<'home' | 'app'>('home');
  const [time, setTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const fetchDataFromCloud = useCallback(async () => {
    if (!SCRIPT_URL) return;
    setIsLoading(true);
    
    try {
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(SCRIPT_URL + cacheBuster, {
        method: 'GET',
        redirect: 'follow'
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const contentType = response.headers.get("content-type");
      // Google redirects to login page (HTML) if not public
      if (contentType && contentType.includes("text/html")) {
        throw new Error("Izin Akses Ditolak");
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        setItems(data);
        localStorage.setItem('smpn3_docs', JSON.stringify(data));
        setError(null);
      } else {
        throw new Error("Format Data Salah");
      }
    } catch (err: any) {
      console.warn("Connectivity diagnostic:", err.message);
      const saved = localStorage.getItem('smpn3_docs');
      if (saved) {
        setItems(JSON.parse(saved));
        setError(err.message === "Izin Akses Ditolak" ? "Izin Cloud Ditolak" : "Mode Offline");
      } else {
        setError("Gagal Terhubung");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    if (currentPage === 'app') {
      fetchDataFromCloud();
    }
    return () => clearInterval(timer);
  }, [currentPage, fetchDataFromCloud]);

  const syncToSpreadsheet = async (data: any, action: string) => {
    if (!SCRIPT_URL) return false;
    setIsSyncing(true);
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, data })
      });
      return true;
    } catch (error) {
      console.error("Sync failure:", error);
      return false;
    } finally {
      setTimeout(() => setIsSyncing(false), 1500);
    }
  };

  const improveDescription = async (text: string): Promise<string> => {
    if (!text) return text;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Tolong perbaiki dan buat deskripsi kegiatan sekolah berikut menjadi lebih profesional, menarik, dan informatif untuk laporan dokumentasi SMPN 3 PACET. Gunakan bahasa Indonesia yang baik: "${text}"`,
      });
      return response.text || text;
    } catch (e) {
      return text;
    }
  };

  const processFilesForCloud = async (files: DocFile[]): Promise<DocFile[]> => {
    return await Promise.all(files.map(async f => {
      if (f.file instanceof File) {
        const base64 = await fileToBase64(f.file);
        return { 
          id: f.id, 
          url: base64, 
          type: f.type,
          name: f.file.name 
        };
      }
      return {
        id: f.id,
        url: f.url,
        type: f.type,
        name: f.name || 'file'
      };
    }));
  };

  const handleAdd = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const processedFiles = await processFilesForCloud(formData.files);
      const newItem: DocumentationItem = {
        id: 'DOC-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        createdAt: Date.now(),
        ...formData,
        files: processedFiles
      };
      
      const newItems = [newItem, ...items];
      setItems(newItems);
      localStorage.setItem('smpn3_docs', JSON.stringify(newItems));
      setView('list');
      
      const success = await syncToSpreadsheet(newItem, 'add');
      if (!success) setError("Tersimpan Lokal (Cloud Gagal)");
      
    } catch (e) {
      alert("Gagal memproses data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingId) return;
    setIsLoading(true);
    try {
      const processedFiles = await processFilesForCloud(formData.files);
      const existingItem = items.find(i => i.id === editingId);
      if (!existingItem) return;

      const updatedItem: DocumentationItem = {
        ...existingItem,
        ...formData,
        files: processedFiles
      };
      
      const newItems = items.map(item => item.id === editingId ? updatedItem : item);
      setItems(newItems);
      localStorage.setItem('smpn3_docs', JSON.stringify(newItems));
      setEditingId(null);
      setView('list');
      
      await syncToSpreadsheet(updatedItem, 'update');
    } catch (e) {
      alert("Gagal memperbarui.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const password = prompt('Sandi Admin (admin123):');
    if (password === 'admin123') {
      if (window.confirm('Hapus dari Pustaka & Cloud?')) {
        const itemToDelete = items.find(i => i.id === id);
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        localStorage.setItem('smpn3_docs', JSON.stringify(newItems));
        if (itemToDelete) await syncToSpreadsheet(itemToDelete, 'delete');
      }
    } else if (password !== null) {
      alert('Sandi salah.');
    }
  };

  if (currentPage === 'home') {
    return <LandingPage onEnter={() => setCurrentPage('app')} />;
  }

  const editingItem = items.find(item => item.id === editingId);

  return (
    <div className="relative h-screen w-screen font-sans overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#581c87] to-[#1e1b4b]">
      
      {/* macOS Menu Bar */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex h-7 items-center justify-between bg-white/10 px-4 text-[13px] font-bold text-white backdrop-blur-3xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 hover:bg-white/10 rounded cursor-default transition-colors">
            <School size={14} strokeWidth={3} />
            <span className="font-extrabold tracking-tight">SMPN 3 PACET</span>
          </div>
          
          <div 
            className={`flex items-center gap-2 px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer transition-all ${error ? 'animate-pulse' : ''}`}
            onClick={() => setShowDiagnostic(!showDiagnostic)}
          >
            {isLoading ? (
              <RefreshCw size={12} className="animate-spin text-blue-300" />
            ) : error ? (
              <AlertCircle size={13} className={error === 'Mode Offline' ? 'text-orange-400' : 'text-red-400'} />
            ) : (
              <CheckCircle2 size={13} className="text-green-400" />
            )}
            <span className="text-[10px] uppercase tracking-widest opacity-80">
              {isLoading ? 'Syncing' : error ? error : 'Cloud Active'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pr-1">
          <SearchIcon size={14} className="opacity-70 hover:opacity-100 cursor-pointer" />
          <Wifi size={14} />
          <Battery size={16} />
          <span className="text-[12px] font-black tabular-nums tracking-tighter">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Diagnostic Panel */}
      {showDiagnostic && error && (
        <div className="absolute top-10 left-4 z-[110] w-72 p-4 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-black/10 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest">Diagnostic Tool</h3>
            <button onClick={() => setShowDiagnostic(false)}><X size={14}/></button>
          </div>
          <p className="text-sm font-bold text-red-600 mb-2">Masalah: {error}</p>
          <div className="space-y-2 text-[11px] text-gray-700 leading-relaxed font-medium bg-black/5 p-3 rounded-xl">
            <p>1. Pastikan Apps Script diatur ke <span className="font-black text-blue-600">"Anyone"</span>.</p>
            <p>2. Pastikan Anda sudah klik <span className="font-black">Deploy</span> baru setelah update.</p>
            <p>3. Cek apakah kuota harian Google tercapai.</p>
          </div>
          <button 
            onClick={() => { fetchDataFromCloud(); setShowDiagnostic(false); }}
            className="w-full mt-4 bg-blue-600 text-white text-xs font-black py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            SINKRON ULANG
          </button>
        </div>
      )}

      <main className="flex h-screen items-center justify-center p-3 md:p-10 pt-12 pb-24">
        <div className="relative h-full w-full max-w-7xl animate-scale-in">
          <MacWindow 
            title={editingId ? "EDITOR" : (view === 'list' ? "PUSTAKA DIGITAL" : "ENTRY BARU")}
            navigation={
              <>
                <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
                  <NavItem icon={<LayoutGrid size={16} />} label="Gallery" active={view === 'list'} onClick={() => setView('list')} />
                  <NavItem icon={<PlusCircle size={16} />} label="Tambah" active={view === 'form'} onClick={() => { setView('form'); setEditingId(null); }} />
                </div>
                
                <div className="flex items-center gap-4">
                  <button onClick={fetchDataFromCloud} className="p-2 hover:bg-black/5 rounded-full transition-all active:rotate-180">
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={() => setCurrentPage('home')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black text-red-500 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
                    <Home size={16} />
                    <span className="hidden sm:inline">HOME</span>
                  </button>
                </div>
              </>
            }
          >
            {isLoading && items.length === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                  <School className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
                </div>
                <span className="text-sm font-black text-gray-400 tracking-[0.2em] uppercase animate-pulse">Menghubungkan ke Cloud...</span>
              </div>
            ) : (
              view === 'list' ? (
                <DocList items={items} onEdit={(item) => { setEditingId(item.id); setView('form'); }} onDelete={handleDelete} onDownload={(item) => item.files.forEach(f => window.open(f.url))} />
              ) : (
                <DocForm 
                  onSubmit={editingId ? handleUpdate : handleAdd} 
                  onCancel={() => setView('list')} 
                  initialData={editingItem}
                  onImprove={improveDescription}
                />
              )
            )}
          </MacWindow>
        </div>
      </main>

      {/* macOS Dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-end gap-3 rounded-[2rem] bg-white/20 p-2 shadow-2xl backdrop-blur-3xl border border-white/20 ring-1 ring-black/5">
        <DockIcon icon={<Home className="text-blue-500" />} label="Home" onClick={() => setCurrentPage('home')} />
        <div className="h-10 w-px bg-white/20 mx-1"></div>
        <DockIcon icon={<ImageIcon className="text-green-500" />} label="Arsip Foto" active={view === 'list'} onClick={() => setView('list')} />
        <DockIcon icon={<PlusCircle className="text-purple-500" />} label="Baru" active={view === 'form'} onClick={() => { setView('form'); setEditingId(null); }} />
        <div className="h-10 w-px bg-white/20 mx-1"></div>
        <DockIcon icon={<RefreshCw className="text-orange-500" />} label="Sync Cloud" onClick={fetchDataFromCloud} />
        <DockIcon icon={<Settings className="text-gray-400" />} label="Pengaturan" onClick={() => setShowDiagnostic(true)} />
      </div>
    </div>
  );
};

export default App;
