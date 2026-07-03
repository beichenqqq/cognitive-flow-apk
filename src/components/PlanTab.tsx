import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Check, Settings2, Plus, Users, ArrowRight,
  GraduationCap, TrendingUp, Languages, Target, ChevronRight, X, Trash2, ChevronDown, Move
} from 'lucide-react';
import { ParentGoal, Goal, RepeatingTask, AppSettings } from '../types';
import { GOAL_TEMPLATES } from '../initialData';

interface PlanTabProps {
  goals: ParentGoal[];
  setGoals: React.Dispatch<React.SetStateAction<ParentGoal[]>>;
  repeatingTasks: RepeatingTask[];
  setRepeatingTasks: React.Dispatch<React.SetStateAction<RepeatingTask[]>>;
  settings: AppSettings;
}

export default function PlanTab({
  goals,
  setGoals,
  repeatingTasks,
  setRepeatingTasks,
  settings
}: PlanTabProps) {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>('g1');
  const [expandedMonthlyId, setExpandedMonthlyId] = useState<string | null>('m1');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState<'longterm' | 'monthly' | 'weekly'>('longterm');
  const [newGoalParentId, setNewGoalParentId] = useState<string | undefined>(undefined);
  const [newGoalSubtaskText, setNewGoalSubtaskText] = useState('');
  const [newGoalSubtasks, setNewGoalSubtasks] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<{id: string; type: 'goal' | 'monthly' | 'weekly'; sourceParentId?: string} | null>(null);

  // Find all monthly goals across all longterm goals for the dropdown
  const allMonthlyGoals = goals.flatMap(g => g.children || []);
  // Find all weekly goals across all monthly goals
  const allWeeklyGoals = allMonthlyGoals.flatMap(m => m.children || []);

  // Toggle subtask for any goal at any level
  const toggleSubtaskInTree = (goalId: string, subtaskId: string) => {
    const updateInGoals = (goals: ParentGoal[], isTopLevel: boolean): ParentGoal[] => {
      return goals.map(g => {
        if (g.id === goalId) {
          const updatedSubtasks = (g.subtasks || []).map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          const completedCount = updatedSubtasks.filter(s => s.completed).length;
          const progress = Math.round((completedCount / updatedSubtasks.length) * 100) || 0;
          return { ...g, subtasks: updatedSubtasks, progress };
        }
        if ((g.children || []).length > 0) {
          const updatedChildren = g.children.map(c => {
            if (c.id === goalId) {
              const updatedSubtasks = (c.subtasks || []).map(s =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              );
              const completedCount = updatedSubtasks.filter(s => s.completed).length;
              const progress = Math.round((completedCount / updatedSubtasks.length) * 100) || 0;
              return { ...c, subtasks: updatedSubtasks, progress };
            }
            if ((c.children || []).length > 0) {
              const updatedWeekly = c.children.map(w => {
                if (w.id === goalId) {
                  const updatedSubtasks = (w.subtasks || []).map(s =>
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                  );
                  const completedCount = updatedSubtasks.filter(s => s.completed).length;
                  const progress = Math.round((completedCount / updatedSubtasks.length) * 100) || 0;
                  return { ...w, subtasks: updatedSubtasks, progress };
                }
                return w;
              });
              return { ...c, children: updatedWeekly };
            }
            return c;
          });
          return { ...g, children: updatedChildren };
        }
        return g;
      });
    };
    setGoals(updateInGoals(goals, true));
  };

  // Delete goal from tree
  const handleDeleteGoal = (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const deleteFromTree = (goals: ParentGoal[]): ParentGoal[] =>
      goals.filter(g => {
        if (g.id === goalId) return false;
        if (g.children) g.children = g.children.filter(c => {
          if (c.id === goalId) return false;
          if (c.children) c.children = c.children.filter(w => w.id !== goalId);
          return true;
        });
        return true;
      });
    setGoals(deleteFromTree(goals));
  };

  // Add subtask to draft
  const handleAddDraftSubtask = () => {
    if (!newGoalSubtaskText.trim()) return;
    setNewGoalSubtasks(prev => [...prev, newGoalSubtaskText.trim()]);
    setNewGoalSubtaskText('');
  };

  const handleRemoveDraftSubtask = (index: number) => {
    setNewGoalSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  // Create goal in tree
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    const formattedSubtasks = newGoalSubtasks.map((text, i) => ({
      id: `sub-${Date.now()}-${i}`,
      title: text,
      completed: false
    }));
    const baseGoal: Goal = {
      id: `g-${Date.now()}`,
      title: newGoalTitle,
      deadline: '',
      progress: 0,
      category: '个人',
      subtasks: formattedSubtasks.length > 0 ? formattedSubtasks : [{ id: `sub-d`, title: '设定第一阶段小目标', completed: false }],
      members: ['M']
    };

    setGoals(prev => {
      if (newGoalType === 'longterm') {
        return [{ ...baseGoal, type: 'longterm' as const, children: [] }, ...prev];
      }
      if (newGoalType === 'monthly') {
        const parentId = newGoalParentId || prev[0]?.id;
        return prev.map(g =>
          g.id === parentId
            ? { ...g, children: [{ ...baseGoal, type: 'monthly' as const, children: [] }, ...(g.children || [])] }
            : g
        );
      }
      // weekly
      const monthlyId = newGoalParentId || allMonthlyGoals[0]?.id;
      return prev.map(g => ({
        ...g,
        children: (g.children || []).map(m =>
          m.id === monthlyId
            ? { ...m, children: [{ ...baseGoal, children: [] as Goal[] }, ...(m.children || [])] }
            : m
        )
      }));
    });

    setNewGoalTitle('');
    setNewGoalSubtasks([]);
    setIsAddingGoal(false);
  };

  // Move a weekly sub-goal to a different parent
  const handleMoveChild = (childId: string, fromParentId: string, toParentId: string) => {
    setGoals(prev => {
      let movedGoal: Goal | null = null;
      // Remove from source
      const afterRemove = prev.map(g => ({
        ...g,
        children: (g.children || []).map(m => {
          if (m.id === fromParentId) {
            const idx = (m.children || []).findIndex(w => w.id === childId);
            if (idx >= 0) movedGoal = m.children[idx];
            return { ...m, children: (m.children || []).filter(w => w.id !== childId) };
          }
          return m;
        })
      }));
      // Add to destination
      if (movedGoal) {
        return afterRemove.map(g => ({
          ...g,
          children: (g.children || []).map(m =>
            m.id === toParentId
              ? { ...m, children: [movedGoal!, ...(m.children || [])] }
              : m
          )
        }));
      }
      return afterRemove;
    });
  };

  // Import template
  const handleImportTemplate = (template: typeof GOAL_TEMPLATES[0]) => {
    const isExist = goals.some(g => g.title === template.title);
    if (isExist) return;
    const newGoal: ParentGoal = {
      id: `g-${Date.now()}`,
      title: template.title,
      deadline: template.id === 'tmpl2' ? '6个月后' : '3个月后',
      progress: 0,
      category: template.category,
      subtasks: [
        { id: `s-${Date.now()}-1`, title: '获取备考核心教材与考点清单', completed: false },
        { id: `s-${Date.now()}-2`, title: '制定阶段性系统学习时间表', completed: false },
        { id: `s-${Date.now()}-3`, title: '按周刷真题并整理重点错题', completed: false }
      ],
      members: ['M'],
      type: 'longterm',
      children: []
    };
    setGoals(prev => [...prev, newGoal]);
    setExpandedGoalId(newGoal.id);
  };

  const renderTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap size={18} />;
      case 'TrendingUp': return <TrendingUp size={18} />;
      case 'Languages': return <Languages size={18} />;
      default: return <Target size={18} />;
    }
  };

  // Calculate progress from all levels
  const calcProgress = (goal: ParentGoal): number => {
    const subs = goal.subtasks || [];
    const childSubs = (goal.children || []).flatMap(c => {
      const cSubs = c.subtasks || [];
      const wSubs = (c.children || []).flatMap(w => w.subtasks || []);
      return [...cSubs, ...wSubs];
    });
    const all = [...subs, ...childSubs];
    if (all.length === 0) return 0;
    return Math.round((all.filter(s => s.completed).length / all.length) * 100);
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Add New Goal Button */}
      <button
        onClick={() => { setIsAddingGoal(true); newGoalType !== 'longterm'; }}
        className="w-full py-3 border border-dashed border-[var(--border-subtle)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent-soft)] rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <Plus size={14} /> 创建新计划
      </button>

      {/* Create Goal Modal */}
      <AnimatePresence>
        {isAddingGoal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleCreateGoal}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 w-full max-w-sm space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-[var(--text-primary)]">新建计划项</h3>
                <button type="button" onClick={() => setIsAddingGoal(false)} className="p-1 hover:bg-[var(--accent-soft)] rounded-full text-[var(--text-secondary)]">
                  <X size={15} />
                </button>
              </div>

              {/* Choose type */}
              <div className="flex space-x-1 bg-[var(--bg-body)] p-0.5 rounded-md border border-[var(--border-subtle)]">
                {(['longterm', 'monthly', 'weekly'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setNewGoalType(type);
                      setNewGoalParentId(undefined);
                    }}
                    className={`flex-1 py-1.5 text-[11px] rounded-md transition-all ${
                      newGoalType === type ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {type === 'longterm' ? '长期目标' : type === 'monthly' ? '月度计划' : '周计划'}
                  </button>
                ))}
              </div>

              {/* Parent selector for non-longterm */}
              {newGoalType !== 'longterm' && (
                <select
                  value={newGoalParentId || ''}
                  onChange={e => setNewGoalParentId(e.target.value)}
                  className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  {newGoalType === 'monthly'
                    ? goals.map(g => <option key={g.id} value={g.id}>隶属于：{g.title}</option>)
                    : allMonthlyGoals.map(m => <option key={m.id} value={m.id}>隶属于：{m.title}</option>)
                  }
                </select>
              )}

              <input
                type="text"
                required
                placeholder={newGoalType === 'longterm' ? '输入长期目标名称' : newGoalType === 'monthly' ? '输入月度计划名称' : '输入周计划名称'}
                value={newGoalTitle}
                onChange={e => setNewGoalTitle(e.target.value)}
                className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                autoFocus
              />

              {/* Subtasks input */}
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="添加子任务"
                    value={newGoalSubtaskText}
                    onChange={e => setNewGoalSubtaskText(e.target.value)}
                    className="flex-1 bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddDraftSubtask())}
                  />
                  <button type="button" onClick={handleAddDraftSubtask} className="px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-xs rounded-lg hover:bg-[var(--accent)]/20">
                    <Plus size={14} />
                  </button>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {newGoalSubtasks.map((st, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1 bg-[var(--bg-body)] rounded text-[11px] text-[var(--text-primary)]">
                      <span>{st}</span>
                      <button type="button" onClick={() => handleRemoveDraftSubtask(i)} className="text-red-400/60 hover:text-red-400">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-2 bg-[var(--accent)] text-black font-semibold text-xs rounded-lg hover:bg-[var(--accent)]/90 active:scale-95 transition-all">
                确认创建
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Tree hierarchy display */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const isExpanded = expandedGoalId === goal.id;
          const realProgress = calcProgress(goal);
          return (
            <motion.div key={goal.id} layout className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-md">
              {/* Long-term goal header */}
              <div
                onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                className="p-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Target size={15} className="text-[var(--accent)]" />
                    <div>
                      <h3 className="text-sm font-serif font-semibold text-[var(--text-primary)]">{goal.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] text-[var(--text-secondary)]">{goal.deadline}</span>
                        <span className="text-[9px] text-[var(--text-secondary)]">•</span>
                        <span className="text-[9px] text-[var(--accent)] font-medium">{goal.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[var(--accent)]">{realProgress}%</span>
                    {isExpanded ? <ChevronDown size={14} className="text-[var(--text-secondary)]" /> : <ChevronRight size={14} className="text-[var(--text-secondary)]" />}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2.5 w-full h-1 bg-[var(--bg-body)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--accent)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${realProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[var(--border-subtle)]"
                  >
                    {/* Subtasks at longterm level */}
                    <div className="px-4 py-3 space-y-1.5">
                      {goal.subtasks.map(st => (
                        <button key={st.id} onClick={() => toggleSubtaskInTree(goal.id, st.id)} className="w-full flex items-center gap-2 text-left">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${st.completed ? 'bg-green-500 border-green-500' : 'border-[var(--text-secondary)]'}`}>
                            {st.completed && <Check size={9} strokeWidth={3} className="text-black" />}
                          </div>
                          <span className={`text-[12px] ${st.completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>{st.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Monthly children */}
                    <div className="px-4 pb-4 space-y-3">
                      {(goal.children || []).length === 0 && (
                        <p className="text-[11px] text-[var(--text-secondary)] text-center py-2 italic">暂无月度计划，点击下方添加</p>
                      )}
                      {(goal.children || []).map(month => {
                        const isMonthExpanded = expandedMonthlyId === month.id;
                        const monthProgress = calcProgress({ ...month, children: month.children || [], type: 'monthly' });
                        return (
                          <div key={month.id} className="bg-[var(--bg-body)] rounded-lg border border-[var(--border-subtle)] overflow-hidden">
                            <div
                              onClick={() => setExpandedMonthlyId(isMonthExpanded ? null : month.id)}
                              className="p-3 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <Calendar size={13} className="text-[var(--accent)]" />
                                <span className="text-xs font-medium text-[var(--text-primary)]">{month.title}</span>
                                <span className="text-[9px] text-[var(--text-secondary)]">{month.deadline}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-[var(--accent)]">{monthProgress}%</span>
                                <button onClick={(e) => handleDeleteGoal(month.id, e)} className="p-1 hover:bg-red-500/10 rounded text-red-400/60 hover:text-red-400 transition-all" title="删除">
                                  <Trash2 size={10} />
                                </button>
                                {isMonthExpanded ? <ChevronDown size={12} className="text-[var(--text-secondary)]" /> : <ChevronRight size={12} className="text-[var(--text-secondary)]" />}
                              </div>
                            </div>

                            {/* Monthly progress bar */}
                            {isMonthExpanded && (
                              <div className="px-3">
                                <div className="w-full h-0.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                                  <motion.div className="h-full bg-green-500/70 rounded-full" initial={{ width: 0 }} animate={{ width: `${monthProgress}%` }} transition={{ duration: 0.6 }} />
                                </div>
                              </div>
                            )}

                            {/* Monthly subtasks + weekly children */}
                            {isMonthExpanded && (
                              <div className="px-3 pb-3">
                                {/* Subtasks */}
                                <div className="py-2 space-y-1">
                                  {(month.subtasks || []).map(st => (
                                    <button key={st.id} onClick={() => toggleSubtaskInTree(month.id, st.id)} className="w-full flex items-center gap-2 text-left">
                                      <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${st.completed ? 'bg-green-500 border-green-500' : 'border-[var(--text-secondary)]/50'}`}>
                                        {st.completed && <Check size={8} strokeWidth={3} className="text-black" />}
                                      </div>
                                      <span className={`text-[11px] ${st.completed ? 'line-through text-[var(--text-secondary)]/60' : 'text-[var(--text-primary)]/80'}`}>{st.title}</span>
                                    </button>
                                  ))}
                                </div>

                                {/* Weekly children */}
                                <div className="ml-3 border-l-2 border-[var(--border-subtle)] pl-3 space-y-2 mt-1">
                                  {(month.children || []).length === 0 && (
                                    <p className="text-[10px] text-[var(--text-secondary)] italic py-1">暂无周计划</p>
                                  )}
                                  {(month.children || []).map(week => {
                                    const weekProgress = week.subtasks ? Math.round((week.subtasks.filter(s => s.completed).length / Math.max(week.subtasks.length, 1)) * 100) : 0;
                                    return (
                                      <div key={week.id} draggable="true" onDragStart={(e) => { setDraggedItem({ id: week.id, type: 'weekly', sourceParentId: month.id }); e.dataTransfer.effectAllowed = 'move'; }} className="bg-[var(--bg-card)]/60 rounded-lg border border-[var(--border-subtle)]/50 p-2.5">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400/70" />
                                            <span className="text-[11px] font-medium text-[var(--text-primary)]/90">{week.title}</span>
                                            <span className="text-[8px] text-[var(--text-secondary)]">{week.deadline}</span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            {/* Move to different parent if there are other monthly goals */}
                                            {allMonthlyGoals.filter(m => m.id !== month.id).length > 0 && (
                                              <select
                                                onClick={e => e.stopPropagation()}
                                                onChange={e => { handleMoveChild(week.id, month.id, e.target.value); }}
                                                className="text-[8px] bg-transparent border border-[var(--border-subtle)] rounded px-1 py-0.5 text-[var(--text-secondary)] cursor-pointer"
                                                title="移动到其他月计划"
                                              >
                                                <option value="">移动...</option>
                                                {allMonthlyGoals.filter(m => m.id !== month.id).map(m => (
                                                  <option key={m.id} value={m.id}>{m.title}</option>
                                                ))}
                                              </select>
                                            )}
                                            <button onClick={(e) => handleDeleteGoal(week.id, e)} className="p-0.5 hover:bg-red-500/10 rounded text-red-400/50 hover:text-red-400 transition-all" title="删除">
                                              <Trash2 size={9} />
                                            </button>
                                          </div>
                                        </div>
                                        {/* Weekly subtasks */}
                                        <div className="mt-1.5 space-y-0.5">
                                          {(week.subtasks || []).map(st => (
                                            <button key={st.id} onClick={() => toggleSubtaskInTree(week.id, st.id)} className="w-full flex items-center gap-1.5 text-left">
                                              <div className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center ${st.completed ? 'bg-green-500 border-green-500' : 'border-[var(--text-secondary)]/40'}`}>
                                                {st.completed && <Check size={6} strokeWidth={3} className="text-black" />}
                                              </div>
                                              <span className={`text-[10px] ${st.completed ? 'line-through text-[var(--text-secondary)]/50' : 'text-[var(--text-primary)]/70'}`}>{st.title}</span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Add weekly to this month */}
                                <button
                                  onClick={() => {
                                    setNewGoalType('weekly');
                                    setNewGoalParentId(month.id);
                                    setIsAddingGoal(true);
                                  }}
                                  className="mt-2 w-full py-1.5 border border-dashed border-[var(--border-subtle)] hover:border-blue-400/30 rounded-lg text-[10px] text-[var(--text-secondary)] hover:text-blue-400 flex items-center justify-center gap-1 transition-all"
                                >
                                  <Plus size={11} /> 添加周计划
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add monthly plan to this longterm goal */}
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => {
                          setNewGoalType('monthly');
                          setNewGoalParentId(goal.id);
                          setIsAddingGoal(true);
                        }}
                        className="w-full py-2 border border-dashed border-[var(--border-subtle)] hover:border-green-400/30 rounded-lg text-[10px] text-[var(--text-secondary)] hover:text-green-400 flex items-center justify-center gap-1 transition-all"
                      >
                        <Plus size={12} /> 添加月度计划
                      </button>
                    </div>

                    {/* Delete goal */}
                    <div className="px-4 pb-3 flex justify-end">
                      <button onClick={(e) => handleDeleteGoal(goal.id, e)} className="text-[10px] text-red-400/50 hover:text-red-400 flex items-center gap-1 transition-all">
                        <Trash2 size={10} /> 删除此长期目标
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Templates section */}
      {goals.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm space-y-3">
          <h4 className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">目标模板</h4>
          <div className="space-y-2">
            {GOAL_TEMPLATES.map(tmpl => {
              const isExist = goals.some(g => g.title === tmpl.title);
              return (
                <div key={tmpl.id} className={`flex items-center justify-between p-3 rounded-lg border ${isExist ? 'border-green-500/20 bg-green-500/5' : 'border-[var(--border-subtle)] bg-[var(--bg-body)]'} transition-all`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[var(--accent)]">{renderTemplateIcon(tmpl.icon)}</span>
                    <div>
                      <p className="text-xs font-medium text-[var(--text-primary)]">{tmpl.title}</p>
                      <p className="text-[9px] text-[var(--text-secondary)]">{tmpl.duration}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleImportTemplate(tmpl)}
                    disabled={isExist}
                    className={`px-2.5 py-1 text-[10px] rounded-lg transition-all ${
                      isExist ? 'bg-green-500/10 text-green-500 cursor-default' : 'bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20'
                    }`}
                  >
                    {isExist ? '已添加' : '导入'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
