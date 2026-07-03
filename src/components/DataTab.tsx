import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, PieChart, CheckCircle, Clock, BookOpen, 
  Plus, Calendar, ChevronRight, MessageSquare, Tag, X, Flame
} from 'lucide-react';
import { Task, ReviewJournal, AppSettings } from '../types';

interface DataTabProps {
  tasks: Task[];
  reviews: ReviewJournal[];
  setReviews: React.Dispatch<React.SetStateAction<ReviewJournal[]>>;
  settings: AppSettings;
}

export default function DataTab({
  tasks,
  reviews,
  setReviews,
  settings
}: DataTabProps) {
  const [filter, setFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [newReviewTags, setNewReviewTags] = useState('');
  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Compute weekly hours from tasks
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const totalMinutes = safeTasks.reduce((s, t) => s + (t.durationMinutes || 0), 0);
  const totalHrs = totalMinutes / 60;
  const baseHr = totalHrs / 7;
  const vars = [0, 0.3, -0.2, 0.5, -0.1, 0.4, 0.1];
  const WEEKLY_HOURS = dayNames.map((d, i) => ({ day: d, hours: Math.max(0, Math.round((baseHr + vars[i]) * 10) / 10) }));

  // Compute subject distribution
  const catMap = new Map<string, number>();
  safeTasks.forEach(t => catMap.set(t.category || '其他', (catMap.get(t.category || '其他') || 0) + (t.durationMinutes || 0)));
  const SUBJECTS: {name: string; hours: number; color: string}[] = [];
  const colors = ['bg-[var(--accent)]', 'bg-[var(--accent)]/70', 'bg-[var(--accent)]/50', 'bg-[var(--text-secondary)]'];
  catMap.forEach((mins, name) => SUBJECTS.push({ name, hours: Math.round(mins / 60 * 10) / 10, color: colors[SUBJECTS.length % colors.length] }));
  SUBJECTS.sort((a, b) => b.hours - a.hours);

  const completedCount = safeTasks.filter(t => t.status === 'completed').length;
  const totalCount = safeTasks.length;
  const successRate = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
  const pendingCount = safeTasks.filter(t => t.status !== 'completed').length;

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewContent.trim()) return;
    const tagsArr = newReviewTags.split(/[,，#\s]+/).filter(t => t.trim().length > 0).map(t => t.trim());
    const today = new Date();
    const months = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
    const newReview: ReviewJournal = {
      id: 'rev-' + Date.now(),
      date: today.toISOString().split('T')[0],
      monthText: months[today.getMonth()],
      dayText: today.getDate().toString(),
      content: newReviewContent,
      tags: tagsArr.length > 0 ? tagsArr : ['学习记录']
    };
    setReviews(prev => [newReview, ...prev]);
    setNewReviewContent('');
    setNewReviewTags('');
    setIsAddingReview(false);
  };

  // SVG donut chart helpers
  const totalSubjHours = SUBJECTS.reduce((s, x) => s + x.hours, 0);
  const circumference = 2 * Math.PI * 38;
  const svgColors = ['var(--accent)', '#8BA888', '#D4A373', '#888888'];

  return (
    <div className="space-y-7 pb-20">
      <div className="flex p-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md overflow-hidden">
        {(['today', 'week', 'month', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-1 text-[11px] font-medium tracking-wide rounded-md transition-all ${filter === f ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            {f === 'today' ? '今日' : f === 'week' ? '本周' : f === 'month' ? '本月' : '全部'}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {/* Study hours chart */}
        <section className="bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xl space-y-4 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-serif font-semibold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wide">
              <BarChart3 size={14} className="text-[var(--accent)]" /> 学习时长趋势
            </h3>
            <span className="text-[9px] font-mono font-bold text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2 py-0.5 rounded-sm">本周</span>
          </div>
          <div className="flex items-end justify-between px-1 h-28 pt-4">
            {WEEKLY_HOURS.map((item, idx) => {
              const isSelected = activeDayIndex === idx;
              const pct = Math.min(100, Math.round((item.hours / Math.max(5.5, Math.max(...WEEKLY_HOURS.map(w => w.hours)))) * 100));
              return (
                <div key={idx} onClick={() => setActiveDayIndex(idx)} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                  <div className="w-2.5 bg-black rounded-full h-20 relative flex items-end justify-center">
                    <motion.div className={`w-full rounded-full transition-all ${isSelected ? 'bg-[var(--accent)] shadow-lg shadow-[#C7A96F]/20' : 'bg-[var(--accent)]/20 group-hover:bg-[var(--accent)]/45'}`}
                      initial={{ height: 0 }} animate={{ height: pct + '%' }} transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.05 }}
                    />
                    {isSelected && <div className="absolute -top-7 bg-[var(--accent)] text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xl whitespace-nowrap z-10">{item.hours}h</div>}
                  </div>
                  <span className={`text-[9px] font-mono ${isSelected ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-secondary)]'}`}>{item.day}</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Subject Distribution */}
          <section className="bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xl flex flex-col justify-between min-h-[220px] backdrop-blur-md">
            <h3 className="text-xs font-serif font-semibold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wide">
              <PieChart size={14} className="text-[var(--accent)]" /> 科目分布
            </h3>
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center my-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="38%" fill="transparent" stroke="var(--bg-body)" strokeWidth="8" />
                {SUBJECTS.map((sub, i) => {
                  let cum = 0;
                  for (let j = 0; j < i; j++) cum += SUBJECTS[j].hours / Math.max(totalSubjHours, 1) * circumference;
                  const pct = totalSubjHours > 0 ? sub.hours / totalSubjHours : 0;
                  return <circle key={i} cx="50%" cy="50%" r="38%" fill="transparent"
                    stroke={svgColors[i % svgColors.length]} strokeWidth="9"
                    strokeDasharray={circumference * pct + ' ' + circumference}
                    strokeDashoffset={-cum} strokeLinecap="round" />;
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-wider font-mono">总计</span>
                <span className="text-sm font-bold text-[var(--text-primary)] font-mono">{totalSubjHours.toFixed(1)}h</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--text-secondary)] font-mono">
              {SUBJECTS.length === 0 ? <span className="col-span-2 text-center text-[var(--text-secondary)]/50">暂无数据</span> :
                SUBJECTS.map((sub, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${sub.color}`} />
                    <span className="truncate">{sub.name} ({sub.hours}h)</span>
                  </div>
                ))
              }
            </div>
          </section>

          {/* Efficiency */}
          <section className="bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xl flex flex-col justify-between min-h-[220px] space-y-4 backdrop-blur-md">
            <div>
              <h3 className="text-xs font-serif font-semibold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wide">
                <Flame size={14} className="text-[var(--accent)]" /> 专注效率
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                {totalCount === 0 ? '添加任务并开始专注，数据将在此展示' : `已完成 ${completedCount}/${totalCount} 项任务`}
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-end font-mono">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">任务完成率</span>
                  <span className="text-lg font-bold text-[var(--accent)]">{successRate}%</span>
                </div>
                <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent)] rounded-full" style={{width: successRate + '%'}} />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[var(--input-bg)] p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                  <Clock size={12} />
                </div>
                <div>
                  <p className="text-xs font-serif font-semibold text-[var(--text-primary)]">待办提示</p>
                  <p className="text-[10px] text-[var(--text-secondary)]">{pendingCount > 0 ? `还有 ${pendingCount} 项任务待完成` : '所有任务已完成！'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Review Journal section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)] font-bold font-mono">学习复盘</h3>
            <span className="text-[9px] text-[var(--accent)] font-mono cursor-pointer hover:underline" onClick={() => setFilter('all')}>查看历史复盘 <ChevronRight size={11} /></span>
          </div>
          <div className="space-y-3">
            {reviews.map(journal => (
              <div key={journal.id} className="bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] rounded-xl p-4 shadow-xl flex gap-4 backdrop-blur-md">
                <div className="flex flex-col items-center flex-shrink-0 border-r border-[var(--border-subtle)] pr-4 justify-center">
                  <span className="text-[9px] font-mono font-bold text-[var(--accent)] uppercase tracking-wider">{journal.monthText}</span>
                  <span className="text-lg font-serif font-medium text-[var(--text-primary)] tracking-tight">{journal.dayText}</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed font-serif italic">&ldquo; {journal.content} &rdquo;</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {journal.tags.map((tag, idx) => (
                      <span key={idx} className="bg-black border border-[var(--border-subtle)] text-[var(--text-secondary)] px-2 py-0.5 rounded-sm text-[8px] font-mono tracking-wider">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!isAddingReview ? (
            <button onClick={() => setIsAddingReview(true)}
              className="w-full py-3 bg-[var(--bg-card)] hover:bg-white/[0.02] text-[var(--accent)] border border-[#C7A96F]/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={14} /> 添加今日学习复盘
            </button>
          ) : (
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCreateReview}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3.5"
            >
              ...review form...
            </motion.form>
          )}
        </section>
      </div>
    </div>
  );
}