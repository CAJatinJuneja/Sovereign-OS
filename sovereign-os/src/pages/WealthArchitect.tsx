import { useState, useMemo } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Landmark, Plus, Trash2, AlertCircle, Building2, ShoppingBag, IndianRupee, Shield, TrendingUp, Clock3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { todayKey } from '../lib/date';
import type { Txn } from '../lib/types';

type Liability = { id: string; name: string; totalAmount: number; interestRate: number; emiAmount: number; remainingMonths: number; dueDay: number };
type BankAccount = { id: string; name: string; openingBalance: number; currentBalance: number };
type InvestmentCategory = 'Equity' | 'Mutual Fund' | 'Fixed Deposit' | 'Other';
type HorizonBucket = 'Safety Net' | 'Short Term' | 'Long Term';
type Investment = { id: string; name: string; category: InvestmentCategory; value: number; horizon: HorizonBucket };
type SplitEntry = { id: string; person: string; amount: number; type: 'receivable' | 'payable'; note: string };
type Expense = { id: string; date: string; desc: string; amount: number; category: string };

const CATEGORIES = ['Food', 'Travel', 'Medical', 'Shopping', 'Bills', 'Education', 'Other'];
const INVESTMENT_CATEGORIES: InvestmentCategory[] = ['Equity', 'Mutual Fund', 'Fixed Deposit', 'Other'];
const HORIZONS: HorizonBucket[] = ['Safety Net', 'Short Term', 'Long Term'];
const HORIZON_HINT: Record<HorizonBucket, string> = {
  'Safety Net': '6 months of expenses, kept liquid',
  'Short Term': '6 months – 3 years',
  'Long Term': '3+ years',
};
const INR = '₹';

function ExpenseForm({ desc, setDesc, amt, setAmt, cat, setCat, onAdd }: {
  desc: string; setDesc: (v: string) => void;
  amt: string; setAmt: (v: string) => void;
  cat: string; setCat: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" className="input-glass flex-1 min-w-[180px]" />
      <input type="number" value={amt} onChange={e => setAmt(e.target.value)} placeholder="Amount" className="input-glass w-28" />
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`category-chip ${cat === c ? 'active' : ''}`}>{c}</button>
        ))}
      </div>
      <button onClick={onAdd} className="btn-primary flex items-center gap-1"><Plus size={16}/> Add</button>
    </div>
  );
}

