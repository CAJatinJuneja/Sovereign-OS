import React from 'react';
import { Download, Upload, Trash2, Settings as SettingsIcon, Shield } from 'lucide-react';

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
    a.href = url;
    a.download = 'sovereign-os-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
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
      <h1 className="text-3xl font-bold mb-8 gradient-text flex items-center gap-3">
        <SettingsIcon size={28} style={{ color: 'var(--text-secondary)' }} /> Settings
      </h1>

      <div className="glass-card p-6 space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield size={18} style={{ color: 'var(--accent-primary)' }} /> Data Management
        </h2>
        <div className="space-y-4">
          <button onClick={exportData} className="btn-primary w-full flex items-center justify-center gap-2">
            <Download size={20}/> Export to JSON
          </button>
          <label className="block w-full btn-ghost text-center cursor-pointer flex items-center justify-center gap-2">
            <Upload size={20}/> Import from JSON
            <input type="file" accept=".json" onChange={importData} className="hidden"/>
          </label>
          <button onClick={clearAllData}
            className="w-full px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            style={{ background: 'var(--accent-rose-dim)', color: 'var(--accent-rose)', border: '1px solid rgba(240,112,136,0.15)' }}>
            <Trash2 size={20}/> Clear All Data
          </button>
        </div>
        <div className="pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            All data is stored locally in your browser. Export regularly to backup.
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Sovereign OS v1.0 &mdash; Your mind, your data, your sovereignty.
          </p>
        </div>
      </div>
    </div>
  );
}
