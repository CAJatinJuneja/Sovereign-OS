export type PromptCategory =
  | 'Self-Reflection'
  | 'Gratitude'
  | 'CBT / Thought Work'
  | 'Goal Alignment'
  | 'Shadow Work'
  | 'Future Self';

export interface JournalPrompt {
  id: number;
  text: string;
  category: PromptCategory;
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  'Self-Reflection',
  'Gratitude',
  'CBT / Thought Work',
  'Goal Alignment',
  'Shadow Work',
  'Future Self',
];

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Self-Reflection
  { id: 1, text: "What\'s taking up the most mental space right now?", category: 'Self-Reflection' },
  { id: 2, text: "What is one thing you did well today?", category: 'Self-Reflection' },
  { id: 3, text: "If you spoke to yourself like a close friend, what would you say?", category: 'Self-Reflection' },
  { id: 4, text: "What feels within your control right now? What doesn\'t?", category: 'Self-Reflection' },
  { id: 5, text: "What emotion am I feeling right now, and where do I feel it in my body?", category: 'Self-Reflection' },
  { id: 6, text: "What pattern have I noticed repeating in my life recently?", category: 'Self-Reflection' },
  { id: 7, text: "What am I avoiding, and why?", category: 'Self-Reflection' },
  { id: 8, text: "What would I do differently if nobody was watching?", category: 'Self-Reflection' },
  { id: 9, text: "How have I grown or changed in the past 6 months?", category: 'Self-Reflection' },
  { id: 10, text: "What do I need to hear right now?", category: 'Self-Reflection' },
  { id: 11, text: "What boundary do I need to set or reinforce?", category: 'Self-Reflection' },
  { id: 12, text: "What story am I telling myself that might not be true?", category: 'Self-Reflection' },

  // Gratitude
  { id: 13, text: "Name three small things that brought you comfort today.", category: 'Gratitude' },
  { id: 14, text: "Who is someone you\'re grateful for, and why?", category: 'Gratitude' },
  { id: 15, text: "What challenge are you grateful for because of what it taught you?", category: 'Gratitude' },
  { id: 16, text: "What is a simple pleasure that you often take for granted?", category: 'Gratitude' },
  { id: 17, text: "What skill or ability are you thankful to have?", category: 'Gratitude' },
  { id: 18, text: "What moment today made you smile, even briefly?", category: 'Gratitude' },
  { id: 19, text: "What part of your daily routine do you appreciate most?", category: 'Gratitude' },
  { id: 20, text: "What is something beautiful you noticed today?", category: 'Gratitude' },

  // CBT / Thought Work
  { id: 21, text: "Describe a situation that triggered a strong emotion. What thoughts came up automatically?", category: 'CBT / Thought Work' },
  { id: 22, text: "What evidence supports the negative thought you\'re having? What evidence contradicts it?", category: 'CBT / Thought Work' },
  { id: 23, text: "Are you using emotional reasoning rather than logical reasoning right now?", category: 'CBT / Thought Work' },
  { id: 24, text: "What cognitive distortion might be at play? (catastrophizing, mind-reading, all-or-nothing)", category: 'CBT / Thought Work' },
  { id: 25, text: "If a friend described this situation to you, what advice would you give them?", category: 'CBT / Thought Work' },
  { id: 26, text: "What is a more balanced way to think about this situation?", category: 'CBT / Thought Work' },
  { id: 27, text: "Rate the intensity of your emotion (1-10). What would bring it down by just 1 point?", category: 'CBT / Thought Work' },
  { id: 28, text: "What behavior resulted from a recent strong emotion? How did you feel about it afterward?", category: 'CBT / Thought Work' },
  { id: 29, text: "What would you say to challenge the thought: \'I\'m not good enough\'?", category: 'CBT / Thought Work' },
  { id: 30, text: "Describe a time you predicted something negative that didn\'t actually happen.", category: 'CBT / Thought Work' },

  // Goal Alignment
  { id: 31, text: "How did today\'s actions align with your biggest goal?", category: 'Goal Alignment' },
  { id: 32, text: "What is one small step you can take tomorrow toward your vision?", category: 'Goal Alignment' },
  { id: 33, text: "What\'s the gap between where you are and where you want to be? What\'s the next bridge?", category: 'Goal Alignment' },
  { id: 34, text: "What distraction pulled you away from your priorities today?", category: 'Goal Alignment' },
  { id: 35, text: "If you could only accomplish one thing this week, what should it be?", category: 'Goal Alignment' },
  { id: 36, text: "What habit is currently serving your goals? What habit is working against them?", category: 'Goal Alignment' },
  { id: 37, text: "What does success look like for you in 90 days?", category: 'Goal Alignment' },
  { id: 38, text: "What are you willing to sacrifice to reach your goal?", category: 'Goal Alignment' },

  // Shadow Work
  { id: 39, text: "What triggered you today? What deeper wound might it be connected to?", category: 'Shadow Work' },
  { id: 40, text: "What trait in others annoys you most? Could it be something you suppress in yourself?", category: 'Shadow Work' },
  { id: 41, text: "What are you most afraid of others discovering about you?", category: 'Shadow Work' },
  { id: 42, text: "What belief about yourself was formed in childhood that you still carry?", category: 'Shadow Work' },
  { id: 43, text: "What do you do when you feel rejected? Is that response serving you?", category: 'Shadow Work' },
  { id: 44, text: "Write about a time you felt shame. What would you say to comfort that version of yourself?", category: 'Shadow Work' },
  { id: 45, text: "What part of yourself have you been hiding? What would happen if you expressed it?", category: 'Shadow Work' },
  { id: 46, text: "What resentment are you holding? What would letting it go look like?", category: 'Shadow Work' },

  // Future Self
  { id: 47, text: "Write a letter to your future self one year from now.", category: 'Future Self' },
  { id: 48, text: "What would your future self thank you for doing today?", category: 'Future Self' },
  { id: 49, text: "Describe your ideal morning routine 5 years from now.", category: 'Future Self' },
  { id: 50, text: "What legacy do you want to leave behind?", category: 'Future Self' },
  { id: 51, text: "If money and time were no obstacle, how would you spend your days?", category: 'Future Self' },
  { id: 52, text: "What does your best possible life look like? Be specific.", category: 'Future Self' },
];

export const EMOTIONS = [
  'Grateful', 'Calm', 'Hopeful', 'Motivated', 'Joyful', 'Confident',
  'Anxious', 'Overwhelmed', 'Frustrated', 'Sad', 'Angry', 'Lonely',
  'Confused', 'Restless', 'Nostalgic', 'Inspired', 'Proud', 'Guilty',
  'Relieved', 'Bored', 'Excited', 'Peaceful',
];

export const MOOD_OPTIONS = [
  { emoji: '\ud83d\ude1e', label: 'Low', value: 1 },
  { emoji: '\ud83d\ude15', label: 'Meh', value: 2 },
  { emoji: '\ud83d\ude10', label: 'Okay', value: 3 },
  { emoji: '\ud83d\ude42', label: 'Good', value: 4 },
  { emoji: '\ud83d\ude0a', label: 'Great', value: 5 },
];

export const JOURNAL_TAGS = [
  'personal', 'work', 'health', 'finance', 'relationships',
  'creativity', 'growth', 'mindfulness', 'gratitude', 'goals',
];
