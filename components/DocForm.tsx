import React, { useState, useRef, useEffect } from 'react';
import { Calendar, FileText, Image as ImageIcon, X, Plus, FileType, Save, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { DocumentationItem, DocFile } from '../types';

interface DocFormProps {
  onSubmit: (data: Omit<DocumentationItem, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: DocumentationItem | null;
}

export const DocForm: React.FC<DocFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [date, setDate] = useState('');
  const [activityName, setActivityName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<DocFile[]>([]);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setActivityName(initialData.activityName);
      setDescription(initialData.description);
      setFiles(initialData.files);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesRaw = Array.from(e.target.files) as File[];
      const currentImageCount = files.filter(f => f.type === 'image').length;
      const remainingSlots = 10 - currentImageCount;
      const filesToProcess = newFilesRaw.slice(0, remainingSlots);
      const newDocFiles: DocFile[] = filesToProcess.map(file => ({
        id: 'img-' + Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file,
        type: 'image',
        name: file.name
      }));
      setFiles(prev => [...prev, ...newDocFiles]);
    }
    if (e.target) e.target.value = '';
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesRaw = Array.from(e.target.files) as File[];
      const remainingSlots = 5 - files.filter(f => f.type === 'pdf').length;
      const filesToProcess = newFilesRaw.slice(0, remainingSlots);
      const newDocFiles: DocFile[] = filesToProcess.map(file => ({
        id: 'pdf-' + Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file,
        type: 'pdf',
        name: file.name
      }));
      setFiles(prev => [...prev, ...newDocFiles]);
    }
    if (e.target) e.target.value = '';
  };

  const moveImage = (idx: number, dir: 'left' | 'right') => {
    const imgs = files.filter(f => f.type === 'image');
    const pdfs = files.filter(f => f.type === 'pdf');
    if (dir === 'left' && idx > 0) {
      const n = [...imgs];
      [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
      setFiles([...n, ...pdfs]);
    } else if (dir === 'right' && idx < imgs.length - 1) {
      const n = [...imgs];
      [n[idx + 1], n[idx]] = [n[idx], n[idx + 1]];
      setFiles([...n, ...pdfs]);
    }
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !activityName) return;
    onSubmit({ date, activityName, description, files });
  };

  const imageFiles = files.filter(f => f.type === 'image');
  const pdfFiles = files.filter(f => f.type === 'pdf');

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8 md:px-12 py-6 md:py-10 animate-fade-in">
      <div className="mb-6 md:mb-10 flex items-center justify-between border-b border-black/5 pb-4 md:pb-6">
        <div>
          <h2 className="text-xl md:text-3xl font-black text-[#1D1D1F] tracking-tight">{initialData ? 'Edit Data' : 'Tambah Baru'}</h2>
          <p className="text-[10px] md:text-xs font-bold text-gray-400 mt-0.5">Lengkapi dokumentasi kegiatan SMPN 3 Pacet.</p>
        </div>
        <button onClick={onCancel} className="bg-black/5 p-2 rounded-full hover:bg-black/10"><ArrowLeft size={18} /></button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><Calendar size={12} className="text-blue-500" /> Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl bg-gray-100 border-none p-3 text-xs md:text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><FileText size={12} className="text-blue-500" /> Kegiatan</label>
            <input type="text" value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="Nama kegiatan..." className="w-full rounded-xl bg-gray-100 border-none p-3 text-xs md:text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><FileText size={12} className="text-blue-500" /> Deskripsi</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tuliskan keterangan..." rows={3} className="w-full rounded-xl bg-gray-100 border-none p-3 text-xs md:text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all resize-none" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><ImageIcon size={12} className="text-blue-500" /> Foto ({imageFiles.length}/10)</label>
            <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">BISA DI-SWAP</span>
          </div>
          
          <div onClick={() => imageFiles.length < 10 && imageInputRef.current?.click()} className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${imageFiles.length >= 10 ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-blue-100 bg-blue-50/30 cursor-pointer hover:bg-blue-50'}`}>
            <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" multiple accept="image/*" />
            <Plus size={24} className="text-blue-500 mb-2" />
            <span className="text-[11px] font-black text-gray-500 uppercase">Pilih Foto</span>
          </div>

          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {imageFiles.map((file, idx) => (
                <div key={file.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 ring-1 ring-black/5">
                  <img src={file.url} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                    {idx > 0 && <button type="button" onClick={() => moveImage(idx, 'left')} className="p-1 bg-white rounded-md text-blue-600"><ChevronLeft size={14}/></button>}
                    <button type="button" onClick={() => removeFile(file.id)} className="p-1 bg-red-500 rounded-md text-white"><X size={14}/></button>
                    {idx < imageFiles.length - 1 && <button type="button" onClick={() => moveImage(idx, 'right')} className="p-1 bg-white rounded-md text-blue-600"><ChevronRight size={14}/></button>}
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 px-1 bg-black/50 rounded text-[8px] font-black text-white">{idx + 1}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><FileType size={12} className="text-blue-500" /> Laporan PDF ({pdfFiles.length}/5)</label>
          <button type="button" onClick={() => pdfFiles.length < 5 && pdfInputRef.current?.click()} className="w-full py-3 bg-gray-100 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all">
             <Plus size={14} /> UNGGAH PDF
             <input type="file" ref={pdfInputRef} onChange={handlePdfChange} className="hidden" multiple accept="application/pdf" />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pdfFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-black/5">
                <span className="truncate text-[10px] font-bold text-gray-600">{file.name}</span>
                <button type="button" onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 md:pt-6">
          <button type="submit" className="w-full py-4 md:py-5 bg-blue-600 rounded-2xl md:rounded-[2rem] text-sm md:text-lg font-black text-white shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.98] transition-all">
            {initialData ? 'SIMPAN PERUBAHAN' : 'TAMBAH KE PUSTAKA'}
          </button>
        </div>
      </form>
    </div>
  );
};