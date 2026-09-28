import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, PenLine, Briefcase, BookOpen, DollarSign, Image, Target, Settings, Clock, Sparkles, Rocket, Landmark, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/journal', icon: PenLine, label: 'Journal' },
  { to: '/work', icon: Briefcase, label: 'Work & Projects' },
  { to: '/timeline', icon: Clock, label: 'Daily Timeline' },
  { to: '/audit', icon: BookOpen, label: 'Integral Audit' },
  { to: '/finances', icon: DollarSign, label: 'Finances' },
  { to: '/vision', icon: Image, label: 'Vision Board' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/affirmations', icon: Sparkles, label: 'Affirmations' },
  { to: '/accelerator', icon: Rocket, label: 'Accelerator' },
  { to: '/wealth', icon: Landmark, label: 'Wealth Architect' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function navClass(isActive: boolean) {
  const base = 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200';
  if (isActive) return base + ' bg-[rgba(124,138,255,0.12)] text-[var(--accent-primary)] font-medium shadow-sm';
  return base + ' text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-primary)]';
}

export default function Layout() {
  const { session, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen flex">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(10, 14, 26, 0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
        <h1 className="text-lg font-bold gradient-text">Sovereign OS</h1>
        <button onClick={() => setMobileOpen(true)} style={{ color: 'var(--text-secondary)' }}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`w-64 fixed h-full flex flex-col justify-between z-50 transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}>
        <div>
          <div className="px-6 pt-7 pb-2 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold gradient-text">Sovereign OS</h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{getGreeting()}</p>
            </div>
            <button className="md:hidden p-1" onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          </div>
          <nav className="flex flex-col gap-0.5 px-3 mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => navClass(isActive)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="px-6 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Clock size={13} />
            <span>{formatDate()}</span>
          </div>
          {session?.user?.email && (
            <div className="flex items-center justify-between gap-2 text-xs pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
              <span className="truncate">{session.user.email}</span>
              <button onClick={signOut} className="p-1 rounded hover:opacity-70 shrink-0" title="Sign out">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
      <main className="flex-1 min-h-screen md:ml-64 px-4 pb-8 pt-20 md:px-8 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
