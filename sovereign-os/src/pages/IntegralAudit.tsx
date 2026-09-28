import { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { BookOpen, Heart } from 'lucide-react';
import { todayKey } from '../lib/date';

const STEPS = ['Body', 'Mind', 'Spirit', 'Shadow'];

export default function IntegralAudit() {
  const today = todayKey();
  const [step, setStep] = useState(0);
  const [entry, setEntry] = usePersistentStore('audit-' + today, {
    bedTime: '', wakeTime: '', energy: 5, morningProtocol: false,
    learned: '', blockers: '', deepWork: 0, gratitude: ['', '', ''],
    flow: 5, connection: false, trigger: '', shadow: ''
  });
  const update = (k: string, v: any) => setEntry({ ...entry, [k]: v });

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 gradient-text flex items-center gap-3">
        <BookOpen size={28} style={{ color: 'var(--accent-lavender)' }} /> Integral Audit
      </h1>

      {/* Step Tabs */}
      <div className="flex gap-2 mb-6">
        {STEPS.map((label, i) => (
          <button key={label} onClick={() => setStep(i)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={i === step
              ? { background: 'var(--accent-primary-dim)', color: 'var(--accent-primary)' }
              : { color: 'var(--text-muted)' }
            }>
            {label}
          </button>
        ))}
      </div>

      {/* Step Progress */}
      <div className="flex gap-1 mb-6">
        {STEPS.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i <= step ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)' }} />
        ))}
      </div>

      <div className="glass-card p-8 space-y-6">
        {step === 0 && <>
          <div className="grid grid-cols-2 gap-4">
            <label>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Time to Bed</span>
              <input type="time" value={entry.bedTime} onChange={e => update('bedTime', e.target.value)} className="input-glass w-full mt-1"/>
            </label>
            <label>
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Time Awake</span>
              <input type="time" value={entry.wakeTime} onChange={e => update('wakeTime', e.target.value)} className="input-glass w-full mt-1"/>
            </label>
          </div>
          <label>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Energy Level: {entry.energy}/10</span>
            <input type="range" min="1" max="10" value={entry.energy} onChange={e => update('energy', +e.target.value)} className="w-full mt-2"/>
          </label>
          <label className="flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <input type="checkbox" checked={entry.morningProtocol} onChange={e => update('morningProtocol', e.target.checked)} className="w-5 h-5"/>
            Morning Protocol Complete?
          </label>
        </>}

        {step === 1 && <>
          <div>
            <span className="section-label">What did you learn today?</span>
            <textarea value={entry.learned} onChange={e => update('learned', e.target.value)} placeholder="Insights, lessons, new knowledge..." className="input-glass w-full mt-2" rows={4}/>
          </div>
          <div>
            <span className="section-label">Project Blockers</span>
            <textarea value={entry.blockers} onChange={e => update('blockers', e.target.value)} placeholder="What's blocking progress?" className="input-glass w-full mt-2" rows={4}/>
          </div>
          <label>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Deep Work Hours</span>
            <input type="number" min="0" max="24" value={entry.deepWork} onChange={e => update('deepWork', +e.target.value)} className="input-glass w-32 mt-1"/>
          </label>
        </>}

        {step === 2 && <>
          <div className="section-label flex items-center gap-2" style={{ color: 'var(--accent-warm)' }}>
            <Heart size={12}/> Gratitude
          </div>
          {[0, 1, 2].map(i => (
            <input key={i} value={entry.gratitude[i]}
              onChange={e => { const g = [...entry.gratitude]; g[i] = e.target.value; setEntry({...entry, gratitude: g}); }}
              placeholder={(i + 1) + ". I'm grateful for..."}
              className="input-glass w-full"/>
          ))}
          <label>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Flow Rating: {entry.flow}/10</span>
            <input type="range" min="1" max="10" value={entry.flow} onChange={e => update('flow', +e.target.value)} className="w-full mt-2"/>
          </label>
        </>}

        {step === 3 && <>
          <div>
            <span className="section-label" style={{ color: 'var(--accent-warm)' }}>What triggered you today?</span>
            <textarea value={entry.trigger} onChange={e => update('trigger', e.target.value)} placeholder="Identify emotional triggers..." className="input-glass w-full mt-2" rows={4}/>
          </div>
          <div>
            <span className="section-label" style={{ color: 'var(--accent-lavender)' }}>Shadow Work Reflection</span>
            <textarea value={entry.shadow} onChange={e => update('shadow', e.target.value)} placeholder="Explore the parts of yourself you usually hide..." className="input-glass w-full mt-2" rows={5}/>
          </div>
        </>}

        <div className="flex justify-between pt-4">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="btn-ghost disabled:opacity-30">Back</button>
          <button onClick={() => setStep(s => Math.min(3, s + 1))} disabled={step === 3}
            className="btn-primary">Next</button>
        </div>
      </div>
    </div>
  );
}
