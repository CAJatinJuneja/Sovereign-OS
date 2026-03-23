import React, { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Plus, Play, Pause, RotateCcw, Trash2, ArrowRight, Briefcase } from 'lucide-react';

type Task = { id: string; title: string; status: 'todo' | 'inProgress' | 'done' };

const columns = [
  { id: 'todo', title: 'To Do', accent: 'var(--accent-primary)' },
  { id: 'inProgress', title: 'In Progress', accent: 'var(--accent-warm)' },
  { id: 'done', title: 'Done', accent: 'var(--accent-sage)' },
];

export default function WorkProjects() {
  const [tasks, setTasks] = usePersistentStore<Task[]>('kanban-tasks', []);
  const [newTask, setNewTask] = useState('');
  const [timer, setTimer] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimer(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), title: newTask, status: 'todo' }]);
    setNewTask('');
  };

  const moveTask = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = String(s % 60).padStart(2, '0');
    return m + ':' + sec;
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 gradient-text flex items-center gap-3">
        <Briefcase size={28} style={{ color: 'var(--accent-primary)' }} /> Work & Projects
      </h1>

      {/* Pomodoro Timer */}
      <div className="glass-card p-6 mb-8 flex items-center gap-6">
        <div className="text-4xl font-mono font-bold gradient-text">{formatTime(timer)}</div>
        <button onClick={() => setIsRunning(!isRunning)} className="btn-primary flex items-center gap-2">
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { setTimer(25 * 60); setIsRunning(false); }}
          className="p-3 rounded-xl transition-colors"
          style={{ background: 'var(--bg-card-hover)' }}>
          <RotateCcw size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>

      {/* New Task Input */}
      <div className="flex gap-4 mb-8">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add new task..."
          className="input-glass flex-1"
        />
        <button onClick={addTask} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.id} className="glass-card p-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: col.accent }} />
              {col.title}
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </h3>
            <div className="space-y-3">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="rounded-xl p-3 flex items-center justify-between group transition-colors"
                  style={{ background: 'var(--bg-card-hover)' }}>
                  <span className="text-sm">{task.title}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {col.id !== 'done' && (
                      <button onClick={() => moveTask(task.id, col.id === 'todo' ? 'inProgress' : 'done')}
                        className="p-1 rounded transition-colors" style={{ color: 'var(--accent-primary)' }}>
                        <ArrowRight size={14} />
                      </button>
                    )}
                    <button onClick={() => deleteTask(task.id)}
                      className="p-1 rounded transition-colors" style={{ color: 'var(--accent-rose)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
