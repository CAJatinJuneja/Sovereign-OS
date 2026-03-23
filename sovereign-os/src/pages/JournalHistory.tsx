import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, Search } from 'lucide-react';
import { MOOD_OPTIONS } from '../lib/journalPrompts';

interface StoredEntry {
  date: string;
  mood: number;
  emotions: string[];
  content: string;
  tags: string[];
  wordCount: number;
  todaysWin: string;
  gratitude: string[];
}

export default function JournalHistory() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const entries = useMemo(() => {
    const results: StoredEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('journal-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          if (data && data.date && (data.content || data.mood)) {
            results.push(data);
          }
        } catch { /* skip */ }
      }
    }
    return results.sort((a, b) => b.date.localeCompare(a.date));
  }, []);

  const filtered = entries.filter(e => {
    if (filterTag && !e.tags?.includes(filterTag)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (e.content?.toLowerCase().includes(q)
        || e.emotions?.some(em => em.toLowerCase().includes(q))
        || e.todaysWin?.toLowerCase().includes(q));
    }
    return true;
  });

  const allTags = [...new Set(entries.flatMap(e => e.tags || []))];

  const getMoodEmoji = (mood: number) => MOOD_OPTIONS.find(m => m.value === mood)?.emoji || '';

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/journal" className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.05)] transition-colors">
          <ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Journal History</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{entries.length} entries</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="input-glass w-full pl-9"
          />
        </div>
        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            className="input-glass w-auto"
            style={{ width: 'auto', minWidth: '120px' }}
          >
            <option value="">All Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="glass-card text-center py-12">
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            {entries.length === 0 ? 'No journal entries yet. Start writing today!' : 'No entries match your search.'}
          </p>
          {entries.length === 0 && (
            <Link to="/journal" className="btn-primary inline-flex items-center gap-2 mt-4">
              Start Journaling
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(entry => {
            const isExpanded = expandedId === entry.date;
            const dateObj = new Date(entry.date + 'T00:00:00');
            const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const preview = entry.content?.slice(0, 120) || '';

            return (
              <div key={entry.date} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center pt-2">
                  <div className="timeline-dot" />
                  <div className="w-px flex-1 bg-[rgba(255,255,255,0.06)] mt-2" />
                </div>

                {/* Card */}
                <div className="glass-card flex-1 mb-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.date)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getMoodEmoji(entry.mood)}</span>
                        <span className="font-medium text-sm">{dateLabel}</span>
                        {entry.wordCount > 0 && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.wordCount} words</span>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                    </div>

                    {/* Tags */}
                    {entry.tags?.length > 0 && (
                      <div className="flex gap-1.5 mt-2">
                        {entry.tags.map(t => <span key={t} className="tag">{t}</span>)}
                      </div>
                    )}

                    {/* Preview */}
                    {!isExpanded && preview && (
                      <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Lora, serif' }}>
                        {preview}{entry.content.length > 120 ? '...' : ''}
                      </p>
                    )}
                  </button>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      {/* Emotions */}
                      {entry.emotions?.length > 0 && (
                        <div className="mb-3">
                          <span className="section-label">Emotions</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {entry.emotions.map(em => <span key={em} className="emotion-chip active text-xs">{em}</span>)}
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      {entry.content && (
                        <div className="mb-4">
                          <span className="section-label">Journal Entry</span>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: 'Lora, serif', color: 'var(--text-primary)' }}>
                            {entry.content}
                          </p>
                        </div>
                      )}

                      {/* Gratitude */}
                      {entry.gratitude?.some(g => g) && (
                        <div className="mb-3">
                          <span className="section-label" style={{ color: 'var(--accent-warm)' }}>Gratitude</span>
                          <ul className="list-disc list-inside text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {entry.gratitude.filter(g => g).map((g, i) => <li key={i}>{g}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Win */}
                      {entry.todaysWin && (
                        <div className="text-sm">
                          <span className="section-label gradient-text-warm" style={{ WebkitTextFillColor: 'unset', background: 'none', color: 'var(--accent-warm)' }}>Win</span>
                          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{entry.todaysWin}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
