import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Sliders, 
  Settings2, Check, Clock, Sparkles, Volume, Edit3, X, Bell
} from 'lucide-react';
import { Task, AppSettings } from '../types';

interface FocusTabProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  focusTaskTitle: string;
  setFocusTaskTitle: (title: string) => void;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export default function FocusTab({
  tasks,
  setTasks,
  focusTaskTitle,
  setFocusTaskTitle,
  settings,
  setSettings
}: FocusTabProps) {
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Pomodoro timer durations (minutes)
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);
  const [currentSessionType, setCurrentSessionType] = useState<'work' | 'break'>('work');

  // Timer countdown values (seconds)
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [stopwatchTime, setStopwatchTime] = useState(0);

  // Sound selection
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'library' | 'music'>('none');
  const [isEditingDurations, setIsEditingDurations] = useState(false);

  // Audio synthesis references (Web Audio API)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const synthIntervalRef = useRef<any>(null);

  // Reset timer if session duration changes
  useEffect(() => {
    if (timerMode === 'pomodoro' && !isPlaying) {
      setTimeLeft((currentSessionType === 'work' ? workDuration : shortBreak) * 60);
    }
  }, [workDuration, shortBreak, currentSessionType, timerMode]);

  // Main interval loop
  useEffect(() => {
    let interval: any = null;

    if (isPlaying) {
      interval = setInterval(() => {
        if (timerMode === 'pomodoro') {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsPlaying(false);
              handleSessionComplete();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchTime(prev => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isPlaying, timerMode]);

  // Audio synthesizer logic triggered when sound and state changes
  useEffect(() => {
    if (isPlaying && activeSound !== 'none') {
      startAmbientAudio();
    } else {
      stopAmbientAudio();
    }
    return () => stopAmbientAudio();
  }, [isPlaying, activeSound, settings.whiteNoiseVolume]);

  // Format seconds to MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Switch preset times
  const applySessionPreset = (type: 'work' | 'break') => {
    setIsPlaying(false);
    setCurrentSessionType(type);
    setTimeLeft((type === 'work' ? workDuration : shortBreak) * 60);
  };

  // Triggers when Pomodoro session completes
  const handleSessionComplete = () => {
    // Play sound notification
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      // Beautiful "Zen Bell" frequency drop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(130.81, audioCtx.currentTime + 1.5); // C3
      
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 2.0);
    } catch (e) {
      console.log('Audio notification fallback');
    }

    // Allocate learning time to current task
    if (currentSessionType === 'work' && focusTaskTitle) {
      setTasks(prev => prev.map(t => {
        if (t.title === focusTaskTitle) {
          return { ...t, durationMinutes: (t.durationMinutes || 0) + workDuration };
        }
        return t;
      }));
    }

    // Auto toggle to break/work with high-end state modal instead of alert
    if (currentSessionType === 'work') {
      setToastMessage(`⏱️ 专注时段已结束！干得漂亮。建议放松休息 ${shortBreak} 分钟。`);
      applySessionPreset('break');
    } else {
      setToastMessage(`📚 休息时段已结束！准备好开启新一轮高质量学习了。`);
      applySessionPreset('work');
    }
  };

  // Synthesize custom white noise for Rain or organic synth pads
  const startAmbientAudio = () => {
    try {
      stopAmbientAudio();

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      const volumeMultiplier = settings.whiteNoiseVolume / 100;
      const masterGain = ctx.createGain();
      masterGain.gain.value = volumeMultiplier * 0.45; // Soft ceiling limit
      masterGain.connect(ctx.destination);

      if (activeSound === 'rain') {
        // Synthesize authentic falling rain sound via filtered White Noise
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Apply low-pass filter to make it sound like rain
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 450; // Warm cozy rain frequency cutoff

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();
        noiseNodeRef.current = whiteNoise;

      } else if (activeSound === 'music') {
        // Synthesize relaxing organic chord progression loops
        const synthNotes = [110.0, 164.81, 220.0, 293.66, 329.63]; // Relaxing drone notes A2, E3, A3, D4, E4
        const oscillators: OscillatorNode[] = [];

        synthNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
          const oscGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          // Micro-detuning for lush warm chorus effect
          osc.detune.value = (Math.random() * 10) - 5; 
          
          oscGain.gain.value = 0.05 + Math.random() * 0.04;
          
          if (panner) {
            panner.pan.value = (idx / synthNotes.length) * 2 - 1; // Spatial stereo spread
            osc.connect(panner);
            panner.connect(oscGain);
          } else {
            osc.connect(oscGain);
          }

          oscGain.connect(masterGain);
          osc.start();
          oscillators.push(osc);
        });

        // Slow modulation effect to simulate breathing waves
        let modDirection = 1;
        let modValue = 0.5;
        synthIntervalRef.current = setInterval(() => {
          modValue += 0.05 * modDirection;
          if (modValue >= 0.9) modDirection = -1;
          if (modValue <= 0.3) modDirection = 1;
          masterGain.gain.setValueAtTime(modValue * volumeMultiplier * 0.45, ctx.currentTime);
        }, 300);

        // Save node reference for stopping later
        noiseNodeRef.current = {
          disconnect: () => {
            oscillators.forEach(osc => {
              try { osc.stop(); osc.disconnect(); } catch (e) {}
            });
            clearInterval(synthIntervalRef.current);
          }
        } as any;

      } else if (activeSound === 'library') {
        // Library simulation: Synthesize deep binaural focused hums (40Hz deep learning wave)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.value = 100; // Carrier wave Left ear
        
        osc2.type = 'sine';
        osc2.frequency.value = 140; // Binaural 40Hz delta/beta shift Right ear

        const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        gain1.gain.value = 0.15;
        gain2.gain.value = 0.15;

        if (panner1 && panner2) {
          panner1.pan.value = -1;
          panner2.pan.value = 1;
          osc1.connect(panner1).connect(gain1).connect(masterGain);
          osc2.connect(panner2).connect(gain2).connect(masterGain);
        } else {
          osc1.connect(gain1).connect(masterGain);
          osc2.connect(gain2).connect(masterGain);
        }

        osc1.start();
        osc2.start();

        noiseNodeRef.current = {
          disconnect: () => {
            try { osc1.stop(); osc2.stop(); osc1.disconnect(); osc2.disconnect(); } catch (e) {}
          }
        } as any;
      }

    } catch (e) {
      console.log('Synthesizer audio block triggered:', e);
    }
  };

  const stopAmbientAudio = () => {
    try {
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (synthIntervalRef.current) {
        clearInterval(synthIntervalRef.current);
        synthIntervalRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (err) {
      console.log('Audio stop fallback');
    }
  };

  // Toggle play pause state
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Reset timer countdown
  const handleResetTimer = () => {
    setIsPlaying(false);
    stopAmbientAudio();
    if (timerMode === 'pomodoro') {
      setTimeLeft((currentSessionType === 'work' ? workDuration : shortBreak) * 60);
    } else {
      setStopwatchTime(0);
    }
  };

  // Calculate Pomodoro ring progress percent
  const totalPresetSeconds = (currentSessionType === 'work' ? workDuration : shortBreak) * 60;
  const progressPercent = timerMode === 'pomodoro' 
    ? (timeLeft / totalPresetSeconds) * 100
    : (stopwatchTime % 3600) / 36; // Arbitrary stopwatch indicator

  return (
    <div className="space-y-7 pb-20 selection:bg-[var(--accent)]/30 selection:text-white">
      {/* Custom Popup Toast instead of Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 left-4 right-4 z-50 p-4 bg-[var(--bg-card)] border border-[#C7A96F]/40 rounded-xl shadow-2xl flex items-start gap-3 backdrop-blur-md max-w-md mx-auto"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 mt-0.5">
              <Bell size={14} className="animate-bounce" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-serif font-semibold text-[var(--text-primary)] tracking-wide">Flow Alert / 系统提醒</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{toastMessage}</p>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-[var(--text-secondary)] hover:text-white p-1 rounded-md hover:bg-[var(--accent-soft)] transition-all"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Selector */}
      <div className="flex justify-center">
        <div className="bg-[var(--bg-card)] p-0.5 rounded-md border border-[var(--border-subtle)] w-full max-w-xs flex">
          <button 
            onClick={() => {
              setIsPlaying(false);
              setTimerMode('pomodoro');
            }}
            className={`flex-1 py-1.5 text-[11px] font-medium tracking-wide rounded-md transition-all ${timerMode === 'pomodoro' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            番茄钟
          </button>
          <button 
            onClick={() => {
              setIsPlaying(false);
              setTimerMode('stopwatch');
            }}
            className={`flex-1 py-1.5 text-[11px] font-medium tracking-wide rounded-md transition-all ${timerMode === 'stopwatch' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            自由计时
          </button>
        </div>
      </div>

      {/* Interactive Floating Timer Deck */}
      <div className="relative flex flex-col items-center justify-center py-4">
        
        {/* Soft Background Radial Light */}
        <div className={`absolute -z-10 w-64 h-64 rounded-full blur-3xl opacity-10 transition-all duration-1000 ${
          isPlaying ? (currentSessionType === 'work' ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]') : 'bg-slate-800'
        }`}></div>

        {/* Circular SVG Progress Board */}
        <div className="relative w-60 h-60 md:w-64 md:h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Dark background ring */}
            <circle 
              className="text-[var(--bg-card)] stroke-white/5" 
              cx="50%" 
              cy="50%" 
              r="44%" 
              fill="transparent" 
              strokeWidth="2" 
            />
            {/* Bright interactive progress arc */}
            <motion.circle 
              className={currentSessionType === 'work' ? 'text-[var(--accent)]' : 'text-[var(--accent)]'}
              cx="50%" 
              cy="50%" 
              r="44%" 
              fill="transparent" 
              stroke="currentColor" 
              strokeWidth="3.5" 
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}%`}
              animate={{ 
                strokeDashoffset: `${2 * Math.PI * 44 * (1 - progressPercent / 100)}%`
              }}
              transition={{ ease: 'linear' }}
            />
          </svg>

          {/* Time text inner overlay */}
          <div className="absolute flex flex-col items-center select-none text-center">
            <span className="text-4xl md:text-5xl font-light tracking-tight text-[var(--text-primary)] font-mono">
              {timerMode === 'pomodoro' ? formatTime(timeLeft) : formatTime(stopwatchTime)}
            </span>
            
            <div className={`mt-3 flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[9px] font-mono font-bold tracking-widest uppercase border ${
              isPlaying 
                ? (currentSessionType === 'work' ? 'bg-[var(--accent)]/10 border-[#C7A96F]/20 text-[var(--accent)]' : 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]')
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
            }`}>
              <span className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-current animate-pulse' : 'bg-slate-600'}`} />
              <span>{isPlaying ? (currentSessionType === 'work' ? 'FOCUSING' : 'RESTING') : 'PAUSED'}</span>
            </div>
          </div>
        </div>

        {/* Active Focus Task label Context */}
        <div className="mt-6 text-center space-y-2 w-full max-w-sm px-4">
          <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)] font-bold font-mono">Active Target / 当前专注目标</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <h2 className="text-sm font-serif font-medium text-[var(--text-primary)] truncate max-w-[200px]">
              {focusTaskTitle || '自主设定任务或课后巩固'}
            </h2>
            
            {/* Quick dropdown select task */}
            <select
              value={focusTaskTitle}
              onChange={e => setFocusTaskTitle(e.target.value)}
              className="bg-black border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] rounded px-1.5 py-1 focus:outline-none focus:border-[var(--accent)] font-mono"
            >
              <option value="">快速切换任务...</option>
              {tasks.filter(t => t.status !== 'completed').map(t => (
                <option key={t.id} value={t.title}>{t.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Control Actions Panel */}
      <div className="flex items-center justify-center gap-6 pb-2">
        {/* Reset Trigger */}
        <button 
          onClick={handleResetTimer}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-all active:scale-90"
          title="重置计时"
        >
          <RotateCcw size={14} />
        </button>

        {/* Central Play/Pause button */}
        <button 
          onClick={handlePlayPause}
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-90 transition-all duration-300 ${
            isPlaying 
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)]' 
              : 'bg-[var(--accent)] text-black'
          }`}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Configurations Toggle */}
        <button 
          onClick={() => setIsEditingDurations(!isEditingDurations)}
          className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all active:scale-90 ${
            isEditingDurations ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[#C7A96F]/30' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]'
          }`}
          title="时段设置"
        >
          <Settings2 size={14} />
        </button>
      </div>

      {/* Configurations panel slide overlay */}
      <AnimatePresence>
        {isEditingDurations && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--bg-card)]/60 border border-[var(--border-subtle)] rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-serif text-[var(--text-primary)] flex items-center gap-1.5">
                  <Sliders size={12} className="text-[var(--accent)]" /> 设定专注方案 (分钟)
                </span>
                <button 
                  onClick={() => setIsEditingDurations(false)}
                  className="text-[10px] text-[var(--accent)] font-bold hover:underline"
                >
                  应用
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-[var(--input-bg)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                  <span className="text-[8px] text-[var(--text-secondary)] font-bold uppercase block mb-1">FOCUS</span>
                  <input 
                    type="number"
                    min="1"
                    max="180"
                    value={workDuration}
                    onChange={e => setWorkDuration(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-black border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-xs text-center text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="bg-[var(--input-bg)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                  <span className="text-[8px] text-[var(--text-secondary)] font-bold uppercase block mb-1">SHORT REC</span>
                  <input 
                    type="number"
                    min="1"
                    max="60"
                    value={shortBreak}
                    onChange={e => setShortBreak(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-black border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-xs text-center text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div className="bg-[var(--input-bg)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                  <span className="text-[8px] text-[var(--text-secondary)] font-bold uppercase block mb-1">LONG REC</span>
                  <input 
                    type="number"
                    min="1"
                    max="120"
                    value={longBreak}
                    onChange={e => setLongBreak(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-black border border-[var(--border-subtle)] rounded px-1.5 py-0.5 text-xs text-center text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Environment sound block */}
      <section className="bg-[var(--bg-card)]/40 border border-[var(--border-subtle)] rounded-xl p-4 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-serif text-[var(--text-primary)] flex items-center gap-1.5">
            <Volume2 size={13} className="text-[var(--accent)]" /> 浸润式环境白噪音
          </span>
          <span className="text-[9px] text-[var(--text-secondary)] font-mono uppercase">Volume: {settings.whiteNoiseVolume}%</span>
        </div>

        {/* Sound Selection Toggles */}
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => setActiveSound('none')}
            className={`py-3 rounded-lg text-center border text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              activeSound === 'none' 
                ? 'bg-white/5 border-[var(--border-subtle)] text-white' 
                : 'bg-black border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <VolumeX size={13} />
            <span className="text-[8px] uppercase tracking-wider font-mono">静音</span>
          </button>

          <button 
            onClick={() => setActiveSound('rain')}
            className={`py-3 rounded-lg text-center border text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              activeSound === 'rain' 
                ? 'bg-[var(--accent)]/10 border-[#C7A96F]/20 text-[var(--accent)]' 
                : 'bg-black border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-xs">🌧️</span>
            <span className="text-[8px] uppercase tracking-wider font-mono">雨声</span>
          </button>

          <button 
            onClick={() => setActiveSound('library')}
            className={`py-3 rounded-lg text-center border text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              activeSound === 'library' 
                ? 'bg-[var(--accent)]/10 border-[#C7A96F]/20 text-[var(--accent)]' 
                : 'bg-black border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-xs">🏛️</span>
            <span className="text-[8px] uppercase tracking-wider font-mono">书页</span>
          </button>

          <button 
            onClick={() => setActiveSound('music')}
            className={`py-3 rounded-lg text-center border text-[11px] font-medium flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              activeSound === 'music' 
                ? 'bg-[var(--accent)]/10 border-[#C7A96F]/20 text-[var(--accent)]' 
                : 'bg-black border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span className="text-xs">🎶</span>
            <span className="text-[8px] uppercase tracking-wider font-mono">和弦</span>
          </button>
        </div>

        {/* Volume Slider control */}
        <div className="flex items-center gap-3 pt-1">
          <Volume size={12} className="text-[var(--text-secondary)]" />
          <input 
            type="range"
            min="0"
            max="100"
            value={settings.whiteNoiseVolume}
            onChange={e => setSettings(prev => ({ ...prev, whiteNoiseVolume: parseInt(e.target.value) || 0 }))}
            className="flex-1 h-1 bg-black rounded-lg appearance-none cursor-pointer accent-[var(--accent)] focus:outline-none"
          />
        </div>
      </section>

      {/* Preset time slots preview */}
      <section className="bg-[var(--bg-card)]/40 border border-[var(--border-subtle)] rounded-xl p-4 shadow-lg space-y-3.5">
        <h4 className="text-[9px] uppercase tracking-[0.25em] text-[var(--text-secondary)] font-bold font-mono">时段快捷选择</h4>
        <div className="space-y-2">
          <div 
            onClick={() => applySessionPreset('work')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-white/[0.02] transition-all ${
              currentSessionType === 'work' ? 'border-[#C7A96F] bg-[var(--accent)]/5' : 'border-[var(--border-subtle)] bg-[var(--input-bg)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-xs text-[var(--text-primary)]">深度工作专注</span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--accent)]">{workDuration}M</span>
          </div>

          <div 
            onClick={() => applySessionPreset('break')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer hover:bg-white/[0.02] transition-all ${
              currentSessionType === 'break' ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border-subtle)] bg-[var(--input-bg)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span className="text-xs text-[var(--text-primary)]">舒缓放松短休</span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--accent)]">{shortBreak}M</span>
          </div>
        </div>
      </section>
    </div>
  );
}
