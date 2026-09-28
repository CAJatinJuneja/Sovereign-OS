import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabaseConfigured } from './lib/supabaseClient';
import { cloudStorageSize } from './lib/cloudStorage';
import { hasLocalData, importLocalDataToCloud } from './lib/localMigration';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import JournalHistory from './pages/JournalHistory';
import WorkProjects from './pages/WorkProjects';
import DailyTimeline from './pages/DailyTimeline';
import IntegralAudit from './pages/IntegralAudit';
import Finances from './pages/Finances';
import VisionBoard from './pages/VisionBoard';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import NeuroAffirmations from './pages/NeuroAffirmations';
import SuccessAccelerator from './pages/SuccessAccelerator';
import WealthArchitect from './pages/WealthArchitect';

function FullScreenLoader({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p style={{ color: 'var(--text-muted)' }}>{text}</p>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="glass-card p-8 max-w-lg text-center">
        <h1 className="text-xl font-bold gradient-text mb-3">Cloud sync isn't configured yet</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to a <code>.env</code> file
          in the project root (see the README's "Cloud sync setup" section for the exact steps and SQL),
          then restart the dev server or redeploy.
        </p>
      </div>
    </div>
  );
}

function ImportPrompt({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ keysImported: number; imagesImported: number } | null>(null);

  const runImport = async () => {
    setBusy(true);
    const r = await importLocalDataToCloud();
    setResult(r);
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="glass-card p-8 max-w-md text-center">
        <h1 className="text-xl font-bold gradient-text mb-3">Import your existing data?</h1>
        {result ? (
          <>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Imported {result.keysImported} item{result.keysImported === 1 ? '' : 's'}
              {result.imagesImported > 0 ? ` and ${result.imagesImported} image${result.imagesImported === 1 ? '' : 's'}` : ''} into your account.
            </p>
            <button onClick={onDone} className="btn-primary mt-4">Continue</button>
          </>
        ) : (
          <>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This browser has Sovereign OS data saved from before accounts existed. Import it into your new account, or start fresh.
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={runImport} disabled={busy} className="btn-primary">{busy ? 'Importing…' : 'Import it'}</button>
              <button onClick={onDone} className="btn-ghost">Start fresh</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Gate() {
  const { status } = useAuth();
  const [importDecision, setImportDecision] = useState<'pending' | 'shown' | 'done'>('pending');

  useEffect(() => {
    if (status === 'ready' && importDecision === 'pending') {
      setImportDecision(cloudStorageSize() === 0 && hasLocalData() ? 'shown' : 'done');
    }
    if (status !== 'ready' && importDecision !== 'pending') {
      setImportDecision('pending');
    }
  }, [status, importDecision]);

  if (!supabaseConfigured) return <SetupNotice />;
  if (status === 'loading') return <FullScreenLoader text="Loading…" />;
  if (status === 'signed-out') return <Login />;
  if (status === 'hydrating') return <FullScreenLoader text="Loading your data…" />;
  if (importDecision === 'shown') return <ImportPrompt onDone={() => setImportDecision('done')} />;
  if (importDecision !== 'done') return <FullScreenLoader text="Loading…" />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/history" element={<JournalHistory />} />
          <Route path="work" element={<WorkProjects />} />
          <Route path="timeline" element={<DailyTimeline />} />
          <Route path="audit" element={<IntegralAudit />} />
          <Route path="finances" element={<Finances />} />
          <Route path="vision" element={<VisionBoard />} />
          <Route path="goals" element={<Goals />} />
          <Route path="affirmations" element={<NeuroAffirmations />} />
          <Route path="accelerator" element={<SuccessAccelerator />} />
          <Route path="wealth" element={<WealthArchitect />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
