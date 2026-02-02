import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Briefcase, BookOpen, DollarSign, Image, Target, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/work', icon: Briefcase, label: 'Work & Projects' },
  { to: '/audit', icon: BookOpen, label: 'Integral Audit' },
  { to: '/finances', icon: DollarSign, label: 'Finances' },
  { to: '/vision', icon: Image, label: 'Vision Board' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 fixed h-full bg-black/20 backdrop-blur-xl border-r border-white/10 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold gradient-text">Sovereign OS</h1>
          <p className="text-sm text-gray-400 mt-1">Life Tracker Dashboard</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-property-[background,color,box-shadow] transition-duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/10'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}