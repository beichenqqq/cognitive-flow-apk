import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Calendar, Timer, BarChart3, BookOpen, Settings2, 
  Menu, User, Sparkles, X, ChevronRight, Award, Trash2, HelpCircle, GraduationCap, PenTool, CheckCircle, Info, Plus, LogIn
} from 'lucide-react';

import { Task, Goal, ParentGoal, RepeatingTask, ReviewJournal, Note, AppSettings, User as UserType } from './types';
import { 
  INITIAL_TASKS, INITIAL_GOALS, INITIAL_REPEATING_TASKS, 
  INITIAL_REVIEWS, INITIAL_NOTES, INITIAL_SETTINGS,
  INITIAL_GOALS
} from './initialData';

// Subcomponents import
import TodayTab from './components/TodayTab';
import PlanTab from './components/PlanTab';
import FocusTab from './components/FocusTab';
import DataTab from './components/DataTab';
import NotesTab from './components/NotesTab';
import SettingsPanel from './components/SettingsPanel';

function generateId(): string {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}
const AVATAR_OPTIONS = ['🧑‍🎓', '👨‍💻', '👩‍🔬', '👨‍🎨', '👩‍🏫', '👨‍💼', '👩‍🔧', '👨‍🚀', '👩‍🎤', '👨‍🌾'];


function getStorageKey(userId: string, key: string): string {
  return `cf_${userId}_${key}`;
}

export default function App() {
  // Navigation active state
  const [activeTab, setActiveTab] = useState<string>('today');
  
  // Side drawer open state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // User system
  const [users, setUsers] = useState<UserType[]>(() => {
    const saved = localStorage.getItem('cf_users');
    if (saved) return JSON.parse(saved);
    const defaultUser: UserType = {
      id: 'default',
      name: '学习者',
      avatar: '🧑‍🎓',
      createdAt: new Date().toISOString()
    };
    return [defaultUser];
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('cf_currentUser') || 'default';
  });

  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('🧑‍🎓');
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);


  // Helper to get the current user
  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Update currentUserId and persist
  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem('cf_currentUser', userId);
    reloadDataForUser(userId);
    setIsUserPanelOpen(false);
  };

  // Create new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    const newUser: UserType = {
      id: generateId(),
      name: newUserName.trim(),
      avatar: (() => { const opts = ['🧑‍🎓', '👨‍💻', '👩‍🔬', '👨‍🎨', '👩‍🏫', '👨‍💼', '👩‍🔧', '👨‍🚀', '👩‍🎤', '👨‍🌾']; return opts[Math.floor(Math.random() * opts.length)]; })(),
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('cf_users', JSON.stringify(updatedUsers));
    setNewUserName('');
    setIsAddingUser(false);
    // Initialize fresh data for the new user
    const freshData = [
      ['tasks', JSON.stringify(INITIAL_TASKS)],
      ['goals', JSON.stringify(INITIAL_GOALS)],
      ['repeating', JSON.stringify(INITIAL_REPEATING_TASKS)],
      ['reviews', JSON.stringify(INITIAL_REVIEWS)],
      ['notes', JSON.stringify(INITIAL_NOTES)],
      ['settings', JSON.stringify(INITIAL_SETTINGS)]
    ];
    freshData.forEach(([key, data]) => {
      localStorage.setItem(getStorageKey(newUser.id, key as string), data as string);
    });
    switchUser(newUser.id);
  };


  
  const handleChangeAvatar = (user: UserType, newAvatar: string) => {
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, avatar: newAvatar } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('cf_users', JSON.stringify(updatedUsers));
    setIsChangingAvatar(false);
  };

