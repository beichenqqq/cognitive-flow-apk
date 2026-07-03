import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, Sliders, Volume2, HelpCircle, 
  Trash2, ShieldAlert, Award, ChevronRight, Check, Sparkles, X, Download, UploadCloud, RefreshCw
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onResetAllData: () => void;
  onClose?: () => void;
}

export default function SettingsPanel({
  settings,
  setSettings,
  onResetAllData,
  onClose
}: SettingsPanelProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cacheSize, setCacheSize] = useState('124 MB');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle Dark mode directly on document element
  const handleToggleDarkMode = () => {
    const newVal = !settings.darkMode;
    setSettings(prev => ({ ...prev, darkMode: newVal }));
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    showToast(newVal ? '深色高对比度模式已启用' : '浅色极简模式已启用');
  };

  // Change accent colors via data-accent attribute
  const handleSelectAccent = (color: 'blue' | 'green' | 'amber') => {
    setSettings(prev => ({ ...prev, accentColor: color }));
    document.documentElement.setAttribute('data-accent', color);
    showToast(`主题色已切换为：${color === 'green' ? '宁静鼠尾草' : color === 'amber' ? '暖阳琥珀色' : '御廷金色'}`);
  };

  // Simulate cache cleaning
  const handleClearCache = () => {
    setCacheSize('0 KB');
    showToast('缓存及系统本地临时文件清理成功！已释放 124 MB 空间');
  };

  // Synchronize simulation
  const handleCloudSync = () => {
    showToast('正在进行云端双向同步，打卡与学习笔记数据已成功安全备份');
  };

  return (
    <div className="space-y-6 pb-24 selection:bg-[var(--accent-soft)] selection:text-[var(--text-primary)]">
      {/* Settings Header close button if rendered inside a modal */}
      {onClose && (
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
          <span className="text-xs font-serif font-bold tracking-wide text-[var(--text-secondary)]">系统设置</span>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[var(--accent-soft)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Profile summary banner */}
      <section className="flex flex-col items-center py-5 bg-[var(--bg-card)]/40 border border-[var(--border-subtle)] rounded-xl relative overflow-hidden text-center p-4 backdrop-blur-md">
        <div className="absolute right-3 top-3 bg-[var(--accent-soft)] text-[var(--accent)] px-2.5 py-0.5 rounded-sm text-[8px] font-mono font-bold flex items-center gap-1 border border-[var(--accent-border)] animate-pulse">
          <Award size={10} /> v1.2.0
        </div>

        <div className="w-14 h-14 rounded-full border border-[var(--border-subtle)] shadow-2xl overflow-hidden bg-black mb-3 relative">
          <img 
            alt="User Avatar" 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover grayscale"
          />
        </div>

        <h3 className="text-sm font-serif font-semibold text-[var(--text-primary)] flex items-center gap-1.5 justify-center">
          学习者 <span className="text-[var(--accent)] text-xs">✦</span>
        </h3>
        <p className="text-[9px] uppercase font-mono tracking-wider text-[var(--text-secondary)] mt-1">
          认知流专业版 —— 始于 2026
        </p>
      </section>

      {/* Appearance Group */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-1.5 px-1">
          <Palette size={13} className="text-[var(--accent)]" />
          <h4 className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">外观与色调</h4>
        </div>

        <div className="bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Dark Mode toggle */}
          <div 
            onClick={handleToggleDarkMode}
            className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)] hover:bg-white/[0.01] transition-all cursor-pointer select-none"
          >
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">深色防疲劳模式</p>
              <p className="text-[10px] text-[var(--text-secondary)]">启用高对比度低反光的奢华黑背景</p>
            </div>
            <div className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 ${settings.darkMode ? 'bg-[var(--accent)]' : 'bg-black border border-[var(--border-subtle)]'}`}>
              <motion.div 
                className={`w-4.5 h-4.5 rounded-full shadow ${settings.darkMode ? 'bg-black' : 'bg-slate-600'}`}
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={{ x: settings.darkMode ? 18 : 0 }}
              />
            </div>
          </div>

          {/* Accent picker */}
          <div className="p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">系统雅致主色</p>
              <p className="text-[10px] text-[var(--text-secondary)] font-serif italic">
                当前: {settings.accentColor === 'green' ? '宁静鼠尾草' : settings.accentColor === 'amber' ? '暖阳琥珀色' : '御廷金色'}
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleSelectAccent('blue')}
                className={`w-5 h-5 rounded-full bg-[var(--accent)] border flex items-center justify-center transition-transform active:scale-90 ${
                  settings.accentColor === 'blue' ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
                title="御廷金色"
              />
              <button 
                onClick={() => handleSelectAccent('green')}
                className={`w-5 h-5 rounded-full bg-[var(--accent)] border flex items-center justify-center transition-transform active:scale-90 ${
                  settings.accentColor === 'green' ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
                title="宁静鼠尾草"
              />
              <button 
                onClick={() => handleSelectAccent('amber')}
                className={`w-5 h-5 rounded-full bg-[var(--accent)] border flex items-center justify-center transition-transform active:scale-90 ${
                  settings.accentColor === 'amber' ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
                title="暖阳琥珀色"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Group */}
      <section className="space-y-2.5">
        <div className="flex items-center gap-1.5 px-1">
          <Volume2 size={13} className="text-[var(--accent)]" />
          <h4 className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest">声音与提醒</h4>
        </div>
        
        <div className="bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Daily Reminder */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">每日学习打卡提醒</p>
              <p className="text-[10px] text-[var(--text-secondary)]">每日定时提醒你记录今日学习进度</p>
            </div>
            <div 
              onClick={() => setSettings(prev => ({ ...prev, dailyReminder: !prev.dailyReminder }))}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${settings.dailyReminder ? 'bg-[var(--accent)]' : 'bg-black border border-[var(--border-subtle)]'}`}
            >
              <motion.div 
                className={`w-4.5 h-4.5 rounded-full shadow ${settings.dailyReminder ? 'bg-black' : 'bg-slate-600'}`}
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={{ x: settings.dailyReminder ? 18 : 0 }}
              />
            </div>
          </div>

          {/* Reminder Time */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">提醒时间</p>
              <p className="text-[10px] text-[var(--text-secondary)]">设置在何时提醒你学习</p>
            </div>
            <select 
              value={settings.reminderTime}
              onChange={e => setSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
              className="bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="08:00">08:00</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="12:00">12:00</option>
              <option value="14:00">14:00</option>
              <option value="18:00">18:00</option>
              <option value="20:00">20:00</option>
            </select>
          </div>

          {/* Timer End Sound */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">专注结束音效</p>
              <p className="text-[10px] text-[var(--text-secondary)]">番茄钟完成时播放的提示音</p>
            </div>
            <span className="text-xs text-[var(--text-primary)] font-serif italic">{settings.timerEndSound || '禅意水晶'}</span>
          </div>

          {/* Advance Reminder */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">提前提醒分钟数</p>
              <p className="text-[10px] text-[var(--text-secondary)]">在任务开始前多久提醒你</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSettings(prev => ({ ...prev, advanceReminderMinutes: Math.max(0, prev.advanceReminderMinutes - 5) }))}
                className="px-2 py-0.5 bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] text-xs"
              >-</button>
              <p className="text-base font-serif font-medium text-[var(--text-primary)]">{settings.advanceReminderMinutes} <span className="text-[10px] font-sans text-[var(--text-secondary)]">分钟</span></p>
              <button 
                onClick={() => setSettings(prev => ({ ...prev, advanceReminderMinutes: Math.min(60, prev.advanceReminderMinutes + 5) }))}
                className="px-2 py-0.5 bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded text-[var(--text-primary)] text-xs"
              >+</button>
            </div>
          </div>

          {/* Click Sound Effect */}
          <div className="flex items-center justify-between p-4">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[var(--text-primary)]">点击音效</p>
              <p className="text-[10px] text-[var(--text-secondary)]">操作按钮时播放微弱的反馈音</p>
            </div>
            <div 
              onClick={() => setSettings(prev => ({ ...prev, clickSoundEffect: !prev.clickSoundEffect }))}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-300 cursor-pointer ${settings.clickSoundEffect ? 'bg-[var(--accent)]' : 'bg-black border border-[var(--border-subtle)]'}`}
            >
              <motion.div 
                className={`w-4.5 h-4.5 rounded-full shadow ${settings.clickSoundEffect ? 'bg-black' : 'bg-slate-600'}`}
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                animate={{ x: settings.clickSoundEffect ? 18 : 0 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Data Management Actions Group */}
      <section className="space-y-2.5">
        <h4 className="text-[9px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-widest px-1">备份与安全</h4>
        
        <div className="bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div 
            onClick={handleCloudSync}
            className="flex items-center justify-between p-3.5 border-b border-[var(--border-subtle)] hover:bg-white/[0.01] transition-all cursor-pointer select-none text-xs"
          >
            <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
              <RefreshCw size={13} className="text-[var(--accent)] animate-spin" style={{ animationDuration: '6s' }} />
              <span>同步最新备份</span>
            </div>
            <span className="text-[10px] text-[var(--accent)] font-mono flex items-center gap-0.5">
              运行中 <ChevronRight size={12} />
            </span>
          </div>

          <div 
            onClick={() => showToast('已生成数据本地备份压缩文件 app_data_data_backup.zip')}
            className="flex items-center justify-between p-3.5 border-b border-[var(--border-subtle)] hover:bg-white/[0.01] transition-all cursor-pointer select-none text-xs"
          >
            <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
              <Download size={13} className="text-[var(--text-secondary)]" />
              <span>导出归档备份 (.zip)</span>
            </div>
            <ChevronRight size={12} className="text-[var(--text-secondary)]" />
          </div>

          <div 
            onClick={handleClearCache}
            className="flex items-center justify-between p-3.5 hover:bg-white/[0.01] transition-all cursor-pointer select-none text-xs"
          >
            <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
              <Trash2 size={13} className="text-[var(--danger-text)]" />
              <span className="text-[var(--danger-text)]">清理临时运行缓存</span>
            </div>
            <span className="text-[10px] text-[var(--text-secondary)] font-mono">{cacheSize}</span>
          </div>
        </div>
      </section>

      {/* Reset & Wipe Section */}
      <section className="pt-2">
        <button 
          onClick={() => {
            if(confirm('确定要抹除所有本地记录与自定义设置并恢复为最初数据吗？此操作不可撤销！')) {
              onResetAllData();
              showToast('认知流动工作区已成功初始化并恢复出厂预置');
            }
          }}
          className="w-full py-2.5 bg-[var(--danger-text)]/10 hover:bg-[var(--danger-text)]/25 text-[var(--danger-text)] border border-[var(--danger-text)]/20 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer"
        >
          抹除账户并重置默认数据
        </button>
      </section>

      {/* Footer Support Info */}
      <footer className="pt-6 border-t border-[var(--border-subtle)] text-center space-y-3 pb-8">
        <div className="flex justify-center gap-5 text-[var(--accent)] font-semibold text-xs font-serif">
          <a href="#" onClick={(e) => { e.preventDefault(); showToast('隐私声明已加载'); }} className="hover:underline">隐私政策</a>
          <a href="#" onClick={(e) => { e.preventDefault(); showToast('服务条款已加载'); }} className="hover:underline">服务条款</a>
          <a href="#" onClick={(e) => { e.preventDefault(); showToast('帮助反馈已发送'); }} className="hover:underline">帮助中心</a>
        </div>
        <div className="text-[9px] font-mono text-[var(--text-secondary)] leading-normal">
          <p>认知流 —— 版本 1.2.0</p>
          <p className="mt-0.5">© 2026 认知流公司 · 为学者打造</p>
        </div>
      </footer>

      {/* Micro-interaction Alert Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 bg-[var(--bg-card)] border border-[var(--accent-border)] p-3.5 rounded-xl shadow-2xl z-50 text-xs text-[var(--text-primary)] flex items-center gap-2 max-w-sm mx-auto"
          >
            <Sparkles size={13} className="text-[var(--accent)] animate-pulse flex-shrink-0" />
            <span className="font-serif italic text-[var(--text-primary)]">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
