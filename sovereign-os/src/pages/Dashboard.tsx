import React, { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Check, Smile } from 'lucide-react';

export default function Dashboard() {
  const today = new Date().toISOString().split('T')[0];
  const [completed, setCompleted] = usePersistentStore<boolean>(`completed-${today}`, false);
  const [mood, setMood] = usePersistentStore<number>(`mood-${today}`, 5);
  const [habits] = usePersistentStore<Record<string, boolean>>('habit-history', {});
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Closure */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Daily Closure</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCompleted(!completed)}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                completed ? 'bg-emerald-500/20 border-2 border-emerald-400' : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'
              }`}
            >
              <Check size={32} className={completed ? 'text-emerald-400' : 'text-gray-500'} />
            </button>
            <span className="text-gray-300">{completed ? 'Tasks Completed!' : 'Did you complete tasks?'}</span>
          </div>
        </div>

        {/* Mood Pulse */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-200 flex items-center gap-2">
            <Smile size={20} /> Mood Pulse
          </h3>
          <input
            type="range"
            min="1"
            max="10"
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none bg-white/10 cursor-pointer"
          />
          <div className="text-4xl font-bold text-center mt-4 gradient-text">{mood} / 10</div>
        </div>

        {/* Habit Heatmap */}
        <div className="gloss-card p-6 md:col-span-2 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Habit Heatmap (30 Days)</h3>
          <div className="grid grid-cols-7 gap-1">
            {last30Days.map((day, i) => (
              <div
                key={i}
                title={day}
                className={`w-4 h-4 rounded-sm ${habits[`completed-${day}`] ? 'bg-emerald-500' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}