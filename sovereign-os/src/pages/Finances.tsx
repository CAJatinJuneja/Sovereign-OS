import { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

type Txn = { id: string; date: string; desc: string; amount: number; type: 'income' | 'expense' };

export default function Finances() {
  const [txns, setTxns] = usePersistentStore<Txn[]>('finance-txns', []);
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [typ, setTyp] = useState<'income' | 'expense'>('income');
  const income = txns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expense = txns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const net = income - expense;

  const addTxn = () => {
    if (!desc || !amt) return;
    setTxns([...txns, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], desc, amount: Number(amt), type: typ }]);
    setDesc(''); setAmt('');
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 gradient-text flex items-center gap-3">
        <DollarSign size={28} style={{ color: 'var(--accent-warm)' }} /> Finances
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} style={{ color: 'var(--accent-sage)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Income</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-sage)' }}>${income.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} style={{ color: 'var(--accent-rose)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Expenses</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-rose)' }}>${expense.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} style={{ color: net >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Net Worth</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: net >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>
            ${net.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add Transaction */}
      <div className="glass-card p-6 mb-6">
        <div className="section-label">New Transaction</div>
        <div className="flex flex-wrap gap-4 items-end mt-3">
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="input-glass flex-1 min-w-[200px]"/>
          <input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="Amount" className="input-glass w-32"/>
          <select value={typ} onChange={e => setTyp(e.target.value as 'income' | 'expense')} className="input-glass" style={{ width: 'auto' }}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <button onClick={addTxn} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add</button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {txns.slice().reverse().map(t => (
          <div key={t.id} className="glass-card p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t.date}</span>
              <span>{t.desc}</span>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ color: t.type === 'income' ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>
                {t.type === 'income' ? '+' : '-'}${t.amount}
              </span>
              <button onClick={() => setTxns(txns.filter(x => x.id !== t.id))}
                style={{ color: 'var(--accent-rose)' }} className="hover:opacity-70 transition-opacity">
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {txns.length === 0 && (
        <div className="glass-card text-center py-12">
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No transactions yet. Add your first one above!</p>
        </div>
      )}
    </div>
  );
}
