import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkProjects from './pages/WorkProjects';
import IntegralAudit from './pages/IntegralAudit';
import Finances from './pages/Finances';
import VisionBoard from './pages/VisionBoard';
import Goals from './pages/Goals';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="work" element={<WorkProjects />} />
            <Route path="audit" element={<IntegralAudit />} />
            <Route path="finances" element={<Finances />} />
            <Route path="vision" element={<VisionBoard />} />
            <Route path="goals" element={<Goals />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}