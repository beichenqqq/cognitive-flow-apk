import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Plus, BookOpen, AlertTriangle, Image as ImageIcon, 
  ExternalLink, MoreVertical, X, Check, Trash2, Tag, BookMarked
} from 'lucide-react';
import { Note, AppSettings } from '../types';

interface NotesTabProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  settings: AppSettings;
}

export default function NotesTab({
  notes,
  setNotes,
  settings
}: NotesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeImageOverlay, setActiveImageOverlay] = useState<string | null>(null);
  
  // Create Note Form states
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('数学');
  const [newNoteType, setNewNoteType] = useState<'important' | 'mistake' | 'normal'>('normal');
  const [newNoteImageUrl, setNewNoteImageUrl] = useState('');

  // Categories list
  const CATEGORIES = ['全部', '数学', '英语', '物理', '其他'];

  // Filtering notes
  const filteredNotes = notes.filter(note => {
    const matchesCategory = selectedCategory === '全部' || note.category === selectedCategory;
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Create custom Note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: newNoteTitle,
      content: newNoteContent,
      category: newNoteCategory,
      type: newNoteType,
      timeText: '刚刚',
      imageUrl: newNoteImageUrl.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    setNotes(prev => [newNote, ...prev]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteImageUrl('');
    setNewNoteType('normal');
    setIsAddingNote(false);
  };

  // Delete note
  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6 pb-20 selection:bg-[var(--accent)]/30 selection:text-white">
      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-[var(--accent)] transition-colors" size={15} />
        <input 
          type="text"
          placeholder="搜索笔记、错题或关键词 "
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-black border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] outline-none transition-all placeholder:text-[var(--text-secondary)] text-xs text-[var(--text-primary)]"
        />
      </div>

      {/* Category Scrolling Tabs */}
      <nav className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide whitespace-nowrap transition-all border ${
              selectedCategory === cat 
                ? 'bg-[var(--accent)]/10 border-[#C7A96F]/30 text-[var(--accent)] shadow-sm' 
                : 'bg-[var(--bg-card)] hover:bg-[var(--bg-card)]/80 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Notes Container List */}
      <section className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className={`bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] rounded-xl p-5 shadow-2xl relative overflow-hidden group border-l-2 backdrop-blur-md ${
                note.type === 'important' 
                  ? 'border-l-[var(--accent)]' 
                  : note.type === 'mistake' 
                  ? 'border-l-[#D4A373]' 
                  : 'border-l-slate-700'
              }`}
            >
              {/* Note Header Info */}
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold tracking-wider bg-black border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                    {note.category}
                  </span>
                  {note.type === 'important' && (
                    <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold tracking-wider bg-[var(--accent)]/10 text-[var(--accent)] border border-[#C7A96F]/20">
                      重要
                    </span>
                  )}
                  {note.type === 'mistake' && (
                    <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold tracking-wider bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                      错题
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] font-mono">
                  <span>{note.timeText}</span>
                  <button 
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="text-[var(--text-secondary)] hover:text-[var(--danger-text)] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="删除笔记"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              {/* Title & Body content */}
              <h3 className="text-sm font-serif font-semibold tracking-wide text-[var(--text-primary)] mb-2">{note.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed break-words whitespace-pre-wrap font-serif italic">
                {note.content}
              </p>

              {/* Note attachment Image mockup */}
              {note.imageUrl && (
                <div 
                  onClick={() => setActiveImageOverlay(note.imageUrl!)}
                  className="mt-4 rounded-lg overflow-hidden relative max-h-36 group cursor-zoom-in border border-[var(--border-subtle)] shadow-xl"
                >
                  <img 
                    src={note.imageUrl} 
                    alt={note.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover max-h-32 opacity-80 hover:opacity-95 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors flex items-end justify-end p-2">
                    <span className="bg-[var(--overlay-bg)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-sm text-[8px] font-mono tracking-wider text-[var(--text-primary)] flex items-center gap-1">
                      <ImageIcon size={10} className="text-[var(--accent)]" /> ZOOM PREVIEW
                    </span>
                  </div>
                </div>
              )}

              {/* Footer details (Links, category) */}
              {(note.linkedTaskTitle || note.type === 'mistake') && (
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[9px] font-mono text-[var(--text-secondary)]">
                  {note.linkedTaskTitle ? (
                    <span className="text-[var(--accent)] flex items-center gap-1 hover:underline cursor-pointer">
                      <ExternalLink size={10} /> LINKED: {note.linkedTaskTitle}
                    </span>
                  ) : (
                    <span className="text-[var(--accent)] flex items-center gap-1">
                      <BookMarked size={10} /> AUTOMATIC SYNC FROM REVIEWS
                    </span>
                  )}
                  <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <MoreVertical size={11} />
                  </button>
                </div>
              )}
            </motion.div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="text-center py-12 text-[var(--text-secondary)] text-xs bg-[var(--bg-card)]/10 border border-dashed border-[var(--border-subtle)] rounded-xl">
              暂无符合条件的复习笔记或错题归纳
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Floating Action FAB button */}
      <button 
        onClick={() => setIsAddingNote(true)}
        className="fixed bottom-24 right-5 w-12 h-12 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black rounded-xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
        title="写新笔记"
      >
        <Plus size={20} />
      </button>

      {/* Add Custom Note Slide-Over Modal */}
      <AnimatePresence>
        {isAddingNote && (
          <div className="fixed inset-0 bg-[var(--overlay-bg)] flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleCreateNote}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 w-full max-w-sm space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-[var(--text-primary)]"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                <h3 className="text-sm font-serif font-bold tracking-wide text-[var(--text-primary)]">整理知识 / 写新笔记</h3>
                <button 
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="p-1 hover:bg-[var(--accent-soft)] rounded-full text-[var(--text-secondary)] hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-semibold">标签与笔记分类</label>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <select
                      value={newNoteCategory}
                      onChange={e => setNewNoteCategory(e.target.value)}
                      className="col-span-2 bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="数学">数学 (Math)</option>
                      <option value="英语">英语 (English)</option>
                      <option value="物理">物理 (Physics)</option>
                      <option value="其他">其他 (Others)</option>
                    </select>
                    
                    <select
                      value={newNoteType}
                      onChange={e => setNewNoteType(e.target.value as any)}
                      className="bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-1.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-bold text-[var(--accent)]"
                    >
                      <option value="normal">普通</option>
                      <option value="important" className="text-[var(--accent)]">重要</option>
                      <option value="mistake" className="text-[var(--accent)]">错题</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-semibold">笔记标题</label>
                  <input 
                    type="text"
                    required
                    placeholder="标题：例如链式偏导公式"
                    value={newNoteTitle}
                    onChange={e => setNewNoteTitle(e.target.value)}
                    className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-semibold">详细整理内容</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="记录公式细节、难点错因或经典解题思想..."
                    value={newNoteContent}
                    onChange={e => setNewNoteContent(e.target.value)}
                    className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-[var(--text-secondary)] mb-1 font-semibold">插图 / 手写板链接 (可选URL)</label>
                  <input 
                    type="text"
                    placeholder="可粘入任意图片 URL 网址"
                    value={newNoteImageUrl}
                    onChange={e => setNewNoteImageUrl(e.target.value)}
                    className="w-full bg-[var(--bg-body)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <p className="text-[8px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                    留空则不附带图片。可以黏贴网络上复制的内容，或者个人手写板笔记截图生成的图床链接。
                  </p>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[var(--accent)] text-black font-semibold text-xs rounded-md shadow-md hover:bg-[var(--accent)]/90 active:scale-95 transition-all"
              >
                保存并归档笔记
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox attachment preview popup overlay */}
      <AnimatePresence>
        {activeImageOverlay && (
          <div 
            onClick={() => setActiveImageOverlay(null)}
            className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-[60] cursor-zoom-out backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-xl max-h-[85vh] overflow-hidden rounded-xl bg-black border border-[var(--border-subtle)] shadow-2xl relative"
            >
              <button 
                onClick={() => setActiveImageOverlay(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/95 rounded-full text-[var(--text-primary)] hover:text-white border border-[var(--border-subtle)]"
              >
                <X size={15} />
              </button>
              <img 
                src={activeImageOverlay} 
                alt="Full attachment view" 
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[80vh]"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
