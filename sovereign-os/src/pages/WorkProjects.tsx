import React, { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Plus, Play, Pause, RotateCcw, Trash2 } from 'lucide-react';

type Task = { id: string; title: string; status: 'todo' | 'inProgress' | 'done' };

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
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
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Work &amp; Projects</h1>
      
      {/* Pomodoro Timer */}
      <div className="glass-card p-6 mb-8 flex items-center gap-6">
        <div className="text-4xl font-mono font-bold gradient-text">{formatTime(timer)}</div>
        <button onClick={() => setIsRunning(!isRunning)} className="btn-primary flex items-center gap-2">
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button onClick={() => { setTimer(25 * 60); setIsRunning(false); }} className="p-3 rounded-xl bg-white/5 hover:bg-white/10">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* New Task Input */}
      <div className="flex gap-4 mb-8">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
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
            <h3 className="font-semibold text-lg mb-4">{col.title}</h3>
            <div className="space-y-3">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="bg-white/5 rounded-xl p-3 flex items-center justify-between group">
                  <span>{task.title}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    {col.id !== 'done' && (
                      <button onClick={() => moveTask(task.id, col.id === 'todo' ? 'inProgress' : 'done')} className="text-xs px-2 py-1 bg-indigo-500/20 rounded">→</button>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
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