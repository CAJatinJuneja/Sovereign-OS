export type ActivityTag = 'Office' | 'Self Development' | 'Chores' | 'Study Targets' | 'Rest' | 'Social' | 'Other';

export const ACTIVITY_TAGS: ActivityTag[] = [
  'Office', 'Self Development', 'Chores', 'Study Targets', 'Rest', 'Social', 'Other',
];

export const ACTIVITY_TAG_COLORS: Record<ActivityTag, string> = {
  'Office': 'var(--accent-primary)',
  'Self Development': 'var(--accent-lavender)',
  'Chores': 'var(--accent-warm)',
  'Study Targets': 'var(--accent-sage)',
  'Rest': 'var(--accent-rose)',
  'Social': 'var(--accent-warm)',
  'Other': 'var(--text-muted)',
};

export interface HourEntry {
  hour: number;
  plannedNote: string;
  plannedTag: ActivityTag;
  actualNote: string;
  actualTag: ActivityTag;
  mood: number; // 0 = not set, otherwise matches MOOD_OPTIONS 1-5
}

export function defaultHours(): HourEntry[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour, plannedNote: '', plannedTag: 'Other' as ActivityTag,
    actualNote: '', actualTag: 'Other' as ActivityTag, mood: 0,
  }));
}

export function formatHour(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${period}`;
}

export function getTimelineForDate(date: string): HourEntry[] | null {
  try {
    const raw = localStorage.getItem('timeline-' + date);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}
