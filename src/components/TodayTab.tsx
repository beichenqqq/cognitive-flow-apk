import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, CheckCircle2, Flame, Play, Check, Edit2, Plus, 
  Trash2, BookOpen, Clock, CalendarDays, ChevronRight, X, Sparkles
} from 'lucide-react';
import { Task, AppSettings } from '../types';

interface TodayTabProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setActiveTab: (tab: string) => void;
  setFocusTaskTitle: (title: string) => void;
  settings: AppSettings;
  openJournalModal: () => void;
}

export default function TodayTab({
  tasks,
  setTasks,
  setActiveTab,
  setFocusTaskTitle,
  settings,
  openJournalModal
}: TodayTabProps) {
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('数学');

  // Countdown target states (customizable)
  const [examName, setExamName] = useState('期末考试');
  const [daysRemaining, setDaysRemaining] = useState(15);
  const [progressPercent, setProgressPercent] = useState(75);
  const [isEditingExam, setIsEditingExam] = useState(false);

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filter === 'ongoing') return t.status === 'ongoing' || t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  // Task Statistics
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  
  // Accumulated duration
  const totalDurationHours = (tasks.reduce((acc, t) => acc + (t.durationMinutes || 0), 0) / 60).toFixed(1);

  // Toggle task completion
  const handleToggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleted = t.status === 'completed';
        return {
          ...t,
          status: isCompleted ? 'ongoing' : 'completed',
          timeSlot: isCompleted ? '09:00 - 10:30' : `已于 ${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 完成`,
          completedAt: isCompleted ? undefined : new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return t;
    }));
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Create new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      category: newTaskCategory,
      timeSlot: newTaskTime || '随堂自习',
      status: 'pending',
      priority: newTaskPriority
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    setNewTaskTime('');
    setNewTaskPriority('medium');
    setIsAddingTask(false);
  };

  // Shift to Focus Tab with selected task
  const triggerFocusTimer = (taskTitle: string) => {
    setFocusTaskTitle(taskTitle);
    setActiveTab('focus');
  };

  return (
    <div className="space-y-7 pb-20 selection:bg-[var(--accent)]/30 selection:text-white">
      {/* Target Exam Banner */}
      <section className="relative overflow-hidden bg-[var(--bg-card)]/90 border border-[var(--border-subtle)] rounded-xl p-6 shadow-2xl backdrop-blur-md">
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-[var(--accent)]/5 blur-3xl rounded-full"></div>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-sm">
                目标进度
              </span>
              <button 
                onClick={() => setIsEditingExam(true)} 
                className="p-1 hover:bg-[var(--accent-soft)] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                title="修改目标"
              >
                <Edit2 size={11} />
              </button>
            </div>
            <h2 className="text-lg font-serif font-semibold tracking-wide text-[var(--text-primary)]">距离 {examName} 还有</h2>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-serif font-semibold text-[var(--accent)] tracking-tight">{daysRemaining}</span>
              <span className="text-xs font-serif font-medium text-[var(--text-secondary)] italic">剩余天数</span>
            </div>
          </div>

          {/* Glowing Circular Progress Ring */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                className="text-white/5" 
                cx="40" 
                cy="40" 
                fill="transparent" 
                r="34" 
                stroke="currentColor" 
                strokeWidth="4" 
              />
              <motion.circle 
                className="text-[var(--accent)]" 
                cx="40" 
                cy="40" 
                fill="transparent" 
                r="34" 
                stroke="currentColor" 
                strokeDasharray={`${2 * Math.PI * 34}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - progressPercent / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round" 
                strokeWidth="4" 
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">{progressPercent}%</span>
              <span className="text-[8px] uppercase tracking-wider text-[var(--text-secondary)]">已完成</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Counters Section */}
      <section className="grid grid-cols-3 gap-3">
        <motion.div 
          whileHover={{ y: -1 }}
          className="bg-[var(--bg-card)]/50 border border-[var(--border-subtle)] p-4 rounded-xl text-center shadow-lg backdrop-blur-sm"
        >
          <Timer className="mx-auto text-[var(--accent)] opacity-80 mb-1.5" size={16} />
          <p className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-semibold mb-0.5">学习时长</p>
          <p className="text-2xl font-serif font-medium text-[var(--text-primary)] tracking-tight">{totalDurationHours}<span className="text-xs text-[var(--text-secondary)] ml-0.5 italic">H</span></p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -1 }}
          className="bg-[var(--bg-card)]/50 border border-[var(--border-subtle)] p-4 rounded-xl text-center shadow-lg backdrop-blur-sm"
        >
          <CheckCircle2 className="mx-auto text-[var(--accent)] opacity-80 mb-1.5" size={16} />
          <p className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-semibold mb-0.5">任务完成</p>
          <p className="text-2xl font-serif font-medium text-[var(--text-primary)] tracking-tight">{completedCount}<span className="text-[var(--text-secondary)] font-sans font-light text-sm mx-1">/</span>{totalCount}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -1 }}
          className="bg-[var(--bg-card)]/50 border border-[var(--border-subtle)] p-4 rounded-xl text-center shadow-lg backdrop-blur-sm"
        >
          <Flame className="mx-auto text-[var(--accent)] opacity-80 mb-1.5" size={16} />
          <p className="text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-semibold mb-0.5">连续打卡</p>
          <p className="text-2xl font-serif font-medium text-[var(--text-primary)] tracking-tight">{Math.min(completedCount, 99) || 0}<span className="text-xs text-[var(--text-secondary)] ml-0.5 italic">D</span></p>
        </motion.div>
      </section>

      {/* Quick Tools Section */}
      <section className="space-y-3">
        <h3 className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)] font-bold">快捷工具</h3>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setActiveTab('focus')}
            className="flex flex-col items-center justify-center py-4 bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/70 border border-[var(--border-subtle)] rounded-xl shadow-md transition-all duration-300 group active:scale-95"
          >
            <div className="p-2.5 bg-[var(--accent)]/5 text-[var(--accent)] rounded-lg group-hover:scale-105 transition-transform mb-2">
              <Timer size={16} />
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)] tracking-wide">番茄专注钟</span>
          </button>

          <button 
            onClick={openJournalModal}
            className="flex flex-col items-center justify-center py-4 bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/70 border border-[var(--border-subtle)] rounded-xl shadow-md transition-all duration-300 group active:scale-95"
          >
            <div className="p-2.5 bg-[var(--accent)]/5 text-[var(--accent)] rounded-lg group-hover:scale-105 transition-transform mb-2">
              <Sparkles size={16} />
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)] tracking-wide">智能复盘日记</span>
          </button>

          <button 
            onClick={() => setActiveTab('notes')}
            className="flex flex-col items-center justify-center py-4 bg-[var(--bg-card)]/40 hover:bg-[var(--bg-card)]/70 border border-[var(--border-subtle)] rounded-xl shadow-md transition-all duration-300 group active:scale-95"
          >
            <div className="p-2.5 bg-[var(--accent)]/5 text-[var(--accent)] rounded-lg group-hover:scale-105 transition-transform mb-2">
              <BookOpen size={16} />
            </div>
            <span className="text-xs font-medium text-[var(--text-primary)] tracking-wide">错题归纳本</span>
          </button>
        </div>
      </section>

      {/* Tasks Section Header */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)] font-bold">今日任务</h3>
          <div className="flex bg-[var(--bg-card)] p-0.5 rounded-md border border-[var(--border-subtle)] self-start sm:self-auto">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-[11px] font-medium tracking-wide rounded-md transition-all ${filter === 'all' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              全部
            </button>
            <button 
              onClick={() => setFilter('ongoing')}
              className={`px-3 py-1 text-[11px] font-medium tracking-wide rounded-md transition-all ${filter === 'ongoing' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              进行中
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 text-[11px] font-medium tracking-wide rounded-md transition-all ${filter === 'completed' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              已完成
            </button>
          </div>
        </div>

        {/* Task Cards Stack */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`bg-[var(--bg-card)]/55 border border-[var(--border-subtle)] rounded-xl p-5 shadow-xl relative overflow-hidden group ${
                  task.status === 'completed' 
                    ? 'opacity-50 border-[var(--border-subtle)]' 
                    : 'border-l-2 border-l-[var(--accent)]'
                }`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded-sm ${
                        task.status === 'completed' 
                          ? 'bg-emerald-950/20 text-[var(--accent)] border border-emerald-950/30' 
                          : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                      }`}>
                        {task.status === 'completed' ? '已完成' : '进行中'}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-bold font-mono">
                        //{task.category}
                      </span>
                    </div>
                    <h4 className={`text-sm font-serif font-medium text-[var(--text-primary)] mt-1 ${task.status === 'completed' ? 'line-through text-[var(--text-secondary)]' : ''}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 font-mono pt-0.5">
                      <Clock size={11} className="text-[var(--accent)] opacity-70" /> {task.timeSlot}
                    </p>
                  </div>
                  
                  {/* Priority Tag & Action Trigger */}
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                      task.priority === 'high' 
                        ? 'text-[var(--accent)] bg-[var(--accent)]/5 border-[#C7A96F]/10' 
                        : 'text-[var(--text-secondary)] bg-white/5 border-[var(--border-subtle)]'
                    }`}>
                      {task.priority === 'high' ? '高优先级' : '普通'}
                    </span>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-[var(--text-secondary)] hover:text-[var(--danger-text)] opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--accent-soft)] rounded-md"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Subtask / Focus trigger actions */}
                {task.status !== 'completed' && (
                  <div className="flex gap-2.5 border-t border-[var(--border-subtle)] pt-3.5 mt-2">
                    <button 
                      onClick={() => triggerFocusTimer(task.title)}
                      className="flex-1 py-1.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black text-xs font-semibold rounded-md flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
                    >
                      <Play size={10} fill="currentColor" /> 进入番茄专注
                    </button>
                    <button 
                      onClick={() => handleToggleComplete(task.id)}
                      className="flex-1 py-1.5 border border-[var(--border-subtle)] hover:bg-[var(--accent-soft)] text-[var(--text-primary)] text-xs font-semibold rounded-md flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
                    >
                      <Check size={11} /> 标记完成
                    </button>
                  </div>
                )}

                {task.status === 'completed' && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--accent)] font-medium font-serif">
                    <CheckCircle2 size={12} /> 已打卡归档
                    <button 
                      onClick={() => handleToggleComplete(task.id)}
                      className="ml-auto text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] underline tracking-wider font-sans"
                    >
                      撤销
                    </button>
                  </div>
                )}
              </motion.div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-10 text-[var(--text-secondary)] text-xs bg-white/[0.01] border border-dashed border-[var(--border-subtle)] rounded-xl">
                今日暂无符合分类的任务
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Add Task Trigger / Expand Form */}
        {!isAddingTask ? (
          <button 
            onClick={() => setIsAddingTask(true)}
            className="w-full py-3.5 border border-dashed border-[var(--border-subtle)] hover:border-[#C7A96F]/30 hover:bg-[var(--accent)]/5 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.99]"
          >
            <Plus size={13} /> 新增今日学习科目任务
          </button>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreateTask}
            className="bg-[var(--bg-card)]/95 border border-[var(--border-subtle)] rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-serif font-bold tracking-wide text-[var(--text-primary)]">创建新学习科目 </span>
              <button 
                type="button" 
                onClick={() => setIsAddingTask(false)}
                className="p-1 hover:bg-[var(--accent-soft)] rounded text-[var(--text-secondary)] hover:text-white"
              >
                <X size={13} />
              </button>
            </div>
            
            <input 
              type="text"
              required
              placeholder="任务名称 (例如：高数课后习题、背六级单词)"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3.5 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-semibold">时间段</label>
                <input 
                  type="text"
                  placeholder="如：09:00 - 10:30"
                  value={newTaskTime}
                  onChange={e => setNewTaskTime(e.target.value)}
                  className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-semibold">科目归类</label>
                <select
                  value={newTaskCategory}
                  onChange={e => setNewTaskCategory(e.target.value)}
                  className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="数学">数学</option>
                  <option value="英语">英语</option>
                  <option value="物理">物理</option>
                  <option value="政治">政治</option>
                  <option value="自习">自习</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewTaskPriority('high')}
                  className={`px-3 py-1.5 text-[10px] font-mono tracking-wider rounded-md border ${
                    newTaskPriority === 'high' ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[#C7A96F]/20' : 'bg-white/5 text-[var(--text-secondary)] border-[var(--border-subtle)]'
                  }`}
                >
                  高优先级
                </button>
                <button
                  type="button"
                  onClick={() => setNewTaskPriority('medium')}
                  className={`px-3 py-1.5 text-[10px] font-mono tracking-wider rounded-md border ${
                    newTaskPriority === 'medium' ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[#C7A96F]/20' : 'bg-white/5 text-[var(--text-secondary)] border-[var(--border-subtle)]'
                  }`}
                >
                  普通
                </button>
              </div>
              <button 
                type="submit"
                className="px-4 py-2 bg-[var(--accent)] text-black font-semibold rounded-md text-xs hover:bg-[var(--accent)]/90 transition-all shadow-md active:scale-95"
              >
                保存科目
              </button>
            </div>
          </motion.form>
        )}
      </section>

      {/* Daily Schedule Timeline Section */}
      

      {/* Target Edit Dialog (Custom overlay) */}
      <AnimatePresence>
        {isEditingExam && (
          <div className="fixed inset-0 bg-[var(--overlay-bg)] flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 w-full max-w-sm space-y-4 shadow-2xl text-[var(--text-primary)]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-serif font-bold tracking-wide text-[var(--text-primary)]">修改倒计时目标</h3>
                <button 
                  onClick={() => setIsEditingExam(false)}
                  className="p-1 hover:bg-[var(--accent-soft)] rounded-full text-[var(--text-secondary)] hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">目标名称</label>
                  <input 
                    type="text"
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">剩余天数</label>
                    <input 
                      type="number"
                      value={daysRemaining}
                      onChange={e => setDaysRemaining(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">达成率 (%)</label>
                    <input 
                      type="number"
                      value={progressPercent}
                      onChange={e => setProgressPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditingExam(false)}
                className="w-full py-2 bg-[var(--accent)] text-black font-semibold text-xs rounded-md shadow-md hover:bg-[var(--accent)]/90 active:scale-95 transition-all"
              >
                确认并保存
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
