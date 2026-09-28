import { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

export type Task = { id: string; title: string; status: 'todo' | 'inProgress' | 'done' };

const columns = [
  { id: 'todo', title: 'To Do', accent: 'var(--accent-primary)' },
  { id: 'inProgress', title: 'In Progress', accent: 'var(--accent-warm)' },
  { id: 'done', title: 'Done', accent: 'var(--accent-sage)' },
] as const;

export default function TaskBoard({ storageKey }: { storageKey: string }) {
  const [tasks, setTasks] = usePersistentStore<Task[]>(storageKey, []);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), title: newTask, status: 'todo' }]);
    setNewTask('');
  };

  const moveTask = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  return (
    <div>
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
