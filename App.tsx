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
  Search as SearchIcon, 
  Settings,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  X
} from 'lucide-react';

// URL WEB APP DARI USER
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwS_ZiNHJH214i_u8AF7BuZWXZopIG6YThNr96jx5pAJ_z7HBI0W0wuCER7ea1xEzQulw/exec"; 

// --- DATABASE UTILITY (INDEXED DB) ---
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
  // Gunakan put agar tidak menghapus data yang sudah ada tapi tidak ada di list kiriman
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

// Fungsi Kompresi Gambar agar Base64 tidak terlalu besar untuk Google Sheets (Limit sel 50k char)
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
  
  // Track IDs yang baru dibuat secara lokal agar tidak tertimpa data Cloud yang lama
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
      const response = await fetch(SCRIPT_URL, {
        method: 'GET',
        redirect: 'follow',
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const cloudData: DocumentationItem[] = await response.json();
      
      if (Array.isArray(cloudData)) {
        const localData = await getFromLocalDB();
        
        // Logic Smart Merging: 
        // 1. Ambil semua dari Cloud
        // 2. Tambahkan data Lokal yang statusnya "Baru Saja Dibuat" (belum masuk Cloud)
        const cloudIds = new Set(cloudData.map(i => i.id));
        const unsyncedLocal = localData.filter(i => 
          recentlyAddedIds.current.has(i.id) && !cloudIds.has(i.id)
        );

        const merged = [...cloudData, ...unsyncedLocal];
        const sorted = merged.sort((a, b) => b.createdAt - a.createdAt);
        
        setItems(sorted);
        await saveToLocalDB(sorted);
      }
    } catch (err: any) {
      console.error("Cloud Fetch Error:", err);
      setError("Cloud Offline (Menggunakan Data Lokal)");
    } finally {
      setIsLoading(false);
    }
  }, [isSyncing]);

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
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data }),
        redirect: 'follow'
      });
      return true;
    } catch (error) {
      console.error("Sync error:", error);
      return false;
    } finally {
      setIsSyncing(false);
      // Tunggu 5 detik baru fetch lagi agar Sheet sempat memproses
      setTimeout(fetchDataFromCloud, 5000);
    }
  };

  const processFilesForCloud = async (files: DocFile[]): Promise<DocFile[]> => {
    return await Promise.all(files.map(async f => {
      if (f.file instanceof File) {
        let base64 = await fileToBase64(f.file);
        // Kompres jika gambar
        if (f.type === 'image') {
          base64 = await compressImage(base64);
        }
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
        id: 'SMPN 3 Pacet-' + Date.now().toString(36).toUpperCase(),
        createdAt: Date.now(),
        ...formData,
        files: processedFiles
      };
      
      // Kunci ID ini agar tidak tertimpa sinkronisasi selama 2 menit
      recentlyAddedIds.current.add(newItem.id);
      setTimeout(() => recentlyAddedIds.current.delete(newItem.id), 120000);

      const newItems = [newItem, ...items];
      setItems(newItems);
      await saveToLocalDB(newItems);
      setView('list');
      
      await syncToSpreadsheet(newItem, 'add');
    } catch (e) {
      alert("Gagal menyimpan. Coba kurangi jumlah foto.");
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
      await saveToLocalDB(newItems);
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
    const password = prompt('Masukkan Sandi Admin untuk menghapus:');
    if (password === 'admin123') {
      if (window.confirm('Hapus dokumentasi ini selamanya?')) {
        const itemToDelete = items.find(i => i.id === id);
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        await removeFromLocalDB(id);
        if (itemToDelete) await syncToSpreadsheet(itemToDelete, 'delete');
      }
    } else if (password !== null) {
      alert('Sandi salah.');
    }
  };

  if (currentPage === 'home') return <LandingPage onEnter={() => setCurrentPage('app')} />;

  const editingItem = items.find(item => item.id === editingId);

  return (
    <div className="relative h-screen w-screen font-sans overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#581c87] to-[#1e1b4b]">
      {/* Menu Bar */}
      <div className="absolute top-0 left-0 right-0 z-[100] flex h-7 items-center justify-between bg-white/10 px-4 text-[13px] font-bold text-white backdrop-blur-3xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 hover:bg-white/10 rounded cursor-default transition-colors">
            <School size={14} strokeWidth={3} />
            <span className="font-extrabold tracking-tight uppercase">SMPN 3 PACET</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-0.5 rounded hover:bg-white/10 cursor-pointer transition-all" onClick={() => setShowDiagnostic(true)}>
            {isSyncing || isLoading ? <RefreshCw size={12} className="animate-spin text-blue-300" /> : error ? <AlertCircle size={13} className="text-orange-400" /> : <CheckCircle2 size={13} className="text-green-400" />}
            <span className="text-[10px] uppercase tracking-widest opacity-80 font-black">{isSyncing ? 'Sinkron Cloud' : isLoading ? 'Loading' : error ? 'Cloud Offline' : 'Cloud Aktif'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 pr-1">
          <Wifi size={14} /><Battery size={16} /><span className="text-[12px] font-black tabular-nums tracking-tighter">{time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {showDiagnostic && (
        <div className="absolute top-10 left-4 z-[110] w-80 p-5 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-black/10 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black uppercase text-gray-500 tracking-[0.2em]">Status Database</h3>
            <button onClick={() => setShowDiagnostic(false)} className="text-gray-400 hover:text-black"><X size={18}/></button>
          </div>
          <div className="space-y-4">
            <div className="bg-black/5 p-4 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Penyimpanan</p>
              <p className="text-sm font-bold text-blue-600">IndexedDB (Stabil & Kapasitas Besar)</p>
            </div>
          </div>
          <button onClick={() => { fetchDataFromCloud(); setShowDiagnostic(false); }} className="w-full mt-5 bg-blue-600 text-white text-xs font-black py-3.5 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/30">REFRESH DATABASE</button>
        </div>
      )}

      <main className="flex h-screen items-center justify-center p-3 md:p-10 pt-12 pb-24">
        <div className="relative h-full w-full max-w-7xl animate-scale-in">
          <MacWindow 
            title={editingId ? "EDITOR DOKUMEN" : (view === 'list' ? "PUSTAKA DIGITAL SMPN 3 PACET" : "ENTRY DOKUMEN BARU")}
            navigation={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl">
                  <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-[#007AFF] text-white shadow-md' : 'text-gray-600'}`}>Gallery</button>
                  <button onClick={() => { setView('form'); setEditingId(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'form' ? 'bg-[#007AFF] text-white shadow-md' : 'text-gray-600'}`}>Tambah</button>
                </div>
                <div className="flex items-center gap-3">
                   <div className="px-3 py-1 bg-black/5 rounded-lg text-[10px] font-black text-gray-400 uppercase">{items.length} KEGIATAN</div>
                   <button onClick={() => setCurrentPage('home')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Home size={18} /></button>
                </div>
              </div>
            }
          >
            {isLoading && items.length === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-5">
                <div className="h-12 w-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sinkronisasi Database...</span>
              </div>
            ) : (
              view === 'list' ? (
                <DocList items={items} onEdit={(item) => { setEditingId(item.id); setView('form'); }} onDelete={handleDelete} onDownload={() => {}} />
              ) : (
                <DocForm onSubmit={editingId ? handleUpdate : handleAdd} onCancel={() => setView('list')} initialData={editingItem} />
              )
            )}
          </MacWindow>
        </div>
      </main>

      {/* Dock */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-end gap-3 rounded-[2.5rem] bg-white/20 p-2.5 shadow-2xl backdrop-blur-3xl border border-white/20 ring-1 ring-black/5">
        <div className="group relative">
          <button onClick={() => setCurrentPage('home')} className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg backdrop-blur-xl transition-all hover:scale-125 hover:-translate-y-2"><Home size={24} className="text-blue-500"/></button>
        </div>
        <div className="h-10 w-px bg-white/20 mx-1"></div>
        <button onClick={() => setView('list')} className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg backdrop-blur-xl transition-all hover:scale-125 hover:-translate-y-2 ${view === 'list' ? 'ring-2 ring-white' : ''}`}><ImageIcon size={24} className="text-emerald-500"/></button>
        <button onClick={() => { setView('form'); setEditingId(null); }} className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg backdrop-blur-xl transition-all hover:scale-125 hover:-translate-y-2 ${view === 'form' ? 'ring-2 ring-white' : ''}`}><PlusCircle size={24} className="text-violet-500"/></button>
        <div className="h-10 w-px bg-white/20 mx-1"></div>
        <button onClick={fetchDataFromCloud} className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 shadow-lg backdrop-blur-xl transition-all hover:scale-125 hover:-translate-y-2"><RefreshCw size={24} className="text-amber-500"/></button>
      </div>
    </div>
  );
};

export default App;