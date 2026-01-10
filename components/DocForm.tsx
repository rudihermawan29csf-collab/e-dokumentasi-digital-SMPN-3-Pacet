import React, { useState, useRef, useEffect } from 'react';
import { Calendar, FileText, Image as ImageIcon, Upload, X, Plus, FileType, FileIcon, Save, ArrowLeft } from 'lucide-react';
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
    }
  }, [initialData]);

  const imageFiles = files.filter(f => f.type === 'image');
  const pdfFiles = files.filter(f => f.type === 'pdf');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesRaw: File[] = Array.from(e.target.files);
      const remainingSlots = 10 - imageFiles.length;
      const filesToProcess = newFilesRaw.slice(0, remainingSlots);

      const newDocFiles: DocFile[] = filesToProcess.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file,
        type: 'image'
      }));

      setFiles(prev => [...prev, ...newDocFiles]);
    }
    if (e.target) e.target.value = '';
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesRaw: File[] = Array.from(e.target.files);
      const remainingSlots = 10 - pdfFiles.length;
      const filesToProcess = newFilesRaw.slice(0, remainingSlots);

      const newDocFiles: DocFile[] = filesToProcess.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file,
        type: 'pdf'
      }));

      setFiles(prev => [...prev, ...newDocFiles]);
    }
    if (e.target) e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !activityName) return;
    
    onSubmit({ date, activityName, description, files });
    
    if (!initialData) {
      setDate('');
      setActivityName('');
      setDescription('');
      setFiles([]);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-3xl font-black text-[#1D1D1F] tracking-tight">
          {initialData ? 'Edit Dokumentasi' : 'Baru di Pustaka'}
        </h2>
        <button onClick={onCancel} className="text-[#007AFF] text-sm font-bold hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Kembali
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Group */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-[#F5F5F7] border border-black/5 p-4 text-sm font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 transition-all shadow-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Judul Kegiatan
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Judul dokumentasi..."
                className="w-full rounded-xl bg-[#F5F5F7] border border-black/5 p-4 text-sm font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Deskripsi Singkat
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ceritakan tentang kegiatan ini..."
              rows={3}
              className="w-full rounded-xl bg-[#F5F5F7] border border-black/5 p-4 text-sm font-bold text-[#1D1D1F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10 transition-all resize-none shadow-sm"
            />
          </div>
        </div>

        {/* Media Group */}
        <div className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Galeri Foto
              </label>
              <span className="text-[10px] font-black text-[#86868B]">{imageFiles.length}/10</span>
            </div>
            
            <div 
              onClick={() => imageFiles.length < 10 && imageInputRef.current?.click()}
              className={`group flex items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all 
                ${imageFiles.length >= 10 
                  ? 'border-black/5 bg-[#F5F5F7] opacity-50 cursor-not-allowed' 
                  : 'border-[#007AFF]/30 bg-[#007AFF]/5 cursor-pointer hover:border-[#007AFF] hover:bg-[#007AFF]/10'
                }`}
            >
              <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" multiple accept="image/*" />
              <div className="flex flex-col items-center gap-2">
                <Plus className={`h-8 w-8 transition-transform group-hover:scale-110 ${imageFiles.length >= 10 ? 'text-gray-400' : 'text-[#007AFF]'}`} />
                <span className="text-sm font-black text-[#1D1D1F]">Tambah Foto</span>
              </div>
            </div>

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {imageFiles.map((file) => (
                  <div key={file.id} className="group relative aspect-square overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5">
                    <img src={file.url} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-widest text-[#86868B] flex items-center gap-1.5">
                <FileType className="w-3.5 h-3.5" /> Berkas PDF (Opsional)
              </label>
              <span className="text-[10px] font-black text-[#86868B]">{pdfFiles.length}/10</span>
            </div>
            
            <button
              type="button"
              onClick={() => pdfFiles.length < 10 && pdfInputRef.current?.click()}
              disabled={pdfFiles.length >= 10}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black/5 py-4 text-sm font-black text-[#1D1D1F] hover:bg-black/10 transition-colors"
            >
              <Plus size={18} /> Unggah PDF
              <input type="file" ref={pdfInputRef} onChange={handlePdfChange} className="hidden" multiple accept="application/pdf" />
            </button>

            <div className="space-y-2">
              {pdfFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-black/5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <FileType size={16} strokeWidth={3} />
                    </div>
                    {/* Use optional chaining to handle both newly uploaded and existing files */}
                    <span className="truncate text-xs font-bold text-[#1D1D1F]">{file.file?.name || file.name || 'Berkas'}</span>
                  </div>
                  <button type="button" onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#007AFF] py-4 text-lg font-black text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-[#0025FF] hover:scale-[1.02] active:scale-95"
          >
            <Save size={20} strokeWidth={3} />
            {initialData ? 'Simpan Perubahan' : 'Masukkan ke Pustaka'}
          </button>
        </div>
      </form>
    </div>
  );
};