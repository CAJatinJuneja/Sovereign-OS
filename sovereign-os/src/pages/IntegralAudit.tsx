import { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';

export default function IntegralAudit() {
  const today = new Date().toISOString().split('T')[0];
  const [step, setStep] = useState(0);
  const [entry, setEntry] = usePersistentStore(`audit-${today}`, {
    bedTime: '', wakeTime: '', energy: 5, morningProtocol: false,
    learned: '', blockers: '', deepWork: 0, gratitude: ['','',''],
    flow: 5, connection: false, trigger: '', shadow: ''
  });
  const update = (k: string, v: any) => setEntry({ ...entry, [k]: v });
  const steps = ['Body','Mind','Spirit','Shadow'];
  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Integral Audit</h1>
      <div className="flex gap-2 mb-6">
        {steps.map((s,i) => (
          <button key={s} onClick={()=>setStep(i)} className={`px-4 py-2 rounded-xl ${i===step?'bg-indigo-500/20 text-indigo-300':'text-gray-400 hover:bg-white/5'}`}>{s}</button>
        ))}
      </div>
      <div className="gloss-card p-8 space-y-6">
        {step===0 && <>
          <div className="grid grid-cols-2 gap-4">
            <label><span className="text-sm text-gray-400">Time to Bed</span><input type="time" value={entry.bedTime} onChange={e=>update('bedTime',e.target.value)} className="input-glass w-full mt-1"/></label>
            <label><span className="text-sm text-gray-400">Time Awake</span><input type="time" value={entry.wakeTime} onChange={e=>update('wakeTime',e.target.value)} className="input-glass w-full mt-1"/></label>
          </div>
          <label><span className="text-sm text-gray-400">Energy Level: {entry.energy}/10</span><input type="range" min="1" max="10" value={entry.energy} onChange={e=>update('energy',+e.target.value)} className="w-full mt-2"/></label>
          <label className="flex items-center gap-3"><input type="checkbox" checked={entry.morningProtocol} onChange={e=>update('morningProtocol',e.target.checked)} className="w-5 h-5"/>Morning Protocol?</label>
        </>}
        {step===1 && <>
          <textarea value={entry.learned} onChange={e=>update('learned',e.target.value)} placeholder="What did you learn today?" className="input-glass w-full h-24"/>
          <textarea value={entry.blockers} onChange={e=>update('blockers',e.target.value)} placeholder="Project blockers..." className="input-glass w-full h-24"/>
          <label><span className="text-sm text-gray-400">Deep Work Hours</span><input type="number" min="0" max="24" value={entry.deepWork} onChange={e=>update('deepWork',+e.target.value)} className="input-glass w-32 mt-1"/></label>
        </>}
        {step===2 && <>
          {[0,1,2].map(i=><input key={i} value={entry.gratitude[i]} onChange={e=>{const g=[...entry.gratitude];g[i]=e.target.value;setEntry({...entry,gratitude:g});}} placeholder={`${i+1}. I'm grateful for...`} className="input-glass w-full mb-2"/>)}
          <label><span className="text-sm text-gray-400">Flow Rating: {entry.flow}/10</span><input type="range" min="1" max="10" value={entry.flow} onChange={e=>update('flow',+e.target.value)} className="w-full mt-2"/></label>
        </>}
        {step===3 && <>
          <textarea value={entry.trigger} onChange={e=>update('trigger',e.target.value)} placeholder="What triggered you today?" className="input-glass w-full h-24"/>
          <textarea value={entry.shadow} onChange={e=>update('shadow',e.target.value)} placeholder="Shadow work reflection..." className="input-glass w-full h-32"/>
        </>}
        <div className="flex justify-between pt-4">
          <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50">Back</button>
          <button onClick={()=>setStep(s=>Math.min(3,s+1))} disabled={step===3} className="btn-primary">Next</button>
        </div>
      </div>
    </div>
  );
}