import React, { useState, useEffect } from 'react';
import { imageStore } from '../lib/imageStore';
import { Plus, Trash2 } from 'lucide-react';

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
      <h1 className="text-3xl font-bold mb-8 gradient-text">Vision Board</h1>
      <label className="btn-primary inline-flex items-center gap-2 cursor-pointer mb-8">
        <Plus size={20}/> Add Image
        <input type="file" accept="image/*" onChange={handleUpload} className="hidden"/>
      </label>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {images.map(img=>(
          <div key={img.id} className="relative group mb-4 break-inside-avoid">
            <img src={img.url} alt="" className="w-full rounded-xl shadow-lg"/>
            <button onClick={()=>handleDelete(img.id,img.url)} className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition">
              <Trash2 size={16} className="text-white"/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}