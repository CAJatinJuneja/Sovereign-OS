import { createContext, useContext, type ReactNode } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';

interface DailyEntry {
  date: string;
  completedTasks: boolean;
  mood: number;
}

interface AppState {
  dailyEntries: DailyEntry[];
  setDailyEntries: (entries: DailyEntry[]) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dailyEntries, setDailyEntries] = usePersistentStore<DailyEntry[]>('sovereign-daily', []);

  return (
    <AppContext.Provider value={{ dailyEntries, setDailyEntries }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}