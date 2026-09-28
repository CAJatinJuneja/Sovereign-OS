import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password) return;
    setError(''); setInfo(''); setBusy(true);
    const err = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (err) { setError(err); return; }
    if (mode === 'signup') setInfo("Account created! If you don't land in the app in a few seconds, check your inbox for a confirmation link, then come back and sign in.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-app, #0a0e1a)' }}>
      <div className="glass-card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <Sparkles size={28} style={{ color: 'var(--accent-primary)', margin: '0 auto 0.5rem' }} />
          <h1 className="text-2xl font-bold gradient-text">Sovereign OS</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </p>
          {mode === 'signup' && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Your personal journal, planner, and finance tracker. Data is private to your account only — no one else can see it.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" className="input-glass w-full"
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          <div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" className="input-glass w-full"
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            {mode === 'signup' && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Any email address works — it doesn't need to be verified in advance. Pick a password with at least 6 characters; there's nothing else to set up.
              </p>
            )}
          </div>
          {error && <p className="text-sm" style={{ color: 'var(--accent-rose)' }}>{error}</p>}
          {info && <p className="text-sm" style={{ color: 'var(--accent-sage)' }}>{info}</p>}
          <button onClick={submit} disabled={busy} className="btn-primary w-full">
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        <p className="text-xs text-center mt-5" style={{ color: 'var(--text-muted)' }}>
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo(''); }}
            style={{ color: 'var(--accent-primary)' }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
