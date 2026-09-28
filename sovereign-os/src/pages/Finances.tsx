import { useState, useEffect } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Plus, Trash2, IndianRupee, TrendingUp, TrendingDown, Repeat } from 'lucide-react';
import { todayKey, todayMonthKey, monthsBetween } from '../lib/date';
import type { Txn } from '../lib/types';

type RecurringCategory = 'Rent' | 'EMI' | 'Helper Salary' | 'Other';
type RecurringEntry = {
  id: string; label: string; category: RecurringCategory; amount: number; dueDay: number;
  startMonth: string; durationMonths: number; lastPostedMonth: string;
};

const RECURRING_CATEGORIES: RecurringCategory[] = ['Rent', 'EMI', 'Helper Salary', 'Other'];
const INR = '₹';

export default function Finances() {
  const [txns, setTxns] = usePersistentStore<Txn[]>('finance-txns', []);
  const [recurring, setRecurring] = usePersistentStore<RecurringEntry[]>('finance-recurring', []);
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [typ, setTyp] = useState<'income' | 'expense'>('income');
  const [rcCategory, setRcCategory] = useState<RecurringCategory>('Rent');
  const [rcLabel, setRcLabel] = useState(''); const [rcAmount, setRcAmount] = useState('');
  const [rcDueDay, setRcDueDay] = useState('1'); const [rcDuration, setRcDuration] = useState('');
  const income = txns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expense = txns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const net = income - expense;

  const addTxn = () => {
    if (!desc || !amt) return;
    setTxns([...txns, { id: crypto.randomUUID(), date: todayKey(), desc, amount: Number(amt), type: typ }]);
    setDesc(''); setAmt('');
  };

  const addRecurring = () => {
    if (!rcLabel || !rcAmount) return;
    setRecurring([...recurring, {
      id: crypto.randomUUID(), label: rcLabel, category: rcCategory, amount: Number(rcAmount),
      dueDay: Number(rcDueDay) || 1, startMonth: todayMonthKey(), durationMonths: Number(rcDuration) || 0,
      lastPostedMonth: '',
    }]);
    setRcLabel(''); setRcAmount(''); setRcDueDay('1'); setRcDuration('');
  };

  // Auto-post this month's occurrence of each active recurring entry (checked whenever the app is opened)
  useEffect(() => {
    const thisMonth = todayMonthKey();
    const due = recurring.filter(r => {
      if (r.lastPostedMonth === thisMonth) return false;
      if (r.durationMonths > 0 && monthsBetween(r.startMonth, thisMonth) >= r.durationMonths) return false;
      return true;
    });
    if (due.length === 0) return;
    setTxns(prev => [
      ...prev,
      ...due.map(r => ({ id: crypto.randomUUID(), date: todayKey(), desc: `${r.category}: ${r.label}`, amount: r.amount, type: 'expense' as const })),
    ]);
    setRecurring(prev => prev.map(r => due.some(d => d.id === r.id) ? { ...r, lastPostedMonth: thisMonth } : r));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recurring]);

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 gradient-text flex items-center gap-3">
        <IndianRupee size={28} style={{ color: 'var(--accent-warm)' }} /> Finances
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} style={{ color: 'var(--accent-sage)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Income</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-sage)' }}>{INR}{income.toLocaleString('en-IN')}</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} style={{ color: 'var(--accent-rose)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Expenses</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'var(--accent-rose)' }}>{INR}{expense.toLocaleString('en-IN')}</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee size={16} style={{ color: net >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Net Worth</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: net >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>
            {INR}{net.toLocaleString('en-IN')}
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

      {/* Recurring Monthly Entries */}
      <div className="glass-card p-6 mb-6">
        <div className="section-label flex items-center gap-2"><Repeat size={12}/> Recurring Monthly Entries</div>
        <div className="flex flex-wrap gap-4 mt-3 items-end">
          <select value={rcCategory} onChange={e => setRcCategory(e.target.value as RecurringCategory)} className="input-glass" style={{ width: 'auto' }}>
            {RECURRING_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={rcLabel} onChange={e => setRcLabel(e.target.value)} placeholder={`e.g., ${rcCategory === 'EMI' ? 'Home Loan EMI' : rcCategory === 'Helper Salary' ? 'Maid & Cook Salary' : rcCategory === 'Rent' ? 'Apartment Rent' : 'Custom label'}`} className="input-glass flex-1 min-w-[160px]" />
          <input type="number" value={rcAmount} onChange={e => setRcAmount(e.target.value)} placeholder="Amount" className="input-glass w-28" />
          <input type="number" value={rcDueDay} onChange={e => setRcDueDay(e.target.value)} placeholder="Due Day (1-31)" className="input-glass w-32" />
          <input type="number" value={rcDuration} onChange={e => setRcDuration(e.target.value)} placeholder="Months (blank = ongoing)" className="input-glass w-44" />
          <button onClick={addRecurring} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add</button>
        </div>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Auto-added as an expense transaction for the current month, the next time you open this page. Use "Months" for an EMI that should stop after N months — leave it blank for ongoing items like Rent or Helper Salary.
        </p>
        {recurring.length > 0 && (
          <div className="space-y-2 mt-4">
            {recurring.map(r => {
              const elapsed = monthsBetween(r.startMonth, todayMonthKey()) + (r.lastPostedMonth ? 1 : 0);
              const finished = r.durationMonths > 0 && elapsed >= r.durationMonths;
              return (
                <div key={r.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--bg-card-hover)', opacity: finished ? 0.5 : 1 }}>
                  <div className="flex items-center gap-3">
                    <span className="category-chip active text-xs">{r.category}</span>
                    <span className="text-sm">{r.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {INR}{r.amount.toLocaleString('en-IN')}/mo · Due day {r.dueDay} · {finished ? 'Finished' : r.durationMonths > 0 ? `Month ${Math.min(elapsed, r.durationMonths)} of ${r.durationMonths}` : 'Ongoing'}
                    </span>
                  </div>
                  <button onClick={() => setRecurring(recurring.filter(x => x.id !== r.id))}
                    style={{ color: 'var(--accent-rose)' }} className="hover:opacity-70" title="Stop recurring entry">
                    <Trash2 size={14}/>
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
                {t.type === 'income' ? '+' : '-'}{INR}{t.amount.toLocaleString('en-IN')}
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

