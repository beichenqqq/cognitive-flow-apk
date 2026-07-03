export interface Task {
  id: string;
  title: string;
  category: string; // 'math' | 'english' | 'physics' | etc.
  timeSlot: string; // e.g. "09:00 - 10:30" or "14:00"
  status: 'pending' | 'ongoing' | 'completed';
  priority: 'high' | 'medium' | 'low';
  completedAt?: string;
  durationMinutes?: number; // accumulated time
}

export interface MonthlyGoal extends Goal {
  type?: 'monthly';
  children?: WeeklyGoal[];
}

export interface ParentGoal extends Goal {
  type?: 'longterm';
  children?: MonthlyGoal[];
}

[];
  members: string[]; // e.g., ["M", "R"]
}

export interface Goal {
  id: string;
  title: string;
  deadline: string;
  progress: number; // percentage 0-100
  category: string;
  durationWeeks?: number;
  subtasks: { id: string; title: string; completed: boolean }

export interface WeeklyGoal extends Goal {
  type?: 'weekly';
}

export interface MonthlyGoal extends Goal {
  type?: 'monthly';
  children?: WeeklyGoal[];
}

export interface ParentGoal extends Goal {
  type?: 'longterm';
  children?: MonthlyGoal[];
}
export interface RepeatingTask {
  id: string;
  title: string;
  schedule: string; // e.g., "每日 • 08:00 AM", "周一至周五 • 02:00 PM"
  time: string; // e.g., "08:00 AM"
  icon: string; // repeat | edit_square
}

export interface RepeatingTaskState {
  id: string;
  title: string;
  schedule: string;
  time: string;
  icon: string;
}

export interface ReviewJournal {
  id: string;
  date: string; // "10月24" or date string
  monthText: string; // "十月"
  dayText: string; // "24"
  content: string;
  tags: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string; // '数学' | '英语' | '物理' | etc.
  type: 'important' | 'mistake' | 'normal';
  timeText: string; // "2小时前", "昨天", etc.
  linkedTaskId?: string;
  linkedTaskTitle?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface AppSettings {
  darkMode: boolean;
  accentColor: 'blue' | 'green' | 'amber'; // 'blue' is default academic blue
  dailyReminder: boolean;
  reminderTime: string; // "09:00"
  timerEndSound: string; // "禅意水晶" | "柔和铜磬" | "现代电子音" | "无"
  advanceReminderMinutes: number; // 10
  clickSoundEffect: boolean;
  whiteNoiseVolume: number; // 0 - 100
}


export interface User {
  id: string;
  name: string;
  avatar: string; // emoji ������ĸ
  createdAt: string;
}
