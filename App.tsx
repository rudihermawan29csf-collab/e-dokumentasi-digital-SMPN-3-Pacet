import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  X,
  Trash2,
  Lock
} from 'lucide-react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwS_ZiNHJH214i_u8AF7BuZWXZopIG6YThNr96jx5pAJ_z7HBI0W0wuCER7ea1xEzQulw/exec"; 

const DB_NAME = 'SMPN3PacetDB';
const STORE_NAME = 'documentation';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveToLocalDB = async (items: DocumentationItem[]) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  items.forEach(item => store.put(item));
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
  });
};

const removeFromLocalDB = async (id: string) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.delete(id);
};

const getFromLocalDB = async (): Promise<DocumentationItem[]> => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (e) {
    return [];
  }
};

const compressImage = (base64: string, maxWidth = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(base64);
  });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

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
  
  // State untuk Modal Delete Kustom
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  const recentlyAddedIds = useRef<Set<string>>(new Set());

  const loadInitial = async () => {
    const localData = await getFromLocalDB();
    if (localData.length > 0) {
      setItems(localData.sort((a, b) => b.createdAt - a.createdAt));
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const fetchDataFromCloud = useCallback(async () => {
    if (!SCRIPT_URL || isSyncing) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(SCRIPT_URL, { method: 'GET', redirect: 'follow' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const cloudData: DocumentationItem[] = await response.json();
      if (Array.isArray(cloudData)) {
        const localData = await getFromLocalDB();
        const cloudIds = new Set(cloudData.map(i => i.id));
        const unsyncedLocal = localData.filter(i => recentlyAddedIds.current.has(i.id) && !cloudIds.has(i.id));
        const merged = [...cloudData, ...unsyncedLocal];
        const sorted = merged.sort((a, b) => b.createdAt - a.createdAt);
        setItems(sorted);
        await saveToLocalDB(sorted);
      }
    } catch (err: any) {
      setError("Offline");
    } finally {
      setIsLoading(false);
    }
  }, [isSyncing]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    if (currentPage === 'app') fetchDataFromCloud();
    return () => clearInterval(timer);
  }, [currentPage, fetchDataFromCloud]);

  const syncToSpreadsheet = async (data: any, action: string) => {
    if (!SCRIPT_URL) return false;
    setIsSyncing(true);
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data }),
        redirect: 'follow'
      });
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSyncing(false);
      setTimeout(fetchDataFromCloud, 5000);
    }
  };

  const processFilesForCloud = async (files: DocFile[]): Promise<DocFile[]> => {
    return await Promise.all(files.map(async f => {
      if (f.file instanceof File) {
        let base64 = await fileToBase64(f.file);
        if (f.type === 'image') base64 = await compressImage(base64);
        return { id: f.id, url: base64, type: f.type, name: f.file.name };
      }
      return f;
    }));
  };

  const handleAdd = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const processedFiles = await processFilesForCloud(formData.files);
      const newItem: DocumentationItem = {
        id: 'SMPN 3-' + Date.now().toString(36).toUpperCase(),
        createdAt: Date.now(),
        ...formData,
        files: processedFiles
      };
      recentlyAddedIds.current.add(newItem.id);
      setTimeout(() => recentlyAddedIds.current.delete(newItem.id), 120000);
      const newItems = [newItem, ...items];
      setItems(newItems);
      await saveToLocalDB(newItems);
      setView('list');
      await syncToSpreadsheet(newItem, 'add');
    } catch (e) {
      alert("Gagal simpan.");
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
      const updatedItem: DocumentationItem = { ...existingItem, ...formData, files: processedFiles };
      const newItems = items.map(item => item.id === editingId ? updatedItem : item);
      setItems(newItems);
      await saveToLocalDB(newItems);
      setEditingId(null);
      setView('list');
      await syncToSpreadsheet(updatedItem, 'update');
    } catch (e) {
      alert("Gagal update.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger untuk membuka modal delete
  const initiateDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeletePassword('');
    setDeleteError('');
  };

  // Eksekusi hapus setelah konfirmasi password di modal
  const confirmDelete = async () => {
    if (deletePassword.trim() === 'admin123') {
      const id = deleteTargetId;
      if (!id) return;

      const itemToDelete = items.find(i => i.id === id);
      const newItems = items.filter(item => item.id !== id);
      setItems(newItems);
      
      await removeFromLocalDB(id);
      
      if (itemToDelete) {
        syncToSpreadsheet(itemToDelete, 'delete').catch(console.error);
      }
      
      setDeleteTargetId(null);
    } else {
      setDeleteError('Sandi salah!');
    }
  };

  const handleDownload = (item: DocumentationItem) => {
    if (item.files && item.files.length > 0) {
      const fileToDownload = item.files[0];
      const link = document.createElement('a');
      link.href = fileToDownload.url;
      link.download = `Dokumentasi-${item.activityName.replace(/\s+/g, '-')}-${item.date}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Tidak ada file foto untuk diunduh.");
    }
  };

  if (currentPage === 'home') return <LandingPage onEnter={() => setCurrentPage('app')} />;

  const editingItem = items.find(item => item.id === editingId);

  return (
    <div className="flex flex-col h-screen w-screen font-sans overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#581c87] to-[#1e1b4b] relative">
      
      {/* Global Menu Bar */}
      <header className="flex-none z-[100] flex h-8 items-center justify-between bg-black/20 px-4 text-[13px] font-bold text-white backdrop-blur-3xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-default transition-colors">
            <School size={14} className="inline mr-2 mb-0.5" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-black">macOS Documenter</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Wifi size={14} className="opacity-70" />
          <Battery size={16} className="opacity-70" />
          <span className="text-[11px] font-black tabular-nums tracking-tighter">
            {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 flex items-center justify-center relative p-3 sm:p-4 md:p-8 lg:p-10 pb-20 md:pb-24 overflow-hidden">
        <div className="w-full h-full max-w-7xl animate-scale-in">
          <MacWindow 
            title={editingId ? "EDITOR MODE" : (view === 'list' ? "GALERI DOKUMENTASI" : "ENTRY DATA BARU")}
            brand={
              <div className="flex items-center gap-2">
                <School size={16} strokeWidth={3} className="text-[#007AFF]" />
                <span className="font-extrabold uppercase tracking-tight text-[11px] md:text-[13px] text-gray-800 whitespace-nowrap">
                  SMPN 3 PACET
                </span>
              </div>
            }
            status={
              <div 
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all cursor-pointer ${error ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-green-50 border-green-200 text-green-600'}`}
                onClick={() => setShowDiagnostic(true)}
              >
                {isSyncing || isLoading ? (
                  <RefreshCw size={10} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={10} strokeWidth={3} />
                )}
                <span className="text-[9px] uppercase tracking-widest font-black hidden xs:inline">
                  {isSyncing ? 'Sync' : error ? 'Offline' : 'Online'}
                </span>
              </div>
            }
            navigation={
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl overflow-x-auto no-scrollbar">
                  <button onClick={() => setView('list')} className={`whitespace-nowrap px-3 md:px-5 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all ${view === 'list' ? 'bg-[#007AFF] text-white shadow-md' : 'text-gray-600 hover:bg-black/5'}`}>Gallery</button>
                  <button onClick={() => { setView('form'); setEditingId(null); }} className={`whitespace-nowrap px-3 md:px-5 py-1.5 rounded-lg text-[11px] md:text-xs font-bold transition-all ${view === 'form' ? 'bg-[#007AFF] text-white shadow-md' : 'text-gray-600 hover:bg-black/5'}`}>Tambah</button>
                </div>
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                   <div className="hidden sm:block px-3 py-1 bg-black/5 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-tighter">{items.length} ITEM</div>
                   <button onClick={() => setCurrentPage('home')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Home size={18} /></button>
                </div>
              </div>
            }
          >
            {isLoading && items.length === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Memuat...</span>
              </div>
            ) : (
              view === 'list' ? (
                <DocList items={items} onEdit={(item) => { setEditingId(item.id); setView('form'); }} onDelete={initiateDelete} onDownload={handleDownload} />
              ) : (
                <DocForm onSubmit={editingId ? handleUpdate : handleAdd} onCancel={() => setView('list')} initialData={editingItem} />
              )
            )}
          </MacWindow>
        </div>
      </main>

      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[110] flex items-end gap-2 md:gap-3 rounded-[2rem] bg-white/20 p-2 shadow-2xl backdrop-blur-3xl border border-white/20 ring-1 ring-black/5 scale-[0.85] sm:scale-90 md:scale-100 origin-bottom">
        <button onClick={() => setCurrentPage('home')} className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg transition-all hover:scale-125 hover:-translate-y-2"><Home size={22} className="text-blue-500"/></button>
        <div className="h-10 w-px bg-white/20 mx-1"></div>
        <button onClick={() => setView('list')} className={`flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg transition-all hover:scale-125 hover:-translate-y-2 ${view === 'list' ? 'ring-2 ring-white shadow-xl' : ''}`}><ImageIcon size={22} className="text-emerald-500"/></button>
        <button onClick={() => { setView('form'); setEditingId(null); }} className={`flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg transition-all hover:scale-125 hover:-translate-y-2 ${view === 'form' ? 'ring-2 ring-white shadow-xl' : ''}`}><PlusCircle size={22} className="text-violet-500"/></button>
        <div className="h-10 w-px bg-white/20 mx-1"></div>
        <button onClick={fetchDataFromCloud} className="flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg transition-all hover:scale-125 hover:-translate-y-2"><RefreshCw size={22} className="text-amber-500"/></button>
      </div>

      {showDiagnostic && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 z-[150] w-[90%] md:w-80 p-6 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-black/10 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black uppercase text-gray-500">Info Koneksi</h3>
            <button onClick={() => setShowDiagnostic(false)} className="text-gray-400 hover:text-black"><X size={18}/></button>
          </div>
          <div className="bg-black/5 p-4 rounded-2xl mb-4">
            <p className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Database Cloud</p>
            <p className={`text-xs font-bold ${error ? 'text-red-600' : 'text-green-600'}`}>{error ? 'Terputus' : 'Aktif'}</p>
          </div>
          <button onClick={() => { fetchDataFromCloud(); setShowDiagnostic(false); }} className="w-full bg-blue-600 text-white text-[11px] font-black py-3 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/30 uppercase transition-all active:scale-95">Refresh Cloud</button>
        </div>
      )}

      {/* MODAL KONFIRMASI DELETE KUSTOM */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setDeleteTargetId(null)}>
          <div className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 ring-1 ring-black/10 scale-100 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="mx-auto w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <Trash2 className="text-red-500" size={28} />
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Hapus Dokumentasi?</h3>
              <p className="text-xs font-medium text-gray-500 mt-2 px-4 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Data akan dihapus dari arsip sekolah secara permanen.
              </p>
            </div>
            
            <div className="relative mb-4">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="password" 
                placeholder="Masukkan Sandi Admin"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-3.5 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-red-500/20 transition-all outline-none"
                autoFocus
              />
            </div>
            
            {deleteError && (
              <div className="flex items-center gap-2 justify-center mb-4 text-red-500 bg-red-50 py-2 rounded-lg">
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-wide">{deleteError}</span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button 
                onClick={() => setDeleteTargetId(null)} 
                className="py-3 rounded-xl bg-gray-100 text-xs font-black text-gray-600 hover:bg-gray-200 transition-colors uppercase tracking-wide"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                className="py-3 rounded-xl bg-red-500 text-xs font-black text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 uppercase tracking-wide hover:scale-[1.02] active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;