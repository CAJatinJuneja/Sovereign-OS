import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Sparkles, Plus, Play, Pause, RotateCcw, Flame, Trash2, Sun, Moon, Check } from 'lucide-react';

type Affirmation = {
  id: string;
  limitingBelief: string;
  futureReality: string;
  emotion: string;
  createdAt: string;
};

type DayRecord = {
  date: string;
  morning: boolean;
  evening: boolean;
};

const EMOTIONS = ['Gratitude','Freedom','Abundance','Love','Joy','Courage','Peace','Power','Clarity','Serenity'];

function ProgressRing({ progress, size = 80, stroke = 6 }: { progress: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle className="progress-ring-circle" cx={size/2} cy={size/2} r={r} fill="none"
        stroke={progress >= 100 ? 'var(--accent-sage)' : 'var(--accent-primary)'}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset} />
    </svg>
  );
}

export default function NeuroAffirmations() {
  const [affirmations, setAffirmations] = usePersistentStore<Affirmation[]>('affirmations-data', []);
  const [streaks, setStreaks] = usePersistentStore<DayRecord[]>('affirmation-streaks', []);
  const [view, setView] = useState<'list' | 'wizard' | 'rehearsal'>('list');
  const [limitingBelief, setLimitingBelief] = useState('');
  const [futureReality, setFutureReality] = useState('');
  const [emotion, setEmotion] = useState('');
  const [wizardStep, setWizardStep] = useState(0);
  const [rehearsalAffirmation, setRehearsalAffirmation] = useState<Affirmation | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = streaks.find(s => s.date === today) || { date: today, morning: false, evening: false };
  const isAm = new Date().getHours() < 12;
  const dailyProgress = (todayRecord.morning ? 50 : 0) + (todayRecord.evening ? 50 : 0);

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0];
      const rec = streaks.find(s => s.date === key);
      if (rec && rec.morning && rec.evening) { count++; } else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [streaks]);

  const markComplete = useCallback((period: 'morning' | 'evening') => {
    const existing = streaks.find(s => s.date === today);
    if (existing) {
      setStreaks(streaks.map(s => s.date === today ? { ...s, [period]: true } : s));
    } else {
      setStreaks([...streaks, { date: today, morning: period === 'morning', evening: period === 'evening' }]);
    }
  }, [streaks, today, setStreaks]);

  const startAudio = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = 174;
      gain.gain.value = 0.08;
      osc.connect(gain); gain.connect(ctx.destination); osc.start();
      audioCtxRef.current = ctx; oscRef.current = osc; gainRef.current = gain;
    } catch {}
  }, []);

  const stopAudio = useCallback(() => {
    try {
      if (gainRef.current) gainRef.current.gain.exponentialRampToValueAtTime(0.001, (audioCtxRef.current?.currentTime || 0) + 0.5);
      setTimeout(() => { oscRef.current?.stop(); audioCtxRef.current?.close(); }, 600);
    } catch {}
  }, []);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft <= 0 && timerRunning) {
      setTimerRunning(false);
      stopAudio();
      markComplete(isAm ? 'morning' : 'evening');
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning, timeLeft, stopAudio, markComplete, isAm]);

  const startRehearsal = (a: Affirmation) => {
    setRehearsalAffirmation(a); setTimeLeft(120); setTimerRunning(false); setView('rehearsal');
  };

  const toggleTimer = () => {
    if (!timerRunning) { startAudio(); setTimerRunning(true); }
    else { setTimerRunning(false); stopAudio(); }
  };

  const resetTimer = () => { setTimerRunning(false); stopAudio(); setTimeLeft(120); };

  const saveAffirmation = () => {
    if (!futureReality.trim() || !emotion) return;
    setAffirmations([...affirmations, { id: Date.now().toString(), limitingBelief, futureReality, emotion, createdAt: today }]);
    setLimitingBelief(''); setFutureReality(''); setEmotion(''); setWizardStep(0); setView('list');
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  if (view === 'rehearsal' && rehearsalAffirmation) {
    return (
      <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[70vh]">
        <div className={`glass-card p-10 text-center max-w-xl w-full ${timerRunning ? 'animate-breathe-pulse' : ''}`}
          style={{ borderColor: 'rgba(124,138,255,0.15)' }}>
          <div className="section-label mb-2">Mental Rehearsal</div>
          <div className="timer-display mb-6">{mins}:{secs.toString().padStart(2, '0')}</div>
          <p className="text-2xl font-bold mb-3" style={{ fontFamily: 'Lora, serif', color: 'var(--text-primary)' }}>
            "{rehearsalAffirmation.futureReality}"
          </p>
          <div className="emotion-chip active text-lg mx-auto mb-8">{rehearsalAffirmation.emotion}</div>
          <div className="flex gap-4 justify-center">
            <button onClick={toggleTimer} className="btn-primary flex items-center gap-2">
              {timerRunning ? <><Pause size={18}/> Pause</> : <><Play size={18}/> {timeLeft < 120 ? 'Resume' : 'Start'}</>}
            </button>
            <button onClick={resetTimer} className="btn-ghost flex items-center gap-2"><RotateCcw size={16}/> Reset</button>
            <button onClick={() => { stopAudio(); setTimerRunning(false); setView('list'); }} className="btn-ghost">Back</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'wizard') {
    return (
      <div className="animate-fadeIn max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 gradient-text flex items-center gap-3">
          <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} /> Affirmation Wizard
        </h1>
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {[0,1,2].map(i => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`stepper-dot ${wizardStep === i ? 'active' : wizardStep > i ? 'completed' : ''}`}>{i+1}</div>
              {i < 2 && <div className={`stepper-line ${wizardStep > i ? 'completed' : ''}`} />}
            </div>
          ))}
        </div>
        {wizardStep === 0 && (
          <div className="glass-card p-6">
            <div className="section-label">Step 1: Limiting Belief</div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              What negative belief do you want to release? (e.g., "I am not good enough")
            </p>
            <textarea value={limitingBelief} onChange={e => setLimitingBelief(e.target.value)}
              className="input-glass mb-4" rows={3} placeholder="I believe that..." />
            <button onClick={() => setWizardStep(1)} className="btn-primary">Next</button>
          </div>
        )}
        {wizardStep === 1 && (
          <div className="glass-card p-6">
            <div className="section-label">Step 2: Future Reality (Present Tense)</div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Rewrite this as a present-tense "I am" statement — as if it's already true.
            </p>
            <textarea value={futureReality} onChange={e => setFutureReality(e.target.value)}
              className="input-glass mb-4" rows={3} placeholder="I am..." />
            <div className="flex gap-3">
              <button onClick={() => setWizardStep(0)} className="btn-ghost">Back</button>
              <button onClick={() => setWizardStep(2)} className="btn-primary" disabled={!futureReality.trim()}>Next</button>
            </div>
          </div>
        )}
        {wizardStep === 2 && (
          <div className="glass-card p-6">
            <div className="section-label">Step 3: Elevated Emotion</div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              What elevated emotion will you feel when this becomes real?
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {EMOTIONS.map(e => (
                <button key={e} onClick={() => setEmotion(e)}
                  className={`emotion-chip ${emotion === e ? 'active' : ''}`}>{e}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setWizardStep(1)} className="btn-ghost">Back</button>
              <button onClick={saveAffirmation} className="btn-primary" disabled={!emotion}>Save Affirmation</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} /> Neuro-Affirmations
        </h1>
        <div className="flex items-center gap-3">
          {streak > 0 && <div className="streak-badge"><Flame size={14}/> {streak} day streak</div>}
          <button onClick={() => setView('wizard')} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> New Affirmation
          </button>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center gap-6">
          <ProgressRing progress={dailyProgress} />
          <div className="flex-1">
            <div className="section-label">Today's Rehearsals</div>
            <div className="flex items-center gap-4 mt-2">
              <button onClick={() => markComplete('morning')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${todayRecord.morning ? 'opacity-60' : ''}`}
                style={todayRecord.morning
                  ? { background: 'var(--accent-sage-dim)', color: 'var(--accent-sage)' }
                  : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                disabled={todayRecord.morning}>
                {todayRecord.morning ? <Check size={16}/> : <Sun size={16}/>} Morning
              </button>
              <button onClick={() => markComplete('evening')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${todayRecord.evening ? 'opacity-60' : ''}`}
                style={todayRecord.evening
                  ? { background: 'var(--accent-sage-dim)', color: 'var(--accent-sage)' }
                  : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                disabled={todayRecord.evening}>
                {todayRecord.evening ? <Check size={16}/> : <Moon size={16}/>} Evening
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affirmation Cards */}
      <div className="space-y-4">
        {affirmations.map(a => (
          <div key={a.id} className="glass-card p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {a.limitingBelief && (
                  <p className="text-xs line-through mb-1" style={{ color: 'var(--text-muted)' }}>{a.limitingBelief}</p>
                )}
                <p className="text-lg font-semibold mb-2" style={{ fontFamily: 'Lora, serif' }}>"{a.futureReality}"</p>
                <span className="emotion-chip active">{a.emotion}</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => startRehearsal(a)} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                  <Play size={14}/> Rehearse
                </button>
                <button onClick={() => setAffirmations(affirmations.filter(x => x.id !== a.id))}
                  style={{ color: 'var(--accent-rose)' }} className="hover:opacity-70 transition-opacity p-2">
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {affirmations.length === 0 && (
        <div className="glass-card text-center py-12">
          <Sparkles size={40} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No affirmations yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
