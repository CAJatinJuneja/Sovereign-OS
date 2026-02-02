import React from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const exportData = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) data[key] = JSON.parse(localStorage.getItem(key)!);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sovereign-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
        alert('Data imported successfully! Refreshing...');
        window.location.reload();
      } catch { alert('Failed to import data.'); }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure? This will delete ALL your data!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="animate-fadeIn max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Settings</h1>
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        <div className="space-y-4">
          <button onClick={exportData} className="btn-primary w-full flex items-center justify-center gap-2">
            <Download size={20}/> Export to JSON
          </button>
          <label className="block w-full px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer text-center flex items-center justify-center gap-2">
            <Upload size={20}/> Import from JSON
            <input type="file" accept=".json" onChange={importData} className="hidden"/>
          </label>
          <button onClick={clearAllData} className="w-full px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center gap-2">
            <Trash2 size={20}/> Clear All Data
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          ⚠ All data is stored locally in your browser. Export regularly to backup.
        </p>
      </div>
    </div>
  );
}