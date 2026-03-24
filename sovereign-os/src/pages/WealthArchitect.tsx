import { useState, useMemo } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { Landmark, Plus, Trash2, AlertCircle, Building2, Coins, ShoppingBag, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Liability = { id: string; name: string; totalAmount: number; interestRate: number; emiAmount: number; remainingMonths: number; dueDay: number };
type Asset = { id: string; name: string; value: number; type: 'fixed' | 'liquid' };
type Expense = { id: string; date: string; desc: string; amount: number; category: string };
type Txn = { id: string; date: string; desc: string; amount: number; type: 'income' | 'expense' };

const CATEGORIES = ['Food', 'Travel', 'Medical', 'Shopping', 'Bills', 'Education', 'Other'];
const INR = '₹';

export default function WealthArchitect() {
  const [liabilities, setLiabilities] = usePersistentStore<Liability[]>('wealth-liabilities', []);
  const [assets, setAssets] = usePersistentStore<Asset[]>('wealth-assets', []);
  const [expenses, setExpenses] = usePersistentStore<Expense[]>('wealth-expenses', []);
  const [financeTxns] = usePersistentStore<Txn[]>('finance-txns', []);
  const [tab, setTab] = useState<'overview' | 'liabilities' | 'assets' | 'expenses'>('overview');

  // Form states
  const [lName, setLName] = useState(''); const [lTotal, setLTotal] = useState('');
  const [lRate, setLRate] = useState(''); const [lEmi, setLEmi] = useState('');
  const [lMonths, setLMonths] = useState(''); const [lDue, setLDue] = useState('1');
  const [aName, setAName] = useState(''); const [aVal, setAVal] = useState('');
  const [aType, setAType] = useState<'fixed' | 'liquid'>('fixed');
  const [eDesc, setEDesc] = useState(''); const [eAmt, setEAmt] = useState('');
  const [eCat, setECat] = useState('Other');

  const today = new Date().toISOString().split('T')[0];
  const totalAssets = assets.reduce((a, x) => a + x.value, 0);
  const totalLiabilities = liabilities.reduce((a, x) => a + (x.emiAmount * x.remainingMonths), 0);
  const monthlyEmi = liabilities.reduce((a, x) => a + x.emiAmount, 0);
  const todayExpenses = expenses.filter(e => e.date === today).reduce((a, e) => a + e.amount, 0);

  // Auto-populate from Finances
  const financeIncome = financeTxns.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const financeExpense = financeTxns.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
  const financeNet = financeIncome - financeExpense;

  const netWorth = totalAssets - totalLiabilities + financeNet;

  const fixedAssets = assets.filter(a => a.type === 'fixed').reduce((s, a) => s + a.value, 0);
  const liquidAssets = assets.filter(a => a.type === 'liquid').reduce((s, a) => s + a.value, 0);

  const chartData = useMemo(() => [
    { name: 'Fixed Assets', value: fixedAssets, color: '#7c8aff' },
    { name: 'Liquid Assets', value: liquidAssets, color: '#6bcb8b' },
    { name: 'Finance Income', value: financeIncome, color: '#a7b4ff' },
    { name: 'Finance Expense', value: financeExpense, color: '#f4a261' },
    { name: 'Liabilities', value: totalLiabilities, color: '#f07088' },
    { name: 'Monthly EMI', value: monthlyEmi, color: '#e8956d' },
  ], [fixedAssets, liquidAssets, financeIncome, financeExpense, totalLiabilities, monthlyEmi]);

  const upcomingBills = useMemo(() => {
    const currentDay = new Date().getDate();
    return liabilities
      .map(l => ({ ...l, daysUntil: l.dueDay >= currentDay ? l.dueDay - currentDay : 30 - currentDay + l.dueDay }))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [liabilities]);

  const addLiability = () => {
    if (!lName || !lTotal) return;
    setLiabilities([...liabilities, { id: Date.now().toString(), name: lName, totalAmount: Number(lTotal), interestRate: Number(lRate) || 0, emiAmount: Number(lEmi) || 0, remainingMonths: Number(lMonths) || 0, dueDay: Number(lDue) || 1 }]);
    setLName(''); setLTotal(''); setLRate(''); setLEmi(''); setLMonths(''); setLDue('1');
  };

  const addAsset = () => {
    if (!aName || !aVal) return;
    setAssets([...assets, { id: Date.now().toString(), name: aName, value: Number(aVal), type: aType }]);
    setAName(''); setAVal('');
  };

  const addExpense = () => {
    if (!eDesc || !eAmt) return;
    setExpenses([...expenses, { id: Date.now().toString(), date: today, desc: eDesc, amount: Number(eAmt), category: eCat }]);
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Assets</span>
            <p className="text-lg font-semibold" style={{ color: 'var(--accent-sage)' }}>{INR}{totalAssets.toLocaleString('en-IN')}</p></div>
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Liabilities</span>
            <p className="text-lg font-semibold" style={{ color: 'var(--accent-rose)' }}>{INR}{totalLiabilities.toLocaleString('en-IN')}</p></div>
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly EMI</span>
            <p className="text-lg font-semibold" style={{ color: 'var(--accent-warm)' }}>{INR}{monthlyEmi.toLocaleString('en-IN')}</p></div>
          <div><span className="text-xs" style={{ color: 'var(--text-muted)' }}>Finance Net</span>
            <p className="text-lg font-semibold" style={{ color: financeNet >= 0 ? 'var(--accent-sage)' : 'var(--accent-rose)' }}>{INR}{financeNet.toLocaleString('en-IN')}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['overview', 'liabilities', 'assets', 'expenses'] as const).map(t => (
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
            <div className="flex flex-wrap gap-3 mb-4">
              <input value={eDesc} onChange={e => setEDesc(e.target.value)} placeholder="Description" className="input-glass flex-1 min-w-[180px]" />
              <input type="number" value={eAmt} onChange={e => setEAmt(e.target.value)} placeholder="Amount" className="input-glass w-28" />
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setECat(c)} className={`category-chip ${eCat === c ? 'active' : ''}`}>{c}</button>
                ))}
              </div>
              <button onClick={addExpense} className="btn-primary flex items-center gap-1"><Plus size={16}/> Add</button>
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

      {tab === 'assets' && (
        <div>
          <div className="glass-card p-6 mb-6">
            <div className="section-label">Add Asset</div>
            <div className="flex flex-wrap gap-4 mt-3">
              <input value={aName} onChange={e => setAName(e.target.value)} placeholder="Asset Name" className="input-glass flex-1 min-w-[180px]" />
              <input type="number" value={aVal} onChange={e => setAVal(e.target.value)} placeholder="Current Value" className="input-glass w-40" />
              <select value={aType} onChange={e => setAType(e.target.value as 'fixed' | 'liquid')} className="input-glass" style={{ width: 'auto' }}>
                <option value="fixed">Fixed Asset</option>
                <option value="liquid">Liquid Asset</option>
              </select>
              <button onClick={addAsset} className="btn-primary flex items-center gap-2"><Plus size={18}/> Add</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Building2 size={18} style={{ color: 'var(--accent-primary)' }}/> Fixed Assets</h3>
              <div className="space-y-2">
                {assets.filter(a => a.type === 'fixed').map(a => (
                  <div key={a.id} className="glass-card p-4 flex justify-between items-center">
                    <span>{a.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold" style={{ color: 'var(--accent-sage)' }}>{INR}{a.value.toLocaleString('en-IN')}</span>
                      <button onClick={() => setAssets(assets.filter(x => x.id !== a.id))}
                        style={{ color: 'var(--accent-rose)' }}><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
                {assets.filter(a => a.type === 'fixed').length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No fixed assets yet.</p>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Coins size={18} style={{ color: 'var(--accent-sage)' }}/> Liquid Assets</h3>
              <div className="space-y-2">
                {assets.filter(a => a.type === 'liquid').map(a => (
                  <div key={a.id} className="glass-card p-4 flex justify-between items-center">
                    <span>{a.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold" style={{ color: 'var(--accent-sage)' }}>{INR}{a.value.toLocaleString('en-IN')}</span>
                      <button onClick={() => setAssets(assets.filter(x => x.id !== a.id))}
                        style={{ color: 'var(--accent-rose)' }}><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
                {assets.filter(a => a.type === 'liquid').length === 0 && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No liquid assets yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'expenses' && (
        <div>
          <div className="glass-card p-6 mb-6">
            <div className="section-label">Log Expense</div>
            <div className="flex flex-wrap gap-3 items-end mt-3">
              <input value={eDesc} onChange={e => setEDesc(e.target.value)} placeholder="Description" className="input-glass flex-1 min-w-[180px]" />
              <input type="number" value={eAmt} onChange={e => setEAmt(e.target.value)} placeholder="Amount" className="input-glass w-28" />
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setECat(c)} className={`category-chip ${eCat === c ? 'active' : ''}`}>{c}</button>
                ))}
              </div>
              <button onClick={addExpense} className="btn-primary flex items-center gap-1"><Plus size={16}/> Add</button>
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
