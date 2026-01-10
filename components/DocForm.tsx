import React, { useState, useRef, useEffect } from 'react';
import { Calendar, FileText, Image as ImageIcon, Upload, X, Plus, FileType, FileIcon, Save, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const moveImage = (indexInImages: number, direction: 'left' | 'right') => {
    const imageFiles = files.filter(f => f.type === 'image');
    const pdfFiles = files.filter(f => f.type === 'pdf');
    
    if (direction === 'left' && indexInImages > 0) {
      const newImageFiles = [...imageFiles];
      [newImageFiles[indexInImages - 1], newImageFiles[indexInImages]] = [newImageFiles[indexInImages], newImageFiles[indexInImages - 1]];
      setFiles([...newImageFiles, ...pdfFiles]);
    } else if (direction === 'right' && indexInImages < imageFiles.length - 1) {
      const newImageFiles = [...imageFiles];
      [newImageFiles[indexInImages + 1], newImageFiles[indexInImages]] = [newImageFiles[indexInImages], newImageFiles[indexInImages + 1]];
      setFiles([...newImageFiles, ...pdfFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !activityName) return;
    onSubmit({ date, activityName, description, files });
  };

  const imageFiles = files.filter(f => f.type === 'image');
  const pdfFiles = files.filter(f => f.type === 'pdf');

  return (
    <div className="mx-auto max-w-3xl px-6 md:px-12 py-10 animate-fade-in">
      <div className="mb-10 flex items-center justify-between border-b border-black/5 pb-6">
        <div>
          <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">
            {initialData ? 'Edit Dokumentasi' : 'Baru di Pustaka'}
          </h2>
          <p className="text-sm font-bold text-gray-400 mt-1">Lengkapi detail kegiatan sekolah Anda.</p>
        </div>
        <button onClick={onCancel} className="bg-black/5 p-2 rounded-full hover:bg-black/10 transition-colors">
          <ArrowLeft size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" /> Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl bg-[#F5F5F7] border border-black/5 p-4 text-sm font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 transition-all shadow-sm"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" /> Nama Kegiatan
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Contoh: HUT RI Ke-79"
              className="w-full rounded-2xl bg-[#F5F5F7] border border-black/5 p-4 text-sm font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 transition-all shadow-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" /> Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tuliskan detail singkat kegiatan..."
            rows={4}
            className="w-full rounded-2xl bg-[#F5F5F7] border border-black/5 p-4 text-sm font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 transition-all resize-none shadow-sm"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-500" /> Galeri Foto
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-blue-400 animate-pulse">BISA DI-SWAP URUTANNYA</span>
                <span className="text-[10px] font-black text-[#86868B] bg-black/5 px-2 py-0.5 rounded-md">{imageFiles.length}/10</span>
              </div>
            </div>
            
            <div 
              onClick={() => imageFiles.length < 10 && imageInputRef.current?.click()}
              className={`group flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-10 transition-all 
                ${imageFiles.length >= 10 
                  ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' 
                  : 'border-[#007AFF]/20 bg-[#007AFF]/5 cursor-pointer hover:border-[#007AFF] hover:bg-[#007AFF]/10'
                }`}
            >
              <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" multiple accept="image/*" />
              <div className="flex flex-col items-center gap-3">
                <div className={`p-4 rounded-2xl bg-white shadow-xl transition-transform group-hover:scale-110 ${imageFiles.length >= 10 ? 'text-gray-300' : 'text-[#007AFF]'}`}>
                  <Plus className="h-8 w-8" strokeWidth={3} />
                </div>
                <span className="text-sm font-black text-[#1D1D1F]">Pilih Foto Kegiatan</span>
              </div>
            </div>

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
                {imageFiles.map((file, idx) => (
                  <div key={file.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 animate-scale-in">
                    <img src={file.url} alt="Preview" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    
                    {/* Controls Overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'left')}
                          className="rounded-full bg-white/90 p-1.5 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90"
                          title="Geser Kiri"
                        >
                          <ChevronLeft className="h-4 w-4" strokeWidth={3} />
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="rounded-full bg-red-500/90 p-1.5 text-white hover:bg-red-600 transition-all shadow-lg active:scale-90 mx-1"
                        title="Hapus"
                      >
                        <X className="h-4 w-4" strokeWidth={3} />
                      </button>

                      {idx < imageFiles.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 'right')}
                          className="rounded-full bg-white/90 p-1.5 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90"
                          title="Geser Kanan"
                        >
                          <ChevronRight className="h-4 w-4" strokeWidth={3} />
                        </button>
                      )}
                    </div>
                    
                    {/* Index Indicator */}
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[9px] font-black text-white pointer-events-none">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-[#86868B] flex items-center gap-2">
                <FileType className="w-4 h-4 text-blue-500" /> Berkas PDF (Opsional)
              </label>
              <span className="text-[10px] font-black text-[#86868B] bg-black/5 px-2 py-0.5 rounded-md">{pdfFiles.length}/5</span>
            </div>
            
            <button
              type="button"
              onClick={() => pdfFiles.length < 5 && pdfInputRef.current?.click()}
              disabled={pdfFiles.length >= 5}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white border border-black/5 py-4 text-sm font-black text-[#1D1D1F] hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
            >
              <FileType size={18} className="text-red-500" /> Unggah Berkas Laporan
              <input type="file" ref={pdfInputRef} onChange={handlePdfChange} className="hidden" multiple accept="application/pdf" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pdfFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-black/5 animate-scale-in">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <FileType size={20} strokeWidth={3} />
                    </div>
                    <span className="truncate text-xs font-black text-[#1D1D1F]">{file.name || 'Laporan.pdf'}</span>
                  </div>
                  <button type="button" onClick={() => removeFile(file.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[2rem] bg-[#007AFF] py-5 text-xl font-black text-white shadow-2xl shadow-blue-500/30 transition-all hover:bg-[#0055FF] hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <Save size={24} strokeWidth={3} />
            {initialData ? 'SIMPAN PERUBAHAN' : 'MASUKKAN KE PUSTAKA'}
          </button>
        </div>
      </form>
    </div>
  );
};