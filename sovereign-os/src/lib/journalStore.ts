export interface StoredJournalEntry {
  date: string;
  mood: number;
  emotions: string[];
  content: string;
  tags: string[];
  wordCount: number;
  todaysWin: string;
  gratitude: string[];
  goalReflection?: string;
  savedAt?: string;
}

export function getAllJournalEntries(): StoredJournalEntry[] {
  const results: StoredJournalEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('journal-') && key !== 'journal-draft') {
      try {
        const data = JSON.parse(localStorage.getItem(key)!);
        if (data && data.date && data.savedAt && (data.content || data.mood)) {
          results.push(data);
        }
      } catch { /* skip */ }
    }
  }
  return results.sort((a, b) => (b.savedAt || b.date).localeCompare(a.savedAt || a.date));
}

export function getJournalEntriesForDate(date: string): StoredJournalEntry[] {
  return getAllJournalEntries().filter(e => e.date === date);
}

export function getLatestJournalEntryForDate(date: string): StoredJournalEntry | null {
  return getJournalEntriesForDate(date)[0] || null;
}

export function hasJournalEntry(date: string): boolean {
  return getJournalEntriesForDate(date).length > 0;
}
