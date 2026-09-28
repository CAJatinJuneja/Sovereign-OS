import { useState, useRef, useEffect } from 'react';
import { usePersistentStore } from '../hooks/usePersistentStore';
import { JOURNAL_PROMPTS, PROMPT_CATEGORIES, EMOTIONS, MOOD_OPTIONS, JOURNAL_TAGS, type PromptCategory } from '../lib/journalPrompts';
import { getJournalEntriesForDate, type StoredJournalEntry } from '../lib/journalStore';
import { getTimelineForDate, formatHour } from '../lib/timelineStore';
import { todayKey } from '../lib/date';
import { Link } from 'react-router-dom';
import { Shuffle, ChevronDown, ChevronUp, Sparkles, Clock, Save, Heart, Target, Tag, BookOpen, CalendarSearch } from 'lucide-react';

interface ThoughtRecord {
  situation: string;
  automaticThoughts: string;
  emotionIntensity: number;
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
}

interface JournalEntry {
  date: string;
  mood: number;
  emotions: string[];
  energy: number;
  selectedPrompt: string;
  content: string;
  thoughtRecord: ThoughtRecord;
  gratitude: string[];
  todaysWin: string;
  goalReflection: string;
  tags: string[];
  wordCount: number;
  savedAt: string;
}

const emptyThoughtRecord: ThoughtRecord = {
  situation: '', automaticThoughts: '', emotionIntensity: 5,
  evidenceFor: '', evidenceAgainst: '', balancedThought: '',
};

