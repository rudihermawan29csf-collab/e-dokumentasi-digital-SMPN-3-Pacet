
import React, { useState, useEffect } from 'react';
import { MacWindow } from './components/MacWindow';
import { DocForm } from './components/DocForm';
import { DocList } from './components/DocList';
import { LandingPage } from './components/LandingPage';
import { DocumentationItem, FormData } from './types';
import { 
  School, 
  PlusCircle, 
  Home, 
  Wifi, 
  Battery, 
  Search as SearchIcon, 
  Settings,
  Image as ImageIcon,
  Monitor,
  CloudUpload,
  CheckCircle2
} from 'lucide-react';

// URL Apps Script untuk sinkronisasi Spreadsheet
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyzZlziNFwGuxiEnYMynPC5_mBAaktA7mQG0SQQyzASEp6GfU4BsJjvqyXkGUZzYwC/exec"; 

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
      active 
        ? 'bg-[#007AFF] text-white shadow-sm' 
        : 'text-[#424242] hover:bg-black/5'
    }`}
  >
    <span className={active ? 'text-white' : 'text-[#007AFF]'}>{icon}</span>
    {label}
  </button>
);

const DockIcon: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <div className="group relative flex flex-col items-center">
    <div className="absolute -top-10 scale-0 rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold text-white transition-all group-hover:scale-100 backdrop-blur-md">
      {label}
    </div>
    <button
      onClick={onClick}
      className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg ring-1 ring-white/20 transition-all hover:scale-125 hover:-translate-y-2 active:scale-95 backdrop-blur-xl ${
        active ? 'after:absolute after:-bottom-2 after:h-1 after:w-1 after:rounded-full after:bg-white/80' : ''
      }`}
    >
      <div className="transition-transform group-hover:scale-110">
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const saved = localStorage.getItem('smpn3_docs');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load local storage", e);
      }
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('smpn3_docs', JSON.stringify(items));
  }, [items]);

  const syncToSpreadsheet = async (data: DocumentationItem) => {
    if (!SCRIPT_URL) return;
    setIsSyncing(true);
    try {
      // Kita kirim data sebagai JSON string ke Apps Script
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      console.log("Synced to Spreadsheet successfully");
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      // Beri sedikit delay agar indikator sinkronisasi terlihat oleh user
      setTimeout(() => setIsSyncing(false), 1500);
    }
  };

  const handleAdd = async (data: FormData) => {
    const newItem: DocumentationItem = {
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      ...data,
    };
    setItems(prev => [newItem, ...prev]);
    setView('list');
    await syncToSpreadsheet(newItem);
  };

  const handleUpdate = (data: FormData) => {
    if (!editingId) return;
    setItems(prev => prev.map(item => 
      item.id === editingId ? { ...item, ...data } : item
    ));
    setEditingId(null);
    setView('list');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus dokumen ini secara permanen?')) {
      setItems(prev => prev.filter(item => item.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleEditStart = (item: DocumentationItem) => {
    setEditingId(item.id);
    setView('form');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setView('list');
  };

  const handleDownload = (item: DocumentationItem) => {
    if (item.files.length === 0) return alert("Tidak ada file.");
    item.files.forEach((file, index) => {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = `Doc_${item.activityName.replace(/\s+/g, '_')}_${index+1}`;
      link.click();
    });
  };

  if (currentPage === 'home') {
    return <LandingPage onEnter={() => setCurrentPage('app')} />;
  }

  const editingItem = items.find(item => item.id === editingId);

  return (
    <div className="relative h-screen w-screen font-sans overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-800">
      
      {/* macOS Top Menu Bar */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex h-7 items-center justify-between bg-white/10 px-4 text-[13px] font-semibold text-white backdrop-blur-2xl border-b border-white/10">
        <div className="flex items-center gap-5">
          <div className="hover:bg-white/10 px-2 rounded cursor-default">
            <School size={15} strokeWidth={3} />
          </div>
          <span className="font-extrabold cursor-default px-2">SMPN 3 PACET</span>
          <div className="flex items-center gap-1 opacity-90 font-medium cursor-default hover:bg-white/10 px-2 rounded">
            {isSyncing ? (
              <CloudUpload size={14} className="animate-bounce text-blue-300" />
            ) : (
              <CheckCircle2 size={14} className="text-green-400" />
            )}
            <span className="text-[11px]">{isSyncing ? 'Sinkronisasi...' : 'Tersinkron'}</span>
          </div>
        </div>
        <div className="flex items-center gap-5 pr-2">
          <div className="flex items-center gap-2">
            <Wifi size={14} />
            <Battery size={16} />
          </div>
          <div className="flex items-center gap-2">
            <SearchIcon size={14} />
            <span className="cursor-default tracking-tight">
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Desktop Area */}
      <main className="flex h-screen items-center justify-center p-4 md:p-8 pb-24 md:pb-32 pt-12 animate-fade-in">
        <div className="relative h-full w-full max-w-7xl animate-scale-in">
          <MacWindow 
            title={editingId ? "Editor Kegiatan" : (view === 'list' ? "Arsip Foto & Dokumentasi" : "Input Kegiatan Baru")}
            sidebar={
              <div className="space-y-6 mt-2">
                <div>
                  <h3 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">Pustaka Digital</h3>
                  <div className="space-y-0.5">
                    <SidebarItem 
                      icon={<ImageIcon size={16} />} 
                      label="Semua Foto" 
                      active={view === 'list'} 
                      onClick={() => setView('list')}
                    />
                    <SidebarItem 
                      icon={<PlusCircle size={16} />} 
                      label="Input Baru" 
                      active={view === 'form'} 
                      onClick={() => { setView('form'); setEditingId(null); }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">Sekolah</h3>
                  <SidebarItem icon={<Monitor size={16} />} label="Profil Sekolah" active={false} onClick={() => {}} />
                  <SidebarItem icon={<Settings size={16} />} label="Sistem" active={false} onClick={() => {}} />
                </div>
                <div className="pt-4 border-t border-black/5">
                  <SidebarItem icon={<Home size={16} />} label="Log Out" active={false} onClick={() => setCurrentPage('home')} />
                </div>
              </div>
            }
          >
            {view === 'list' ? (
              <DocList items={items} onEdit={handleEditStart} onDelete={handleDelete} onDownload={handleDownload} />
            ) : (
              <DocForm onSubmit={editingId ? handleUpdate : handleAdd} onCancel={handleCancelEdit} initialData={editingItem} />
            )}
          </MacWindow>
        </div>
      </main>

      {/* macOS Dock */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-end gap-2 md:gap-3 rounded-[24px] bg-white/20 p-2 md:p-2.5 shadow-2xl backdrop-blur-3xl border border-white/20 ring-1 ring-black/5 max-w-[95vw] overflow-x-auto">
        <DockIcon 
          icon={<Home className="text-blue-500 fill-blue-500/20" />} 
          label="Finder" 
          onClick={() => setCurrentPage('home')} 
        />
        <div className="h-10 w-[0.5px] bg-white/20 mx-1 mb-1"></div>
        <DockIcon 
          icon={<ImageIcon className="text-[#34C759] fill-[#34C759]/20" />} 
          label="Foto Dokumentasi" 
          active={view === 'list'} 
          onClick={() => setView('list')} 
        />
        <DockIcon 
          icon={<PlusCircle className="text-[#AF52DE] fill-[#AF52DE]/20" />} 
          label="Tambah Data" 
          active={view === 'form'} 
          onClick={() => { setView('form'); setEditingId(null); }} 
        />
        <div className="h-10 w-[0.5px] bg-white/20 mx-1 mb-1"></div>
        <DockIcon 
          icon={<Settings className="text-[#8E8E93] fill-gray-500/20" />} 
          label="Pengaturan" 
          onClick={() => {}} 
        />
      </div>
    </div>
  );
};

export default App;
