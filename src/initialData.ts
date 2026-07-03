import { Task, Goal, ParentGoal, RepeatingTask, ReviewJournal, Note, AppSettings } from './types';

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_GOALS: ParentGoal[] = [];

export const INITIAL_REPEATING_TASKS: RepeatingTask[] = [];

export const INITIAL_REVIEWS: ReviewJournal[] = [];

export const INITIAL_NOTES: Note[] = [];

export const INITIAL_SETTINGS: AppSettings = {
  darkMode: true,
  accentColor: 'blue',
  dailyReminder: true,
  reminderTime: '09:00 AM',
  timerEndSound: '禅意水晶',
  advanceReminderMinutes: 10,
  clickSoundEffect: false,
  whiteNoiseVolume: 45
};

export const GOAL_TEMPLATES = [
  {
    id: 'tmpl1',
    title: '博士备考',
    duration: '12周规划',
    category: '学术',
    icon: 'GraduationCap'
  },
  {
    id: 'tmpl2',
    title: 'CFA 一级',
    duration: '标准6个月计划',
    category: '金融',
    icon: 'TrendingUp'
  },
  {
    id: 'tmpl3',
    title: '六级常规',
    duration: '每日45分钟冲刺',
    category: '英语',
    icon: 'Languages'
  }
];
