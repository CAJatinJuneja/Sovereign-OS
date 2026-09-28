import { NavLink, Outlet } from 'react-router-dom';
import { Home, PenLine, Briefcase, BookOpen, DollarSign, Image, Target, Settings, Clock, Sparkles, Rocket, Landmark } from 'lucide-react';

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
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 fixed h-full flex flex-col justify-between"
        style={{
          background: 'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}>
        <div>
          <div className="px-6 pt-7 pb-2">
            <h1 className="text-xl font-bold gradient-text">Sovereign OS</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{getGreeting()}</p>
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
        <div className="px-6 pb-6 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Clock size={13} />
          <span>{formatDate()}</span>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
