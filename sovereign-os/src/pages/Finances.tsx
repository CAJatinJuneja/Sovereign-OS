import React, { useState } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Plus, Trash2 } from 'lucide-react';

type Txn = { id: string; date: string; desc: string; amount: number; type: 'income' | 'expense' };

export default function Finances() {
  const [txns, setTxns] = usePersistentStore<Txn[]>('finance-txns', []);
  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [typ, setTyp] = useState<'income' | 'expense'>('income');
  const income = txns.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0);
  const expense = txns.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0);
  const addTxn = () => {
    if (!desc || !amt) return;
    setTxns([...txns, { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], desc, amount: Number(amt), type: typ }]);
    setDesc(''); setAmt('');
  };
  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Finances</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="gloss-card p-6"><p className="text-sm text-gray-400">Income</p><p className="text-2xl font-bold text-emerald-400">${income.toLocaleString()}</p></div>
        <div className="glass-card p-6"><p className="text-sm text-gray-400">Expenses</p><p className="text-2xl font-bold text-red-400">${expense.toLocaleString()}</p></div>
        <div className="glass-card p-6"><p className="text-sm text-gray-400">Net Worth</p><p className={`text-2xl font-bold ${income-expense>=0?'text-emerald-400':'text-red-400'}`}>${(income-expense).toLocaleString()}</p></div>
      </div>
      <div className="gloss-card p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="input-glass flex-1 min-w-[200px]"/>
          <input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Amount" className="input-glass w-32"/>
          <select value={typ} onChange={e=>setTyp(e.target.value as 'income'|'expense')} className="input-glass"><option value="income">Income</option><option value="expense">Expense</option></select>
          <button onClick={addTxn} className="btn-primary flex items-center gap-2"><Plus size={18}/>Add</button>
        </div>
      </div>
      <div className="space-y-2">
        {txns.slice().reverse().map(t=>(
          <div key={t.id} className="glass-card p-4 flex justify-between items-center">
            <div><span className="text-gray-400 text-sm">{t.date}</span><span className="ml-4">{t.desc}</span></div>
            <div className="flex items-center gap-4"><span className={t.type==='income'?'text-emerald-400':'text-red-400'}>{t.type==='income'?'+':'-'}${t.amount}</span><button onClick={()=>setTxns(txns.filter(x=>x.id!==t.id))} className="text-red-400"><Trash2 size={16}/></button></div>
          </div>
        ))}
      </div>
    </div>
  );
}