function RecallADay() {
  const [recallDate, setRecallDate] = useState('');
  const entries: StoredJournalEntry[] = recallDate ? getJournalEntriesForDate(recallDate) : [];
  const timeline = recallDate ? getTimelineForDate(recallDate) : null;
  const timelineHighlights = timeline?.filter(h => h.plannedNote.trim() || h.actualNote.trim()) || [];

  const getMoodEmoji = (mood: number) => MOOD_OPTIONS.find(m => m.value === mood)?.emoji || '';

  return (
    <section className="glass-card">
      <div className="section-label flex items-center gap-2">
        <CalendarSearch size={12} /> Recall a Day
      </div>
      <input
        type="date"
        value={recallDate}
        onChange={e => setRecallDate(e.target.value)}
        className="input-glass mt-2"
        max={todayKey()}
      />

      {recallDate && entries.length === 0 && timelineHighlights.length === 0 && (
        <p className="text-sm mt-4" style={{ color: 'var(--text-muted)' }}>No entries found for this date.</p>
      )}

      {entries.map((entry, i) => (
        <div key={i} className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            {entry.mood > 0 && <span className="text-xl">{getMoodEmoji(entry.mood)}</span>}
            {entry.wordCount > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{entry.wordCount} words</span>
            )}
          </div>
          {entry.emotions?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {entry.emotions.map(em => <span key={em} className="emotion-chip active text-xs">{em}</span>)}
            </div>
          )}
          {entry.content && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: 'Lora, serif', color: 'var(--text-primary)' }}>
              {entry.content}
            </p>
          )}
          {entry.gratitude?.some(g => g) && (
            <div className="mt-3">
              <span className="section-label" style={{ color: 'var(--accent-warm)' }}>Gratitude</span>
              <ul className="list-disc list-inside text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {entry.gratitude.filter(g => g).map((g, gi) => <li key={gi}>{g}</li>)}
              </ul>
            </div>
          )}
          {entry.todaysWin && (
            <div className="mt-3 text-sm">
              <span className="section-label" style={{ color: 'var(--accent-warm)' }}>Win</span>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{entry.todaysWin}</p>
            </div>
          )}
        </div>
      ))}

      {timelineHighlights.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <span className="section-label">Timeline</span>
          <ul className="text-sm mt-1 space-y-1.5" style={{ color: 'var(--text-secondary)' }}>
            {timelineHighlights.map(h => (
              <li key={h.hour}>
                <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{formatHour(h.hour)}</span>
                {h.mood > 0 && <span className="ml-1">{getMoodEmoji(h.mood)}</span>}
                {h.plannedNote && <span> — <span className="text-xs">Planned ({h.plannedTag}):</span> {h.plannedNote}</span>}
                {h.actualNote && <span> — <span className="text-xs">Actual ({h.actualTag}):</span> {h.actualNote}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function Journal() {
  const today = todayKey();

  const emptyEntry: JournalEntry = {
    date: today, mood: 0, emotions: [], energy: 5, selectedPrompt: '',
    content: '', thoughtRecord: { ...emptyThoughtRecord },
    gratitude: ['', '', ''], todaysWin: '', goalReflection: '',
    tags: [], wordCount: 0, savedAt: '',
  };

  const [entry, setEntry] = usePersistentStore<JournalEntry>(`journal-draft`, emptyEntry);

  const [activeCategory, setActiveCategory] = useState<PromptCategory | 'All'>('All');
  const [showThoughtRecord, setShowThoughtRecord] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const [saved, setSaved] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const update = (key: string, value: any) => {
    setEntry(prev => ({ ...prev, [key]: value }));
  };

  const filteredPrompts = activeCategory === 'All'
    ? JOURNAL_PROMPTS
    : JOURNAL_PROMPTS.filter(p => p.category === activeCategory);

  const shufflePrompt = () => {
    const p = filteredPrompts[Math.floor(Math.random() * filteredPrompts.length)];
    if (p) update('selectedPrompt', p.text);
  };

  const handleContentChange = (val: string) => {
    setEntry(prev => ({
      ...prev,
      content: val,
      wordCount: val.trim() ? val.trim().split(/\s+/).length : 0,
    }));
  };

  // Auto-expand textarea
  useEffect(() => {
    const el = editorRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
  }, [entry.content]);

  const toggleEmotion = (em: string) => {
    const arr = entry.emotions.includes(em)
      ? entry.emotions.filter((e: string) => e !== em)
      : [...entry.emotions, em];
    update('emotions', arr);
  };

  const toggleTag = (tag: string) => {
    const arr = entry.tags.includes(tag)
      ? entry.tags.filter((t: string) => t !== tag)
      : [...entry.tags, tag];
    update('tags', arr);
  };

  const saveEntry = () => {
    // Save the completed entry to journal history with a unique key
    const savedEntry = {
      ...entry,
      date: today,
      savedAt: new Date().toISOString(),
    };
    const historyKey = `journal-${today}-${Date.now()}`;
    localStorage.setItem(historyKey, JSON.stringify(savedEntry));

    // Reset the draft to blank for new entry
    setEntry({
      date: today, mood: 0, emotions: [], energy: 5, selectedPrompt: '',
      content: '', thoughtRecord: { ...emptyThoughtRecord },
      gratitude: ['', '', ''], todaysWin: '', goalReflection: '',
      tags: [], wordCount: 0, savedAt: '',
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="animate-fadeIn max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Journal</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/journal/history" className="btn-ghost flex items-center gap-2">
            <Clock size={16} /> History
          </Link>
          <button onClick={saveEntry} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── FREE-FORM EDITOR ── */}
      <section className="journal-card">
        <div className="section-label flex items-center gap-2">
          <span style={{ fontFamily: 'Lora, serif', fontSize: '0.75rem', fontWeight: 400 }}>&#9998;</span> Write Freely
        </div>
        <textarea
          ref={editorRef}
          value={entry.content}
          onChange={e => handleContentChange(e.target.value)}
          placeholder="Write freely... this is your safe space. Let your thoughts flow without judgment."
          className="journal-editor mt-2"
          rows={8}
        />
        <div className="flex justify-between items-center mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{entry.wordCount} words</span>
          {entry.savedAt && <span>Last saved {new Date(entry.savedAt).toLocaleTimeString()}</span>}
        </div>
      </section>

      {/* ── MOOD CHECK-IN ── */}
      <section className="journal-card animate-breathe">
        <div className="section-label flex items-center gap-2">
          <Sparkles size={12} /> How are you feeling?
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          {MOOD_OPTIONS.map(m => (
            <button
              key={m.value}
              onClick={() => update('mood', m.value)}
              className={`mood-btn ${entry.mood === m.value ? 'active' : ''}`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
        {entry.mood > 0 && (
          <p className="text-center text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
            {MOOD_OPTIONS.find(m => m.value === entry.mood)?.label}
          </p>
        )}

        {/* Emotions */}
        <div className="mt-6">
          <div className="section-label">What emotions are present?</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {EMOTIONS.map(em => (
              <button
                key={em}
                onClick={() => toggleEmotion(em)}
                className={`emotion-chip ${entry.emotions.includes(em) ? 'active' : ''}`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Energy */}
        <div className="mt-6">
          <div className="section-label">Energy Level: {entry.energy}/10</div>
          <input
            type="range" min="1" max="10"
            value={entry.energy}
            onChange={e => update('energy', Number(e.target.value))}
            className="w-full mt-1"
          />
        </div>
      </section>

      {/* ── GUIDED PROMPTS ── */}
      <section className="journal-card">
        <button
          onClick={() => setShowPrompts(!showPrompts)}
          className="w-full flex items-center justify-between"
        >
          <div className="section-label flex items-center gap-2 mb-0">
            <BookOpen size={12} /> Guided Prompts
          </div>
          {showPrompts ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
        </button>

        {showPrompts && (
          <div className="mt-4 space-y-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('All')}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${activeCategory === 'All' ? 'bg-[var(--accent-primary-dim)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >All</button>
              {PROMPT_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${activeCategory === cat ? 'bg-[var(--accent-primary-dim)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                >{cat}</button>
              ))}
            </div>

            {/* Prompt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPrompts.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  onClick={() => update('selectedPrompt', p.text)}
                  className={`prompt-card text-left text-sm ${entry.selectedPrompt === p.text ? 'border-[rgba(184,169,232,0.3)] bg-[rgba(184,169,232,0.12)]' : ''}`}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{p.text}</span>
                  <span className="block text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{p.category}</span>
                </button>
              ))}
            </div>

            <button onClick={shufflePrompt} className="btn-ghost flex items-center gap-2 text-sm">
              <Shuffle size={14} /> Show different prompts
            </button>
          </div>
        )}
      </section>

      {/* ── SELECTED PROMPT ── */}
      {entry.selectedPrompt && (
        <div className="px-4 py-3 rounded-xl" style={{ background: 'var(--accent-lavender-dim)', borderLeft: '3px solid var(--accent-lavender)' }}>
          <p className="text-sm italic" style={{ color: 'var(--accent-lavender)' }}>
            Reflecting on: "{entry.selectedPrompt}"
          </p>
        </div>
      )}

      {/* ── CBT THOUGHT RECORD ── */}
      <section className="thought-record">
        <button
          onClick={() => setShowThoughtRecord(!showThoughtRecord)}
          className="w-full flex items-center justify-between"
        >
          <div className="section-label flex items-center gap-2 mb-0">
            &#x1f9e0; CBT Thought Record
          </div>
          {showThoughtRecord ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
        </button>

        {showThoughtRecord && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Situation — What happened?</label>
              <textarea
                value={entry.thoughtRecord.situation}
                onChange={e => update('thoughtRecord', { ...entry.thoughtRecord, situation: e.target.value })}
                className="input-glass w-full mt-1" rows={2}
                placeholder="Describe the event or situation..."
              />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Automatic Thoughts — What went through your mind?</label>
              <textarea
                value={entry.thoughtRecord.automaticThoughts}
                onChange={e => update('thoughtRecord', { ...entry.thoughtRecord, automaticThoughts: e.target.value })}
                className="input-glass w-full mt-1" rows={2}
                placeholder="What thoughts popped up automatically?"
              />
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Emotion Intensity: {entry.thoughtRecord.emotionIntensity}/10
              </label>
              <input type="range" min="1" max="10"
                value={entry.thoughtRecord.emotionIntensity}
                onChange={e => update('thoughtRecord', { ...entry.thoughtRecord, emotionIntensity: Number(e.target.value) })}
                className="w-full mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--accent-sage)' }}>Evidence For this thought</label>
                <textarea
                  value={entry.thoughtRecord.evidenceFor}
                  onChange={e => update('thoughtRecord', { ...entry.thoughtRecord, evidenceFor: e.target.value })}
                  className="input-glass w-full mt-1" rows={3}
                  placeholder="What supports this thought?"
                />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--accent-rose)' }}>Evidence Against this thought</label>
                <textarea
                  value={entry.thoughtRecord.evidenceAgainst}
                  onChange={e => update('thoughtRecord', { ...entry.thoughtRecord, evidenceAgainst: e.target.value })}
                  className="input-glass w-full mt-1" rows={3}
                  placeholder="What contradicts this thought?"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>Balanced Thought — A more realistic perspective</label>
              <textarea
                value={entry.thoughtRecord.balancedThought}
                onChange={e => update('thoughtRecord', { ...entry.thoughtRecord, balancedThought: e.target.value })}
                className="input-glass w-full mt-1" rows={2}
                placeholder="How can you reframe this more realistically?"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── GRATITUDE & WINS ── */}
      <section className="journal-card" style={{ borderColor: 'rgba(244,162,97,0.12)' }}>
        <div className="section-label flex items-center gap-2">
          <Heart size={12} /> Gratitude & Wins
        </div>
        <div className="space-y-3 mt-3">
          {[0, 1, 2].map(i => (
            <input
              key={i}
              value={entry.gratitude[i]}
              onChange={e => {
                const g = [...entry.gratitude];
                g[i] = e.target.value;
                update('gratitude', g);
              }}
              placeholder={`${i + 1}. I'm grateful for...`}
              className="input-glass w-full"
            />
          ))}
          <div className="mt-4">
            <div className="section-label gradient-text-warm" style={{ WebkitTextFillColor: 'unset', background: 'none', color: 'var(--accent-warm)' }}>Today's Win</div>
            <input
              value={entry.todaysWin}
              onChange={e => update('todaysWin', e.target.value)}
              placeholder="Even a small win counts..."
              className="input-glass w-full"
            />
          </div>
        </div>
      </section>

      {/* ── GOAL CONNECTION ── */}
      <section className="glass-card">
        <div className="section-label flex items-center gap-2">
          <Target size={12} /> Goal Alignment
        </div>
        <textarea
          value={entry.goalReflection}
          onChange={e => update('goalReflection', e.target.value)}
          placeholder="How did today's actions align with your goals? What could you do better tomorrow?"
          className="input-glass w-full mt-2"
          rows={3}
        />
        <Link to="/goals" className="text-xs mt-2 inline-block" style={{ color: 'var(--accent-primary)' }}>
          View your goals →
        </Link>
      </section>

      {/* ── TAGS ── */}
      <section className="glass-card">
        <div className="section-label flex items-center gap-2">
          <Tag size={12} /> Tags
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {JOURNAL_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`emotion-chip text-xs ${entry.tags.includes(tag) ? 'active' : ''}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Save button bottom */}
      <div className="flex justify-end">
        <button onClick={saveEntry} className="btn-primary flex items-center gap-2">
          <Save size={16} /> {saved ? 'Saved!' : 'Save Entry'}
        </button>
      </div>

      {/* ── RECALL A DAY ── */}
      <div className="pb-8">
        <RecallADay />
      </div>
    </div>
  );
}