const handleDeleteUser = (userId: string) => {
    if (users.length <= 1) return; // Cannot delete last user
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('cf_users', JSON.stringify(updatedUsers));
    // Clean up user data from localStorage
    ['tasks', 'goals', 'repeating', 'reviews', 'notes', 'settings'].forEach(key => {
      localStorage.removeItem(`cf_${userId}_${key}`);
    });
    // Switch to another user if current user is deleted
    if (userId === currentUserId && updatedUsers.length > 0) {
      switchUser(updatedUsers[0].id);
    }
  };
  const storageUserId = currentUserId;

  // Core application states - namespaced by user
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(getStorageKey(storageUserId, 'tasks'));
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [goals, setGoals] = useState<ParentGoal[]>(() => {
    const saved = localStorage.getItem(getStorageKey(storageUserId, 'goals'));
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  

  const [repeatingTasks, setRepeatingTasks] = useState<RepeatingTask[]>(() => {
    const saved = localStorage.getItem(getStorageKey(storageUserId, 'repeating'));
    return saved ? JSON.parse(saved) : INITIAL_REPEATING_TASKS;
  });

  const [reviews, setReviews] = useState<ReviewJournal[]>(() => {
    const saved = localStorage.getItem(getStorageKey(storageUserId, 'reviews'));
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(getStorageKey(storageUserId, 'notes'));
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(getStorageKey(storageUserId, 'settings'));
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Cross-tab interaction states (Focus Timer target preset)
  const [focusTaskTitle, setFocusTaskTitle] = useState('');

  // Trigger modal for adding daily review journal from any quick action
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState(false);
  const [quickJournalContent, setQuickJournalContent] = useState('');
  const [quickJournalTags, setQuickJournalTags] = useState('');

  // When user switches, reload state from localStorage
  const reloadDataForUser = (userId: string) => {
    const loadFrom = (key: string, initial: any) => {
      const saved = localStorage.getItem(getStorageKey(userId, key));
      return saved ? JSON.parse(saved) : initial;
    };
    setTasks(loadFrom('tasks', INITIAL_TASKS));
    setGoals(loadFrom('goals', INITIAL_GOALS) as ParentGoal[]);
        setRepeatingTasks(loadFrom('repeating', INITIAL_REPEATING_TASKS));
    setReviews(loadFrom('reviews', INITIAL_REVIEWS));
    setNotes(loadFrom('notes', INITIAL_NOTES));
    setSettings(loadFrom('settings', INITIAL_SETTINGS));
  };

  // Persist states to LocalStorage with user namespace
  useEffect(() => {
    localStorage.setItem(getStorageKey(currentUserId, 'tasks'), JSON.stringify(tasks));
  }, [tasks, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(currentUserId, 'goals'), JSON.stringify(goals));
  }, [goals, currentUserId]);



  useEffect(() => {
    localStorage.setItem(getStorageKey(currentUserId, 'repeating'), JSON.stringify(repeatingTasks));
  }, [repeatingTasks, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(currentUserId, 'reviews'), JSON.stringify(reviews));
  }, [reviews, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(currentUserId, 'notes'), JSON.stringify(notes));
  }, [notes, currentUserId]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(currentUserId, 'settings'), JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings, currentUserId]);

  // Reset all application data action (resets current user's data)
  const handleResetAllData = () => {
    setTasks(INITIAL_TASKS);
    setGoals(INITIAL_GOALS);    setRepeatingTasks(INITIAL_REPEATING_TASKS);
    setReviews(INITIAL_REVIEWS);
    setNotes(INITIAL_NOTES);
    setSettings(INITIAL_SETTINGS);
    setActiveTab('today');
  };

  // Quick submit journal from overlay
  const handleQuickJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickJournalContent.trim()) return;

    const tagsArr = quickJournalTags
      .split(/[,，#\s]+/)
      .filter(t => t.trim().length > 0)
      .map(t => t.trim());

    const today = new Date();
    const monthsChinese = [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ];

    const newReview: ReviewJournal = {
      id: `review-${Date.now()}`,
      date: today.toISOString().split('T')[0],
      monthText: monthsChinese[today.getMonth()],
      dayText: today.getDate().toString(),
      content: quickJournalContent,
      tags: tagsArr.length > 0 ? tagsArr : ['智能录入']
    };

    setReviews(prev => [newReview, ...prev]);
    setQuickJournalContent('');
    setQuickJournalTags('');
    setIsQuickJournalOpen(false);
    setActiveTab('data');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--text-primary)] transition-colors duration-200 font-sans antialiased selection:bg-[var(--accent)]/30 selection:text-white">
      
      {/* Universal Top AppBar */}
      <header className="fixed top-0 left-0 w-full z-30 border-b bg-[var(--bg-body)]/85 border-[var(--border-subtle)] backdrop-blur-md">
        <div className="flex justify-between items-end w-full px-6 h-20 pb-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 rounded-md transition-colors hover:bg-white/5 text-[var(--accent)]"
              aria-label="Toggle Drawer Menu"
            >
              <Menu size={18} />
            </button>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[var(--text-secondary)] font-bold mb-0.5">Cognitive Flow</span>
              <h1 className="text-xl font-serif tracking-wide text-[var(--text-primary)] flex items-center gap-1.5">
                <span>{activeTab === 'today' ? '今日学习' : activeTab === 'plan' ? '计划拆分' : activeTab === 'focus' ? '专注模式' : activeTab === 'data' ? '数据洞察' : activeTab === 'notes' ? '错题笔记' : '偏好设置'}</span>
              </h1>
            </div>
          </div>

          {/* Header user avatar - opens user panel */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsUserPanelOpen(true)}
              className="w-8 h-8 rounded-full border border-[var(--border-subtle)] shadow-lg overflow-hidden bg-[var(--bg-card)] flex-shrink-0 relative active:scale-95 transition-transform flex items-center justify-center"
              title={currentUser.name}
            >
              <span className="text-sm">{currentUser.avatar || currentUser.name.charAt(0)}</span>
            </button>
          </div>
        </div>
      </header>

      {/* User Panel Modal */}
      <AnimatePresence>
        {isUserPanelOpen && (
          <div className="fixed inset-0 bg-[var(--overlay-bg)] flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              {/* Avatar Picker */}
              <AnimatePresence>
                {isChangingAvatar && (
     

                         <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 mt-2"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-medium text-[var(--text-primary)]">选择头像</span>
                      <button
                        type="button"
                        onClick={() => setIsChangingAvatar(false)}
                        className="p-1 hover:bg-[var(--accent-soft)] rounded-full text-[var(--text-secondary)]"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATAR_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleChangeAvatar(currentUser, emoji)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border transition-all ${
                            currentUser.avatar === emoji 
                              ? 'border-[var(--accent)] bg-[var(--accent-soft)]' 
                              : 'border-[var(--border-subtle)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 w-full max-w-sm space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-serif font-bold tracking-wide text-[var(--text-primary)] flex items-center gap-2">
                  <User size={14} className="text-[var(--accent)]" /> 切换用户
                </h3>
                <button 
                  type="button"
                  onClick={() => setIsUserPanelOpen(false)}
                  className="p-1 hover:bg-[var(--accent-soft)] rounded-full text-[var(--text-secondary)] hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {/* User list */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      if (user.id !== currentUserId) {
                        setCurrentUserId(user.id);
                        localStorage.setItem('cf_currentUser', user.id);
                        reloadDataForUser(user.id);
                      }
                      setIsUserPanelOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                      user.id === currentUserId 
                        ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20' 
                        : 'hover:bg-[var(--accent-soft)] border border-transparent'
                    }`}
                  >
                    <span className="text-lg w-8 h-8 rounded-full bg-[var(--bg-body)] flex items-center justify-center border border-[var(--border-subtle)] relative">
                      {user.avatar || user.name.charAt(0)}
                      {user.id === currentUserId && (
                        <span
                          onClick={(e) => { e.stopPropagation(); setIsChangingAvatar(true); }}
                          className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform"
                        >
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          </svg>
                        </span>
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-[var(--text-primary)]">{user.name}</span>
                      {user.id === currentUserId && (
                        <span className="text-[9px] text-[var(--accent)] ml-2">当前</span>
                      )}
                    </div>
                    {user.id !== currentUserId && (
                      <>
                        <LogIn size={14} className="text-[var(--text-secondary)] flex-shrink-0" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id);
                          }}
                          className="p-1 hover:bg-red-500/10 rounded-full text-red-400/60 hover:text-red-400 transition-all"
                          title="删除用户"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </button>
                ))}
              </div>

              {!isAddingUser ? (
                <button
                  onClick={() => setIsAddingUser(true)}
                  className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-medium text-[var(--accent)] border border-dashed border-[var(--border-subtle)] rounded-lg hover:bg-[var(--accent-soft)] transition-colors"
                >
                  <Plus size={14} /> 添加新用户
                </button>
              ) : (
                <form onSubmit={handleCreateUser} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="输入用户姓名"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    autoFocus
                  />
                  <div>
                    <label className="block text-[9px] text-[var(--text-secondary)] mb-1.5">选择头像</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['🧑‍🎓','👨‍🎓','👩‍🎓','👨‍💻','👩‍💻','🧠','📚','🎯','🌟','💡','🔥','✨','🎨','🚀','🎵','🌈'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewUserAvatar(emoji)}
                          className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                            newUserAvatar === emoji
                              ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40 scale-110'
                              : 'bg-[var(--bg-body)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-[var(--accent)] text-black font-semibold text-xs rounded-lg hover:bg-[var(--accent)]/90 active:scale-95 transition-all"
                    >
                      确认创建
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsAddingUser(false); setNewUserName(''); }}
                      className="px-4 py-2 text-[var(--text-secondary)] text-xs hover:bg-[var(--accent-soft)] rounded-lg transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-out Sidebar Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 z-40 cursor-pointer backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-72 h-full shadow-2xl flex flex-col justify-between border-r bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-primary)]"
            >
              <div className="p-6 space-y-8">
                {/* Header User details */}
                <div className="flex items-center gap-4 pb-5 border-b border-[var(--border-subtle)]">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-body)] flex items-center justify-center">
                    <span className="text-lg">{currentUser.avatar || currentUser.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-serif font-bold tracking-wide flex items-center gap-1.5 text-[var(--text-primary)]">
                      {currentUser.name}
                    </h3>
                    <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">活跃</p>
                  </div>
                </div>

                {/* Nav list links */}
                <nav className="space-y-2 text-[13px] tracking-wide font-medium">
                  <button 
                    onClick={() => { setActiveTab('today'); setIsDrawerOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-md flex items-center gap-3 transition-colors ${
                      activeTab === 'today' ? 'bg-white/5 text-[var(--accent)] border-l border-[var(--accent)]' : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Home size={14} />
                    <span>今日打卡学习</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('plan'); setIsDrawerOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-md flex items-center gap-3 transition-colors ${
                      activeTab === 'plan' ? 'bg-white/5 text-[var(--accent)] border-l border-[var(--accent)]' : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Calendar size={14} />
                    <span>长期目标与拆分</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('focus'); setIsDrawerOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-md flex items-center gap-3 transition-colors ${
                      activeTab === 'focus' ? 'bg-white/5 text-[var(--accent)] border-l border-[var(--accent)]' : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Timer size={14} />
                    <span>番茄脑波专注</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('data'); setIsDrawerOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-md flex items-center gap-3 transition-colors ${
                      activeTab === 'data' ? 'bg-white/5 text-[var(--accent)] border-l border-[var(--accent)]' : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <BarChart3 size={14} />
                    <span>数据洞察分析</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('notes'); setIsDrawerOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-md flex items-center gap-3 transition-colors ${
                      activeTab === 'notes' ? 'bg-white/5 text-[var(--accent)] border-l border-[var(--accent)]' : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <BookOpen size={14} />
                    <span>错题归纳本</span>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('settings'); setIsDrawerOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 rounded-md flex items-center gap-3 transition-colors ${
                      activeTab === 'settings' ? 'bg-white/5 text-[var(--accent)] border-l border-[var(--accent)]' : 'hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Settings2 size={14} />
                    <span>系统偏好配置</span>
                  </button>
                </nav>

                {/* User switch in drawer */}
                <button
                  onClick={() => { setIsDrawerOpen(false); setIsUserPanelOpen(true); }}
                  className="w-full text-left px-4 py-2.5 rounded-md flex items-center gap-3 text-[13px] tracking-wide font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)] transition-colors"
                >
                  <User size={14} />
                  <span>切换用户</span>
                </button>
              </div>

              {/* Version details footer */}
              <div className="p-6 border-t border-[var(--border-subtle)] text-center flex flex-col gap-1">
                <span className="text-[9px] text-[var(--text-secondary)] font-mono tracking-wider">认知流动 v1.2.0</span>
                <span className="text-[8px] text-[var(--accent)] uppercase tracking-widest font-bold">运行中</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tab Pages rendering viewport with transition animations */}
      <main className="max-w-2xl mx-auto px-5 pt-24 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'today' && (
              <TodayTab 
                tasks={tasks}
                setTasks={setTasks}
                setActiveTab={setActiveTab}
                setFocusTaskTitle={setFocusTaskTitle}
                settings={settings}
                openJournalModal={() => setIsQuickJournalOpen(true)}
              />
            )}

            {activeTab === 'plan' && (
              <PlanTab 
                goals={goals}
                setGoals={setGoals}
                repeatingTasks={repeatingTasks}
                setRepeatingTasks={setRepeatingTasks}
                settings={settings}
              />
            )}

            {activeTab === 'focus' && (
              <FocusTab 
                tasks={tasks}
                setTasks={setTasks}
                focusTaskTitle={focusTaskTitle}
                setFocusTaskTitle={setFocusTaskTitle}
                settings={settings}
                setSettings={setSettings}
              />
            )}

            {activeTab === 'data' && (
              <DataTab 
                reviews={reviews}
                setReviews={setReviews}
                settings={settings}
              />
            )}

            {activeTab === 'notes' && (
              <NotesTab 
                notes={notes}
                setNotes={setNotes}
                settings={settings}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel 
                settings={settings}
                setSettings={setSettings}
                onResetAllData={handleResetAllData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Universal Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-30 flex justify-around items-center px-1.5 py-3 pb-safe border-t bg-[var(--bg-body)]/95 border-[var(--border-subtle)] backdrop-blur-md shadow-[0_-8px_32px_rgba(0,0,0,0.8)]">
        <div className="flex justify-around items-center w-full max-w-2xl mx-auto">
          <button 
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-90 ${
              activeTab === 'today' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Home size={16} fill={activeTab === 'today' ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 tracking-wider">今日</span>
          </button>

          <button 
            onClick={() => setActiveTab('plan')}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-90 ${
              activeTab === 'plan' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Calendar size={16} fill={activeTab === 'plan' ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 tracking-wider">计划</span>
          </button>

          <button 
            onClick={() => setActiveTab('focus')}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-90 ${
              activeTab === 'focus' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Timer size={16} fill={activeTab === 'focus' ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 tracking-wider">专注</span>
          </button>

          <button 
            onClick={() => setActiveTab('data')}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-90 ${
              activeTab === 'data' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BarChart3 size={16} fill={activeTab === 'data' ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 tracking-wider">数据</span>
          </button>

          <button 
            onClick={() => setActiveTab('notes')}
            className={`flex flex-col items-center justify-center py-1 flex-1 transition-all active:scale-90 ${
              activeTab === 'notes' ? 'text-[var(--accent)] font-bold scale-105' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen size={16} fill={activeTab === 'notes' ? 'currentColor' : 'none'} />
            <span className="text-[10px] mt-1 tracking-wider">笔记</span>
          </button>
        </div>
      </nav>

      {/* Global Quick Daily Review Modal overlay */}
      <AnimatePresence>
        {isQuickJournalOpen && (
          <div className="fixed inset-0 bg-[var(--overlay-bg)] flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleQuickJournalSubmit}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                  <Sparkles size={12} className="text-[var(--accent)]" /> 记录今天的收获
                </span>
                <button 
                  type="button" 
                  onClick={() => setIsQuickJournalOpen(false)}
                  className="p-1 hover:bg-[var(--accent-soft)] rounded-full text-[var(--text-secondary)] hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <textarea 
                required
                rows={4}
                placeholder="记录今天学到了什么新想法、遇到了什么难关，或者有什么待改进的步骤..."
                value={quickJournalContent}
                onChange={e => setQuickJournalContent(e.target.value)}
                className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />

              <div>
                <label className="block text-[10px] text-[var(--text-secondary)] mb-1">标签话题 (使用逗号/空格隔开)</label>
                <input 
                  type="text"
                  placeholder="例如: 数学, 极客复盘, 心态"
                  value={quickJournalTags}
                  onChange={e => setQuickJournalTags(e.target.value)}
                  className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-bold text-xs rounded-lg shadow-md active:scale-95 transition-all"
              >
                保存复盘
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



