
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
  LayoutGrid
} from 'lucide-react';

// URL Google Apps Script Anda
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyyzZlziNFwGuxiEnYMynPC5_mBAaktA7mQG0SQQyzASEp6GfU4BsJjvqyXkGUZzYwC/exec"; 

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
    <div className="absolute -top-10 scale-0 rounded-md bg-black/80 px-2 py-1 text-[11px] font-semibold text-white transition-all group-hover:scale-100 backdrop-blur-md">
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

  const fetchDataFromCloud = useCallback(async () => {
    if (!SCRIPT_URL) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(SCRIPT_URL, { method: 'GET' });
      if (!response.ok) throw new Error("Gagal mengambil data.");
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setItems(data);
        localStorage.setItem('smpn3_docs', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Gagal sinkronisasi data cloud.");
      const saved = localStorage.getItem('smpn3_docs');
      if (saved) setItems(JSON.parse(saved));
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
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify({ action, data })
      });
      return true;
    } catch (error) {
      console.error("Sync error:", error);
      setError("Gagal mengirim ke cloud.");
      return false;
    } finally {
      setTimeout(() => setIsSyncing(false), 1500);
    }
  };

  const processFilesForCloud = async (files: DocFile[]) => {
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
      return f;
    }));
  };

  const handleAdd = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const processedFiles = await processFilesForCloud(formData.files);
      const newItem: DocumentationItem = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        ...formData,
        files: processedFiles as any
      };
      setItems(prev => [newItem, ...prev]);
      setView('list');
      await syncToSpreadsheet(newItem, 'add');
    } catch (e) {
      console.error(e);
      alert("Gagal memproses gambar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingId) return;
    setIsLoading(true);
    try {
      const processedFiles = await processFilesForCloud(formData.files);
      const updatedItem = {
        ...items.find(i => i.id === editingId),
        ...formData,
        files: processedFiles as any
      };
      setItems(prev => prev.map(item => item.id === editingId ? updatedItem as any : item));
      setEditingId(null);
      setView('list');
      await syncToSpreadsheet(updatedItem, 'update');
    } catch (e) {
      alert("Gagal memperbarui data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const password = prompt('Masukkan kata sandi admin:');
    if (password === 'admin123') {
      if (window.confirm('Hapus selamanya dari semua perangkat?')) {
        const itemToDelete = items.find(i => i.id === id);
        setItems(prev => prev.filter(item => item.id !== id));
        if (itemToDelete) await syncToSpreadsheet(itemToDelete, 'delete');
      }
    } else if (password !== null) {
      alert('Kata sandi salah.');
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
    item.files.forEach((file, index) => {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = `SMPN3_${item.activityName.replace(/\s+/g, '_')}_${index+1}`;
      link.click();
    });
  };

  if (currentPage === 'home') {
    return <LandingPage onEnter={() => setCurrentPage('app')} />;
  }

  const editingItem = items.find(item => item.id === editingId);

  return (
    <div className="relative h-screen w-screen font-sans overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-800">
      
      {/* Menu Bar - Compact on Mobile */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex h-7 items-center justify-between bg-white/10 px-3 md:px-4 text-[11px] md:text-[13px] font-bold text-white backdrop-blur-3xl border-b border-white/10">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="hover:bg-white/10 px-2 rounded cursor-default flex items-center gap-1.5 md:gap-2">
            <School size={14} strokeWidth={3} />
            <span className="font-extrabold truncate max-w-[80px] md:max-w-none">SMPN 3 PACET</span>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2 px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer" onClick={fetchDataFromCloud}>
            {isLoading ? (
              <RefreshCw size={12} className="animate-spin text-blue-300" />
            ) : isSyncing ? (
              <CloudUpload size={13} className="animate-bounce text-blue-300" />
            ) : error ? (
              <AlertCircle size={13} className="text-yellow-400" />
            ) : (
              <CheckCircle2 size={13} className="text-green-400" />
            )}
            <span className="text-[9px] md:text-[10px] uppercase tracking-tighter">
              {isLoading ? 'Sync' : isSyncing ? 'Push' : error ? 'Offline' : 'Online'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <Wifi size={14} className="hidden xs:block" />
          <Battery size={16} className="hidden xs:block" />
          <span className="text-[11px] md:text-[12px] font-black tabular-nums">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <main className="flex h-screen items-center justify-center p-2 md:p-6 lg:p-10 pb-20 md:pb-24 pt-10 md:pt-12">
        <div className="relative h-full w-full max-w-7xl">
          <MacWindow 
            title={editingId ? "EDITOR" : (view === 'list' ? "ARSIP DIGITAL" : "ENTRY BARU")}
            navigation={
              <>
                <div className="flex items-center gap-1 md:gap-2 bg-black/5 p-1 rounded-xl">
                  <NavItem icon={<LayoutGrid size={16} />} label="Gallery" active={view === 'list'} onClick={() => setView('list')} />
                  <NavItem icon={<PlusCircle size={16} />} label="Tambah" active={view === 'form'} onClick={() => { setView('form'); setEditingId(null); }} />
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="hidden sm:flex items-center gap-1.5 text-[#8E8E93] text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Live
                  </div>
                  <button onClick={() => setCurrentPage('home')} className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-black text-red-500 hover:bg-red-50 transition-colors">
                    <Home size={16} />
                    <span className="hidden sm:inline">Exit</span>
                  </button>
                </div>
              </>
            }
          >
            {isLoading && items.length === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-white/90">
                <div className="h-10 w-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-sm font-black text-gray-400 tracking-widest uppercase animate-pulse">Connecting...</span>
              </div>
            ) : (
              view === 'list' ? (
                <DocList items={items} onEdit={handleEditStart} onDelete={handleDelete} onDownload={handleDownload} />
              ) : (
                <DocForm onSubmit={editingId ? handleUpdate : handleAdd} onCancel={handleCancelEdit} initialData={editingItem} />
              )
            )}
          </MacWindow>
        </div>
      </main>

      {/* Dock - Compact for Mobile */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-end gap-2 md:gap-3 rounded-[24px] md:rounded-[2rem] bg-white/20 p-2 shadow-2xl backdrop-blur-3xl border border-white/20 ring-1 ring-black/5">
        <DockIcon icon={<Home className="text-blue-500" />} label="Home" onClick={() => setCurrentPage('home')} />
        <div className="h-8 md:h-10 w-px bg-white/20 mx-0.5 md:mx-1"></div>
        <DockIcon icon={<ImageIcon className="text-green-500" />} label="Gallery" active={view === 'list'} onClick={() => setView('list')} />
        <DockIcon icon={<PlusCircle className="text-purple-500" />} label="New Entry" active={view === 'form'} onClick={() => { setView('form'); setEditingId(null); }} />
        <div className="h-8 md:h-10 w-px bg-white/20 mx-0.5 md:mx-1"></div>
        <DockIcon icon={<RefreshCw className="text-orange-500" />} label="Refresh" onClick={fetchDataFromCloud} />
      </div>
    </div>
  );
};

export default App;