export default function WealthArchitect() {
  const [liabilities, setLiabilities] = usePersistentStore<Liability[]>('wealth-liabilities', []);
  const [accounts, setAccounts] = usePersistentStore<BankAccount[]>('wealth-accounts', []);
  const [investments, setInvestments] = usePersistentStore<Investment[]>('wealth-investments', []);
  const [splits, setSplits] = usePersistentStore<SplitEntry[]>('wealth-split', []);
  const [expenses, setExpenses] = usePersistentStore<Expense[]>('wealth-expenses', []);
  const [financeTxns] = usePersistentStore<Txn[]>('finance-txns', []);
  const [tab, setTab] = useState<'overview' | 'accounts' | 'investments' | 'splitwise' | 'liabilities' | 'expenses'>('overview');

  // Form states
  const [lName, setLName] = useState(''); const [lTotal, setLTotal] = useState('');
  const [lRate, setLRate] = useState(''); const [lEmi, setLEmi] = useState('');
  const [lMonths, setLMonths] = useState(''); const [lDue, setLDue] = useState('1');
  const [baName, setBaName] = useState(''); const [baOpening, setBaOpening] = useState(''); const [baCurrent, setBaCurrent] = useState('');
  const [invName, setInvName] = useState(''); const [invValue, setInvValue] = useState('');
  const [invCategory, setInvCategory] = useState<InvestmentCategory>('Equity');
  const [invHorizon, setInvHorizon] = useState<HorizonBucket>('Long Term');
  const [spPerson, setSpPerson] = useState(''); const [spAmount, setSpAmount] = useState('');
  const [spType, setSpType] = useState<'receivable' | 'payable'>('receivable'); const [spNote, setSpNote] = useState('');
  const [eDesc, setEDesc] = useState(''); const [eAmt, setEAmt] = useState('');
  const [eCat, setECat] = useState('Other');

  const today = todayKey();
  const totalBankBalance = accounts.reduce((a, x) => a + x.currentBalance, 0);
  const totalInvestments = investments.reduce((a, x) => a + x.value, 0);
  const totalLiabilities = liabilities.reduce((a, x) => a + (x.emiAmount * x.remainingMonths), 0);
  const monthlyEmi = liabilities.reduce((a, x) => a + x.emiAmount, 0);
  const todayExpenses = expenses.filter(e => e.date === today).reduce((a, e) => a + e.amount, 0);

  const totalReceivable = splits.filter(s => s.type === 'receivable').reduce((a, x) => a + x.amount, 0);
  const totalPayable = splits.filter(s => s.type === 'payable').reduce((a, x) => a + x.amount, 0);
  const splitNet = totalReceivable - totalPayable;

  // Auto-populate from Finances
  const financeIncome = financeTxns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const financeExpense = financeTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const financeNet = financeIncome - financeExpense;

  const netWorth = totalBankBalance + totalInvestments + splitNet + financeNet - totalLiabilities;

  // Horizon breakdown — bank balances count as Safety Net (liquid, no horizon pick needed)
  const safetyNetTotal = totalBankBalance + investments.filter(i => i.horizon === 'Safety Net').reduce((s, i) => s + i.value, 0);
  const shortTermTotal = investments.filter(i => i.horizon === 'Short Term').reduce((s, i) => s + i.value, 0);
  const longTermTotal = investments.filter(i => i.horizon === 'Long Term').reduce((s, i) => s + i.value, 0);

  const monthsWithExpenses = new Set(expenses.map(e => e.date.slice(0, 7))).size || 1;
  const avgMonthlyExpense = expenses.reduce((a, x) => a + x.amount, 0) / monthsWithExpenses;
  const safetyNetTarget = avgMonthlyExpense * 6;
  const safetyNetProgress = safetyNetTarget > 0 ? Math.min(100, Math.round((safetyNetTotal / safetyNetTarget) * 100)) : 0;

  const chartData = useMemo(() => [
    { name: 'Bank Balance', value: totalBankBalance, color: '#7c8aff' },
    { name: 'Investments', value: totalInvestments, color: '#6bcb8b' },
    { name: 'Receivable', value: totalReceivable, color: '#a7b4ff' },
    { name: 'Payable', value: totalPayable, color: '#f4a261' },
    { name: 'Liabilities', value: totalLiabilities, color: '#f07088' },
    { name: 'Finance Net', value: financeNet, color: '#e8956d' },
  ], [totalBankBalance, totalInvestments, totalReceivable, totalPayable, totalLiabilities, financeNet]);

  const upcomingBills = useMemo(() => {
    const currentDay = new Date().getDate();
    return liabilities
      .map(l => ({ ...l, daysUntil: l.dueDay >= currentDay ? l.dueDay - currentDay : 30 - currentDay + l.dueDay }))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [liabilities]);

  const addLiability = () => {
    if (!lName || !lTotal) return;
    setLiabilities([...liabilities, { id: crypto.randomUUID(), name: lName, totalAmount: Number(lTotal), interestRate: Number(lRate) || 0, emiAmount: Number(lEmi) || 0, remainingMonths: Number(lMonths) || 0, dueDay: Number(lDue) || 1 }]);
    setLName(''); setLTotal(''); setLRate(''); setLEmi(''); setLMonths(''); setLDue('1');
  };

  const addAccount = () => {
    if (!baName || !baOpening) return;
    setAccounts([...accounts, { id: crypto.randomUUID(), name: baName, openingBalance: Number(baOpening), currentBalance: Number(baCurrent) || Number(baOpening) }]);
    setBaName(''); setBaOpening(''); setBaCurrent('');
  };

  const addInvestment = () => {
    if (!invName || !invValue) return;
    setInvestments([...investments, { id: crypto.randomUUID(), name: invName, category: invCategory, value: Number(invValue), horizon: invHorizon }]);
    setInvName(''); setInvValue('');
  };

  const addSplit = () => {
    if (!spPerson || !spAmount) return;
    setSplits([...splits, { id: crypto.randomUUID(), person: spPerson, amount: Number(spAmount), type: spType, note: spNote }]);
    setSpPerson(''); setSpAmount(''); setSpNote('');
  };

  const addExpense = () => {
    if (!eDesc || !eAmt) return;
    setExpenses([...expenses, { id: crypto.randomUUID(), date: today, desc: eDesc, amount: Number(eAmt), category: eCat }]);
    setEDesc(''); setEAmt('');
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Landmark size={28} style={{ color: 'var(--accent-primary)' }} /> Wealth Architect
        </h1>
      </div>

      {/* Net Worth Card */}
      <div className="glass-card p-6 mb-6" style={{ borderColor: netWorth >= 0 ? 'rgba(107,203,139,0.2)' : 'rgba(240,112,136,0.2)' }}>
        <div className="section-label">Live Net Worth</div>
        <div className="flex items-end gap-4">
          <p className="text-4xl font-bold" style={{ color: netWorth >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>
            {INR}{Math.abs(netWorth).toLocaleString('en-IN')}
          </p>
          <span className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
            ({netWorth >= 0 ? 'Positive' : 'Negative'})
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Bank Balance</span>
            <p className="text-lg font-semibold" style={{ color: 'var(--accent-sage)' }}>{INR}{totalBankBalance.toLocaleString('en-IN')}</p></div>
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Investments</span>
            <p className="text-lg font-semibold" style={{ color: 'var(--accent-sage)' }}>{INR}{totalInvestments.toLocaleString('en-IN')}</p></div>
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Liabilities</span>
            <p className="text-lg font-semibold" style={{ color: 'var(--accent-rose)' }}>{INR}{totalLiabilities.toLocaleString('en-IN')}</p></div>
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly EMI</span>
            <p className="text-lg font-semibold" style={{ color: 'var(--accent-warm)' }}>{INR}{monthlyEmi.toLocaleString('en-IN')}</p></div>
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Net Receivable</span>
            <p className="text-lg font-semibold" style={{ color: splitNet >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>{INR}{Math.abs(splitNet).toLocaleString('en-IN')}</p></div>
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Finance Net</span>
            <p className="text-lg font-semibold" style={{ color: financeNet >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>{INR}{financeNet.toLocaleString('en-IN')}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['overview', 'accounts', 'investments', 'splitwise', 'liabilities', 'expenses'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab === t ? 'active' : ''}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="glass-card p-6">
            <div className="section-label">Financial Overview</div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: '#8b95a9', fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fill: '#8b95a9', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e8ecf4' }}
                  formatter={(value: number | undefined) => [`${INR}${(value ?? 0).toLocaleString('en-IN')}`, '']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Net Worth by Horizon */}
          <div className="glass-card p-6">
            <div className="section-label flex items-center gap-2">
              <Shield size={12} /> Net Worth by Time Horizon
            </div>
            <div className="space-y-4 mt-3">
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="flex items-center gap-1.5"><Shield size={13} style={{ color: 'var(--accent-sage)' }}/> Safety Net</span>
                  <span className="font-semibold">{INR}{safetyNetTotal.toLocaleString('en-IN')}</span>
                </div>
                {safetyNetTarget > 0 && (
                  <>
                    <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-2 rounded-full transition-all duration-500"
                        style={{ width: safetyNetProgress + '%', background: 'var(--accent-sage)' }} />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {safetyNetProgress}% of {INR}{Math.round(safetyNetTarget).toLocaleString('en-IN')} target (6mo avg expenses)
                    </p>
                  </>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{HORIZON_HINT['Safety Net']}</p>
              </div>
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="flex items-center gap-1.5"><Clock3 size={13} style={{ color: 'var(--accent-warm)' }}/> Short Term</span>
                  <span className="font-semibold">{INR}{shortTermTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{HORIZON_HINT['Short Term']}</p>
              </div>
              <div>
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="flex items-center gap-1.5"><TrendingUp size={13} style={{ color: 'var(--accent-primary)' }}/> Long Term</span>
                  <span className="font-semibold">{INR}{longTermTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{HORIZON_HINT['Long Term']}</p>
              </div>
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="glass-card p-6">
            <div className="section-label flex items-center gap-2">
              <AlertCircle size={12} /> Upcoming EMI Payments
            </div>
            {upcomingBills.length > 0 ? (
              <div className="space-y-3 mt-3">
                {upcomingBills.map(b => (
                  <div key={b.id} className="flex justify-between items-center p-3 rounded-xl"
                    style={{ background: b.daysUntil <= 3 ? 'var(--accent-rose-dim)' : 'var(--bg-card)' }}>
                    <div>
                      <span className="text-sm font-medium">{b.name}</span>
                      <p className="text-xs" style={{ color: b.daysUntil <= 3 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                        Due in {b.daysUntil} days (Day {b.dueDay})
                      </p>
                    </div>
                    <span className="font-semibold" style={{ color: 'var(--accent-warm)' }}>{INR}{b.emiAmount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>No liabilities added yet.</p>
            )}
          </div>

          {/* Finances Integration Card */}
          <div className="glass-card p-6">
            <div className="section-label flex items-center gap-2">
              <IndianRupee size={12} /> From Finances Schedule
            </div>
            {financeTxns.length > 0 ? (
              <div className="space-y-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Income</span>
                  <span className="font-semibold" style={{ color: 'var(--accent-sage)' }}>{INR}{financeIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Expenses</span>
                  <span className="font-semibold" style={{ color: 'var(--accent-rose)' }}>{INR}{financeExpense.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 mt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Net from Finances</span>
                    <span className="text-lg font-bold" style={{ color: financeNet >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>
                      {INR}{financeNet.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  Auto-synced from {financeTxns.length} transaction{financeTxns.length !== 1 ? 's' : ''} in Finances
                </p>
              </div>
            ) : (
              <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
                No finance data yet. Add transactions in the Finances module to see them here.
              </p>
            )}
          </div>

          {/* Today's Spending */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="section-label mb-0">Today's Spending</div>
              <span className="text-lg font-bold" style={{ color: 'var(--accent-warm)' }}>{INR}{todayExpenses.toLocaleString('en-IN')}</span>
            </div>
            <div className="mb-4">
              <ExpenseForm desc={eDesc} setDesc={setEDesc} amt={eAmt} setAmt={setEAmt} cat={eCat} setCat={setECat} onAdd={addExpense} />
            </div>
            <div className="space-y-2">
              {expenses.filter(e => e.date === today).map(e => (
                <div key={e.id} className="glass-card p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="category-chip active">{e.category}</span>
                    <span className="text-sm">{e.desc}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ color: 'var(--accent-rose)' }}>-{INR}{e.amount.toLocaleString('en-IN')}</span>
                    <button onClick={() => setExpenses(expenses.filter(x => x.id !== e.id))}
                      style={{ color: 'var(--accent-rose)' }} className="hover:opacity-70"><Trash2 size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'accounts' && (
        <div>
          <div className="glass-card p-6 mb-6">
            <div className="section-label">Add Bank Account</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              <input value={baName} onChange={e => setBaName(e.target.value)} placeholder="Account Name" className="input-glass" />
              <input type="number" value={baOpening} onChange={e => setBaOpening(e.target.value)} placeholder="Opening Balance" className="input-glass" />
              <input type="number" value={baCurrent} onChange={e => setBaCurrent(e.target.value)} placeholder="Current Balance (optional)" className="input-glass" />
            </div>
            <button onClick={addAccount} className="btn-primary mt-4 flex items-center gap-2"><Plus size={18}/> Add Account</button>
          </div>
          <div className="space-y-3">
            {accounts.map(a => {
              const delta = a.currentBalance - a.openingBalance;
              return (
                <div key={a.id} className="glass-card p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{a.name}</h3>
                    <div className="flex gap-6 mt-1 text-sm">
                      <div><span style={{ color: 'var(--text-muted)' }}>Opening:</span> {INR}{a.openingBalance.toLocaleString('en-IN')}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Current:</span> {INR}{a.currentBalance.toLocaleString('en-IN')}</div>
                      <div style={{ color: delta >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>
                        {delta >= 0 ? '+' : ''}{INR}{delta.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setAccounts(accounts.filter(x => x.id !== a.id))}
                    style={{ color: 'var(--accent-rose)' }} className="hover:opacity-70 p-1"><Trash2 size={16}/></button>
                </div>
              );
            })}
            {accounts.length === 0 && (
              <div className="glass-card text-center py-12">
                <Building2 size={40} style={{ color: 'var(--accent-primary)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>No bank accounts added yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'investments' && (
        <div>
          <div className="glass-card p-6 mb-6">
            <div className="section-label">Add Investment</div>
            <div className="flex flex-wrap gap-4 mt-3">
              <input value={invName} onChange={e => setInvName(e.target.value)} placeholder="e.g., HDFC Bluechip Fund" className="input-glass flex-1 min-w-[180px]" />
              <input type="number" value={invValue} onChange={e => setInvValue(e.target.value)} placeholder="Current Value" className="input-glass w-40" />
              <select value={invCategory} onChange={e => setInvCategory(e.target.value as InvestmentCategory)} className="input-glass" style={{ width: 'auto' }}>
                {INVESTMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={invHorizon} onChange={e => setInvHorizon(e.target.value as HorizonBucket)} className="input-glass" style={{ width: 'auto' }}>
                {HORIZONS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <button onClick={addInvestment} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HORIZONS.map(horizon => (
              <div key={horizon}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {horizon === 'Safety Net' && <Shield size={18} style={{ color: 'var(--accent-sage)' }}/>}
                  {horizon === 'Short Term' && <Clock3 size={18} style={{ color: 'var(--accent-warm)' }}/>}
                  {horizon === 'Long Term' && <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }}/>}
                  {horizon}
                </h3>
                <div className="space-y-2">
                  {investments.filter(i => i.horizon === horizon).map(i => (
                    <div key={i.id} className="glass-card p-4 flex justify-between items-center">
                      <div>
                        <span className="category-chip active text-xs">{i.category}</span>
                        <p className="text-sm mt-1">{i.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold" style={{ color: 'var(--accent-sage)' }}>{INR}{i.value.toLocaleString('en-IN')}</span>
                        <button onClick={() => setInvestments(investments.filter(x => x.id !== i.id))}
                          style={{ color: 'var(--accent-rose)' }}><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
                  {investments.filter(i => i.horizon === horizon).length === 0 && (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nothing here yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'splitwise' && (
        <div>
          <div className="glass-card p-6 mb-6">
            <div className="section-label">Add IOU</div>
            <div className="flex flex-wrap gap-4 mt-3 items-end">
              <input value={spPerson} onChange={e => setSpPerson(e.target.value)} placeholder="Person" className="input-glass flex-1 min-w-[140px]" />
              <input type="number" value={spAmount} onChange={e => setSpAmount(e.target.value)} placeholder="Amount" className="input-glass w-32" />
              <select value={spType} onChange={e => setSpType(e.target.value as 'receivable' | 'payable')} className="input-glass" style={{ width: 'auto' }}>
                <option value="receivable">They owe me</option>
                <option value="payable">I owe them</option>
              </select>
              <input value={spNote} onChange={e => setSpNote(e.target.value)} placeholder="Note (optional)" className="input-glass flex-1 min-w-[140px]" />
              <button onClick={addSplit} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add</button>
            </div>
          </div>

          <div className="glass-card p-4 mb-6 flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Net balance</span>
            <span className="text-lg font-bold" style={{ color: splitNet >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>
              {splitNet === 0 ? 'Settled up' : splitNet > 0 ? `You are owed ${INR}${splitNet.toLocaleString('en-IN')}` : `You owe ${INR}${Math.abs(splitNet).toLocaleString('en-IN')}`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><TrendingUp size={18} style={{ color: 'var(--accent-sage)' }}/> Receivable ({INR}{totalReceivable.toLocaleString('en-IN')})</h3>
              <div className="space-y-2">
                {splits.filter(s => s.type === 'receivable').map(s => (
                  <div key={s.id} className="glass-card p-4 flex justify-between items-center">
                    <div>
                      <span>{s.person}</span>
                      {s.note && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.note}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold" style={{ color: 'var(--accent-sage)' }}>{INR}{s.amount.toLocaleString('en-IN')}</span>
                      <button onClick={() => setSplits(splits.filter(x => x.id !== s.id))}
                        style={{ color: 'var(--accent-rose)' }}><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
                {splits.filter(s => s.type === 'receivable').length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nobody owes you right now.</p>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><AlertCircle size={18} style={{ color: 'var(--accent-rose)' }}/> Payable ({INR}{totalPayable.toLocaleString('en-IN')})</h3>
              <div className="space-y-2">
                {splits.filter(s => s.type === 'payable').map(s => (
                  <div key={s.id} className="glass-card p-4 flex justify-between items-center">
                    <div>
                      <span>{s.person}</span>
                      {s.note && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.note}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold" style={{ color: 'var(--accent-rose)' }}>{INR}{s.amount.toLocaleString('en-IN')}</span>
                      <button onClick={() => setSplits(splits.filter(x => x.id !== s.id))}
                        style={{ color: 'var(--accent-rose)' }}><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
                {splits.filter(s => s.type === 'payable').length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>You don't owe anyone right now.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'liabilities' && (
        <div>
          <div className="glass-card p-6 mb-6">
            <div className="section-label">Add Loan / EMI</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              <input value={lName} onChange={e => setLName(e.target.value)} placeholder="Loan Name" className="input-glass" />
              <input type="number" value={lTotal} onChange={e => setLTotal(e.target.value)} placeholder="Total Amount" className="input-glass" />
              <input type="number" value={lRate} onChange={e => setLRate(e.target.value)} placeholder="Interest Rate %" className="input-glass" />
              <input type="number" value={lEmi} onChange={e => setLEmi(e.target.value)} placeholder="EMI Amount" className="input-glass" />
              <input type="number" value={lMonths} onChange={e => setLMonths(e.target.value)} placeholder="Remaining Months" className="input-glass" />
              <input type="number" value={lDue} onChange={e => setLDue(e.target.value)} placeholder="Due Day (1-31)" className="input-glass" />
            </div>
            <button onClick={addLiability} className="btn-primary mt-4 flex items-center gap-2"><Plus size={18}/> Add Loan</button>
          </div>
          <div className="space-y-3">
            {liabilities.map(l => (
              <div key={l.id} className="glass-card p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{l.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-2 text-sm">
                      <div><span style={{ color: 'var(--text-muted)' }}>Total:</span> {INR}{l.totalAmount.toLocaleString('en-IN')}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Rate:</span> {l.interestRate}%</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>EMI:</span> {INR}{l.emiAmount.toLocaleString('en-IN')}</div>
                      <div><span style={{ color: 'var(--text-muted)' }}>Remaining:</span> {l.remainingMonths} mo</div>
                    </div>
                  </div>
                  <button onClick={() => setLiabilities(liabilities.filter(x => x.id !== l.id))}
                    style={{ color: 'var(--accent-rose)' }} className="hover:opacity-70 p-1"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'expenses' && (
        <div>
          <div className="glass-card p-6 mb-6">
            <div className="section-label">Log Expense</div>
            <div className="mt-3">
              <ExpenseForm desc={eDesc} setDesc={setEDesc} amt={eAmt} setAmt={setEAmt} cat={eCat} setCat={setECat} onAdd={addExpense} />
            </div>
          </div>
          <div className="space-y-2">
            {expenses.slice().reverse().map(e => (
              <div key={e.id} className="glass-card p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{e.date}</span>
                  <span className="category-chip active text-xs">{e.category}</span>
                  <span>{e.desc}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ color: 'var(--accent-rose)' }}>-{INR}{e.amount.toLocaleString('en-IN')}</span>
                  <button onClick={() => setExpenses(expenses.filter(x => x.id !== e.id))}
                    style={{ color: 'var(--accent-rose)' }} className="hover:opacity-70"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
          {expenses.length === 0 && (
            <div className="glass-card text-center py-12">
              <ShoppingBag size={40} style={{ color: 'var(--accent-warm)', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>No expenses logged yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
