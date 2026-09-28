import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import JournalHistory from './pages/JournalHistory';
import WorkProjects from './pages/WorkProjects';
import DailyTimeline from './pages/DailyTimeline';
import IntegralAudit from './pages/IntegralAudit';
import Finances from './pages/Finances';
import VisionBoard from './pages/VisionBoard';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import NeuroAffirmations from './pages/NeuroAffirmations';
import SuccessAccelerator from './pages/SuccessAccelerator';
import WealthArchitect from './pages/WealthArchitect';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/history" element={<JournalHistory />} />
          <Route path="work" element={<WorkProjects />} />
          <Route path="timeline" element={<DailyTimeline />} />
          <Route path="audit" element={<IntegralAudit />} />
          <Route path="finances" element={<Finances />} />
          <Route path="vision" element={<VisionBoard />} />
          <Route path="goals" element={<Goals />} />
          <Route path="affirmations" element={<NeuroAffirmations />} />
          <Route path="accelerator" element={<SuccessAccelerator />} />
          <Route path="wealth" element={<WealthArchitect />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
