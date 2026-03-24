import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Sparkles, Plus, Play, Pause, RotateCcw, Flame, Trash2, Sun, Moon, Check, Heart, BookOpen, Calendar, Clock } from 'lucide-react';

// ── Types ──
type Affirmation = {
  id: string;
  limitingBelief: string;
  futureReality: string;
  emotion: string;
  createdAt: string;
};

type FavoriteAffirmation = {
  id: string;
  text: string;
  category: string;
  schedule: 'daily' | 'weekly' | 'custom';
  intervalDays: number;
  lastPracticed?: string;
  addedAt: string;
};

type DayRecord = {
  date: string;
  morning: boolean;
  evening: boolean;
};

// ── Curated Library ──
const AFFIRMATION_CATEGORIES = ['Health', 'Wealth', 'Confidence', 'Relationships', 'Career', 'Peace'] as const;
type AffirmationCategory = typeof AFFIRMATION_CATEGORIES[number];

interface LibraryAffirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
}

const AFFIRMATION_LIBRARY: LibraryAffirmation[] = [
  // Health
  { id: 'lib-1', text: 'My body is healthy, strong, and full of energy.', category: 'Health' },
  { id: 'lib-2', text: 'I nourish my body with healthy food and positive thoughts.', category: 'Health' },
  { id: 'lib-3', text: 'Every cell in my body radiates health and vitality.', category: 'Health' },
  { id: 'lib-4', text: 'I am grateful for the perfect health I enjoy.', category: 'Health' },
  { id: 'lib-5', text: 'I choose to make choices that honor my body, mind, and spirit.', category: 'Health' },
  // Wealth
  { id: 'lib-6', text: 'Money flows to me easily and abundantly.', category: 'Wealth' },
  { id: 'lib-7', text: 'I am a powerful creator of wealth and prosperity.', category: 'Wealth' },
  { id: 'lib-8', text: 'I am financially free and living life on my own terms.', category: 'Wealth' },
  { id: 'lib-9', text: 'Abundance is my birthright and I claim it now.', category: 'Wealth' },
  { id: 'lib-10', text: 'I attract lucrative opportunities effortlessly.', category: 'Wealth' },
  // Confidence
  { id: 'lib-11', text: 'I believe in myself and my ability to succeed.', category: 'Confidence' },
  { id: 'lib-12', text: 'I am worthy of love, success, and happiness.', category: 'Confidence' },
  { id: 'lib-13', text: 'I radiate confidence, self-respect, and inner harmony.', category: 'Confidence' },
  { id: 'lib-14', text: 'I am enough, just as I am, right now.', category: 'Confidence' },
  { id: 'lib-15', text: 'My voice matters. My ideas are valuable. I speak with conviction.', category: 'Confidence' },
  // Relationships
  { id: 'lib-16', text: 'I attract loving, supportive, and fulfilling relationships.', category: 'Relationships' },
  { id: 'lib-17', text: 'I am surrounded by people who lift me higher.', category: 'Relationships' },
  { id: 'lib-18', text: 'I communicate openly, honestly, and with compassion.', category: 'Relationships' },
  { id: 'lib-19', text: 'I give and receive love freely and unconditionally.', category: 'Relationships' },
  { id: 'lib-20', text: 'My relationships are built on trust, respect, and genuine care.', category: 'Relationships' },
  // Career
  { id: 'lib-21', text: 'I am aligned with my purpose and passionate about my work.', category: 'Career' },
  { id: 'lib-22', text: 'Success comes naturally to me because I work with dedication.', category: 'Career' },
  { id: 'lib-23', text: 'I am a leader who inspires and empowers others.', category: 'Career' },
  { id: 'lib-24', text: 'Every challenge at work is an opportunity to grow and learn.', category: 'Career' },
  { id: 'lib-25', text: 'I create immense value in everything I do professionally.', category: 'Career' },
  // Peace
  { id: 'lib-26', text: 'I release all worry and embrace peace in this moment.', category: 'Peace' },
  { id: 'lib-27', text: 'I am calm, centered, and grounded in the present.', category: 'Peace' },
  { id: 'lib-28', text: 'I let go of what I cannot control and focus on what I can.', category: 'Peace' },
  { id: 'lib-29', text: 'Peace is my natural state. I return to it with every breath.', category: 'Peace' },
  { id: 'lib-30', text: 'I forgive myself and others, freeing my heart from heaviness.', category: 'Peace' },
];

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
  const [favorites, setFavorites] = usePersistentStore<FavoriteAffirmation[]>('affirmation-favorites', []);
  const [streaks, setStreaks] = usePersistentStore<DayRecord[]>('affirmation-streaks', []);
  const [view, setView] = useState<'list' | 'wizard' | 'rehearsal' | 'library'>('list');
  const [limitingBelief, setLimitingBelief] = useState('');
  const [futureReality, setFutureReality] = useState('');
  const [emotion, setEmotion] = useState('');
  const [wizardStep, setWizardStep] = useState(0);
  const [rehearsalAffirmation, setRehearsalAffirmation] = useState<Affirmation | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [libraryCategory, setLibraryCategory] = useState<AffirmationCategory | 'All'>('All');
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

  // Today's scheduled favorites
  const todaysPractice = useMemo(() => {
    return favorites.filter(fav => {
      if (fav.schedule === 'daily') return true;
      if (!fav.lastPracticed) return true;
      const last = new Date(fav.lastPracticed);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      if (fav.schedule === 'weekly') return diffDays >= 7;
      return diffDays >= fav.intervalDays;
    });
  }, [favorites]);

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

  const startFavoriteRehearsal = (fav: FavoriteAffirmation) => {
    // Create a temporary Affirmation from the favorite
    const a: Affirmation = {
      id: fav.id,
      limitingBelief: '',
      futureReality: fav.text,
      emotion: fav.category,
      createdAt: fav.addedAt,
    };
    // Mark as practiced
    setFavorites(prev => prev.map(f => f.id === fav.id ? { ...f, lastPracticed: today } : f));
    startRehearsal(a);
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

  const isFavorite = (libId: string) => favorites.some(f => f.id === libId);

  const toggleFavorite = (item: LibraryAffirmation) => {
    if (isFavorite(item.id)) {
      setFavorites(prev => prev.filter(f => f.id !== item.id));
    } else {
      setFavorites(prev => [...prev, {
        id: item.id,
        text: item.text,
        category: item.category,
        schedule: 'daily',
        intervalDays: 1,
        addedAt: today,
      }]);
    }
  };

  const updateSchedule = (id: string, schedule: 'daily' | 'weekly' | 'custom', intervalDays?: number) => {
    setFavorites(prev => prev.map(f => f.id === id ? { ...f, schedule, intervalDays: intervalDays ?? f.intervalDays } : f));
  };

  const filteredLibrary = libraryCategory === 'All'
    ? AFFIRMATION_LIBRARY
    : AFFIRMATION_LIBRARY.filter(a => a.category === libraryCategory);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  // ── REHEARSAL VIEW ──
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

  // ── WIZARD VIEW ──
  if (view === 'wizard') {
    return (
      <div className="animate-fadeIn max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 gradient-text flex items-center gap-3">
          <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} /> Affirmation Wizard
        </h1>
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

  // ── LIBRARY VIEW ──
  if (view === 'library') {
    return (
      <div className="animate-fadeIn max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
            <BookOpen size={28} style={{ color: 'var(--accent-primary)' }} /> Affirmation Library
          </h1>
          <button onClick={() => setView('list')} className="btn-ghost">← Back</button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setLibraryCategory('All')}
            className={`tab-btn ${libraryCategory === 'All' ? 'active' : ''}`}
          >All</button>
          {AFFIRMATION_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setLibraryCategory(cat)}
              className={`tab-btn ${libraryCategory === cat ? 'active' : ''}`}
            >{cat}</button>
          ))}
        </div>

        {/* Library Cards */}
        <div className="space-y-3">
          {filteredLibrary.map(item => {
            const faved = isFavorite(item.id);
            const favData = favorites.find(f => f.id === item.id);
            return (
              <div key={item.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-base font-medium mb-2" style={{ fontFamily: 'Lora, serif' }}>
                      "{item.text}"
                    </p>
                    <span className="tag">{item.category}</span>
                  </div>
                  <button
                    onClick={() => toggleFavorite(item)}
                    className="p-2 rounded-xl transition-all hover:scale-110"
                    style={{ color: faved ? 'var(--accent-rose)' : 'var(--text-muted)' }}
                    title={faved ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart size={20} fill={faved ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Schedule controls for favorites */}
                {faved && favData && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>PRACTICE SCHEDULE</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {(['daily', 'weekly', 'custom'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => updateSchedule(item.id, s, s === 'daily' ? 1 : s === 'weekly' ? 7 : favData.intervalDays)}
                          className={`category-chip ${favData.schedule === s ? 'active' : ''}`}
                        >
                          {s === 'daily' ? '🔁 Daily' : s === 'weekly' ? '📅 Weekly' : '⚙️ Custom'}
                        </button>
                      ))}
                      {favData.schedule === 'custom' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Every</span>
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={favData.intervalDays}
                            onChange={e => updateSchedule(item.id, 'custom', Math.max(1, Number(e.target.value)))}
                            className="input-glass"
                            style={{ width: '60px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          />
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>days</span>
                        </div>
                      )}
                    </div>
                    {favData.lastPracticed && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={10} className="inline mr-1" />
                        Last practiced: {new Date(favData.lastPracticed).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs mt-6 pb-8" style={{ color: 'var(--text-muted)' }}>
          {favorites.length} affirmation{favorites.length !== 1 ? 's' : ''} saved to favorites
        </p>
      </div>
    );
  }

  // ── MAIN LIST VIEW ──
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Sparkles size={28} style={{ color: 'var(--accent-primary)' }} /> Neuro-Affirmations
        </h1>
        <div className="flex items-center gap-3">
          {streak > 0 && <div className="streak-badge"><Flame size={14}/> {streak} day streak</div>}
          <button onClick={() => setView('library')} className="btn-ghost flex items-center gap-2">
            <BookOpen size={16}/> Explore Library
          </button>
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

      {/* Today's Practice (Scheduled Favorites) */}
      {todaysPractice.length > 0 && (
        <div className="glass-card p-6 mb-6" style={{ borderColor: 'rgba(184,169,232,0.15)' }}>
          <div className="section-label flex items-center gap-2">
            <Calendar size={12} /> Today's Practice ({todaysPractice.length})
          </div>
          <div className="space-y-3 mt-3">
            {todaysPractice.map(fav => (
              <div key={fav.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ fontFamily: 'Lora, serif' }}>"{fav.text}"</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="tag">{fav.category}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {fav.schedule === 'daily' ? '🔁 Daily' : fav.schedule === 'weekly' ? '📅 Weekly' : `⚙️ Every ${fav.intervalDays}d`}
                    </span>
                  </div>
                </div>
                <button onClick={() => startFavoriteRehearsal(fav)} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                  <Play size={14}/> Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Affirmation Cards */}
      {affirmations.length > 0 && (
        <>
          <div className="section-label flex items-center gap-2 mt-8 mb-3">
            <Sparkles size={12} /> Your Custom Affirmations
          </div>
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
        </>
      )}

      {/* Favorited Affirmations */}
      {favorites.length > 0 && (
        <>
          <div className="section-label flex items-center gap-2 mt-8 mb-3">
            <Heart size={12} /> Favorite Affirmations
          </div>
          <div className="space-y-3">
            {favorites.map(fav => (
              <div key={fav.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ fontFamily: 'Lora, serif' }}>"{fav.text}"</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="tag">{fav.category}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {fav.schedule === 'daily' ? '🔁 Daily' : fav.schedule === 'weekly' ? '📅 Weekly' : `⚙️ Every ${fav.intervalDays}d`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startFavoriteRehearsal(fav)} className="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1">
                    <Play size={12}/> Practice
                  </button>
                  <button onClick={() => setFavorites(favorites.filter(f => f.id !== fav.id))}
                    style={{ color: 'var(--accent-rose)' }} className="hover:opacity-70 p-1">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {affirmations.length === 0 && favorites.length === 0 && (
        <div className="glass-card text-center py-12">
          <Sparkles size={40} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No affirmations yet.</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Create your own or explore the library to get started!
          </p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={() => setView('wizard')} className="btn-primary flex items-center gap-2">
              <Plus size={16}/> Create Custom
            </button>
            <button onClick={() => setView('library')} className="btn-ghost flex items-center gap-2">
              <BookOpen size={16}/> Browse Library
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
