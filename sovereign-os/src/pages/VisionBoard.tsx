import React, { useState, useEffect } from 'react';
import { imageStore } from '../lib/imageStore';
import { Plus, Trash2, Image } from 'lucide-react';

type ImageItem = { id: string; url: string };

export default function VisionBoard() {
  const [images, setImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    loadImages();
    return () => images.forEach(img => imageStore.revokeObjectURL(img.url));
  }, []);

  const loadImages = async () => {
    const keys = await imageStore.getAllKeys();
    const items: ImageItem[] = [];
    for (const id of keys) {
      const blob = await imageStore.get(id);
      if (blob) items.push({ id, url: imageStore.createObjectURL(blob) });
    }
    setImages(items);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = Date.now().toString();
    await imageStore.save(id, file);
    const url = imageStore.createObjectURL(file);
    setImages([...images, { id, url }]);
  };

  const handleDelete = async (id: string, url: string) => {
    await imageStore.delete(id);
    imageStore.revokeObjectURL(url);
    setImages(images.filter(img => img.id !== id));
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Image size={28} style={{ color: 'var(--accent-lavender)' }} /> Vision Board
        </h1>
        <label className="btn-primary inline-flex items-center gap-2 cursor-pointer">
          <Plus size={18}/> Add Image
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden"/>
        </label>
      </div>

      {images.length === 0 ? (
        <div className="glass-card text-center py-16">
          <Image size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Your vision board is empty. Add images that inspire you!
          </p>
          <label className="btn-primary inline-flex items-center gap-2 cursor-pointer mt-4">
            <Plus size={18}/> Upload First Image
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden"/>
          </label>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {images.map(img => (
            <div key={img.id} className="relative group mb-4 break-inside-avoid">
              <img src={img.url} alt="" className="w-full rounded-xl shadow-lg"
                style={{ boxShadow: 'var(--shadow-card)' }} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              <button onClick={() => handleDelete(img.id, img.url)}
                className="absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                style={{ background: 'var(--accent-rose-dim)', color: 'var(--accent-rose)' }}>
                <Trash2 size={16}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
