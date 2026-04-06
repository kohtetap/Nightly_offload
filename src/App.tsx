/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  History, 
  Wind, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2,
  Calendar,
  Tag as TagIcon,
  Moon,
  Sun,
  Coffee,
  Heart
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from './lib/utils';
import { OffloadEntry, Step } from './types';

const STRESS_TAGS = [
  'PhD', 'Career', 'Relationship', 'Health', 'Finance', 
  'Family', 'Social', 'Personal Growth', 'Environment', 'Unknown'
];

// Softer colors for night viewing
const COLORS = {
  bg: 'bg-[#0a0a0c]',
  card: 'bg-[#121214]',
  border: 'border-[#1e1e22]',
  text: 'text-slate-400',
  textMuted: 'text-slate-500',
  textBright: 'text-slate-300',
  accent: 'text-indigo-400/80',
  accentBg: 'bg-indigo-500/10',
  button: 'bg-indigo-900/40',
  buttonHover: 'hover:bg-indigo-900/60',
  buttonText: 'text-indigo-200',
};

export default function App() {
  const [step, setStep] = useState<Step>('name');
  const [history, setHistory] = useState<OffloadEntry[]>([]);
  
  // Current entry state
  const [thought, setThought] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [stressLevel, setStressLevel] = useState(5);

  // Time check
  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 12;

  // Load history from local storage
  useEffect(() => {
    const savedHistory = localStorage.getItem('offload_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
        
        // Morning Check: If it's morning and we have entries, show morning view
        if (isMorning && parsed.length > 0) {
          setStep('morning');
        }
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history
  const saveEntry = () => {
    const newEntry: OffloadEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      thought,
      tags: selectedTags,
      stressLevel,
    };
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('offload_history', JSON.stringify(updatedHistory));
    
    // Reset and go to complete
    setThought('');
    setSelectedTags([]);
    setStressLevel(5);
    setStep('complete');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className={cn("min-h-screen font-sans selection:bg-indigo-500/20", COLORS.bg, COLORS.text)}>
      {/* Navigation Header */}
      <header className={cn("fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b", COLORS.bg + "/80", COLORS.border)}>
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className={cn("text-base font-medium tracking-tight", COLORS.accent)}>Nightly Offload</h1>
          <div className="flex gap-4">
            {/* History only accessible in the morning */}
            {isMorning && (
              <button 
                onClick={() => setStep('history')}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  step === 'history' ? COLORS.accentBg + " " + COLORS.accent : "text-slate-600 hover:text-slate-400"
                )}
              >
                <History size={18} />
              </button>
            )}
            {(step === 'history' || step === 'morning') && (
              <button 
                onClick={() => setStep('name')}
                className={cn("p-2 rounded-full transition-colors shadow-lg", COLORS.button, COLORS.buttonText, COLORS.buttonHover)}
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-md mx-auto min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'morning' && (
            <MorningView 
              key="morning"
              history={history}
              onDismiss={() => setStep('name')}
            />
          )}
          {step === 'name' && (
            <StepName 
              thought={thought}
              setThought={setThought}
              onNext={() => setStep('park')}
            />
          )}
          {step === 'park' && (
            <StepPark 
              selectedTags={selectedTags}
              toggleTag={toggleTag}
              stressLevel={stressLevel}
              setStressLevel={setStressLevel}
              onBack={() => setStep('name')}
              onNext={() => setStep('breathe')}
            />
          )}
          {step === 'breathe' && (
            <StepBreathe 
              onComplete={() => { saveEntry(); }}
              onBack={() => setStep('park')}
            />
          )}
          {step === 'complete' && (
            <CompleteView 
              key="complete"
              onReset={() => setStep('name')}
            />
          )}
          {step === 'history' && (
            <HistoryView 
              history={history}
              onClear={() => {
                setHistory([]);
                localStorage.removeItem('offload_history');
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function MorningView({ 
  history, 
  onDismiss 
}: { 
  history: OffloadEntry[], 
  onDismiss: () => void 
}) {
  // Get entries from last night (or just the most recent one)
  const lastNightEntry = history[0];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="flex-1 flex flex-col"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sun className="text-amber-400/80" size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80">Good Morning</span>
        </div>
        <h2 className={cn("text-2xl font-semibold leading-tight", COLORS.textBright)}>Morning Review</h2>
        <p className={cn("mt-2 text-sm", COLORS.textMuted)}>Here is what you offloaded last night. It's a new day.</p>
      </div>

      <div className="flex-1 space-y-6">
        {lastNightEntry ? (
          <div className={cn("p-6 rounded-3xl border", COLORS.card, COLORS.border)}>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 mb-4 uppercase tracking-widest">
              <Calendar size={10} />
              {format(lastNightEntry.timestamp, 'MMMM d, h:mm a')}
            </div>
            <p className={cn("text-lg leading-relaxed italic", COLORS.textBright)}>
              "{lastNightEntry.thought}"
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {lastNightEntry.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-900/50 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-800/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("p-12 rounded-3xl border border-dashed text-center", COLORS.card, COLORS.border)}>
            <p className="text-xs text-slate-700">No entries from last night.</p>
          </div>
        )}
      </div>

      <button
        onClick={onDismiss}
        className={cn(
          "mt-8 w-full py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg",
          COLORS.button, COLORS.buttonText, COLORS.buttonHover
        )}
      >
        Start Nightly Offload <Moon size={18} className="ml-1" />
      </button>
    </motion.div>
  );
}

function CompleteView({ onReset }: { onReset: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center text-center"
    >
      <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400/60 mb-8 blur-sm absolute" />
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
      >
        <Heart className="text-indigo-400/80 mb-8" size={48} />
      </motion.div>
      
      <h2 className={cn("text-2xl font-semibold leading-tight mb-4", COLORS.textBright)}>
        You did well today.
      </h2>
      <p className={cn("text-lg italic opacity-80", COLORS.accent)}>
        Sleep is also productivity.
      </p>

      <div className="mt-16 w-full">
        <button
          onClick={onReset}
          className={cn(
            "w-full py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg",
            COLORS.button, COLORS.buttonText, COLORS.buttonHover
          )}
        >
          Rest now <Moon size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function StepName({ thought, setThought, onNext }: { thought: string, setThought: (v: string) => void, onNext: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 flex flex-col"
    >
      <div className="mb-8">
        <span className={cn("font-medium text-xs uppercase tracking-widest opacity-60", COLORS.accent)}>Step 1</span>
        <h2 className={cn("text-2xl font-semibold mt-1 leading-tight", COLORS.textBright)}>Name it.</h2>
        <p className={cn("mt-2 text-sm", COLORS.textMuted)}>What's weighing on your mind tonight? Get it out of your head.</p>
      </div>

      <textarea
        value={thought}
        onChange={(e) => setThought(e.target.value)}
        placeholder="Tonight, I'm thinking about..."
        className={cn(
          "flex-1 w-full border rounded-2xl p-6 text-base focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none placeholder:text-slate-700",
          COLORS.card, COLORS.border, COLORS.textBright
        )}
        autoFocus
      />

      <button
        disabled={!thought.trim()}
        onClick={onNext}
        className={cn(
          "mt-8 w-full py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg",
          thought.trim() ? COLORS.button + " " + COLORS.buttonText + " " + COLORS.buttonHover : "bg-slate-900/50 text-slate-700 cursor-not-allowed"
        )}
      >
        Continue to Park it <ChevronRight size={18} />
      </button>
    </motion.div>
  );
}

function StepPark({ 
  selectedTags, 
  toggleTag, 
  stressLevel, 
  setStressLevel, 
  onBack, 
  onNext 
}: { 
  selectedTags: string[], 
  toggleTag: (t: string) => void, 
  stressLevel: number, 
  setStressLevel: (v: number) => void,
  onBack: () => void,
  onNext: () => void
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex-1 flex flex-col"
    >
      <div className="mb-8">
        <span className={cn("font-medium text-xs uppercase tracking-widest opacity-60", COLORS.accent)}>Step 2</span>
        <h2 className={cn("text-2xl font-semibold mt-1 leading-tight", COLORS.textBright)}>Park it.</h2>
        <p className={cn("mt-2 text-sm", COLORS.textMuted)}>Categorize this thought and assess its weight.</p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="text-[10px] font-bold text-slate-600 mb-4 block uppercase tracking-widest">Stress Tags</label>
          <div className="flex flex-wrap gap-2">
            {STRESS_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-medium transition-all border",
                  selectedTags.includes(tag) 
                    ? "bg-indigo-900/40 border-indigo-500/30 text-indigo-200" 
                    : "bg-slate-900/30 border-slate-800/50 text-slate-600 hover:border-slate-700"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-4">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Stress Level</label>
            <span className={cn("text-xl font-semibold", COLORS.accent)}>{stressLevel}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={stressLevel}
            onChange={(e) => setStressLevel(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-900/60"
          />
          <div className="flex justify-between mt-2 text-[10px] text-slate-700 font-bold tracking-widest">
            <span>MILD</span>
            <span>INTENSE</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 flex gap-4">
        <button
          onClick={onBack}
          className={cn("flex-1 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all border", COLORS.card, COLORS.border, COLORS.textMuted, "hover:text-slate-400")}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button
          onClick={onNext}
          className={cn("flex-[2] py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg", COLORS.button, COLORS.buttonText, COLORS.buttonHover)}
        >
          Breathe <Wind size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function StepBreathe({ onComplete, onBack }: { onComplete: () => void, onBack: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase !== 'idle') {
      interval = setInterval(() => {
        setTimer(t => {
          if (phase === 'inhale' && t >= 4) {
            setPhase('hold');
            return 0;
          }
          if (phase === 'hold' && t >= 7) {
            setPhase('exhale');
            return 0;
          }
          if (phase === 'exhale' && t >= 8) {
            setCycles(c => c + 1);
            setPhase('inhale');
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phase]);

  const start = () => {
    setPhase('inhale');
    setTimer(0);
    setCycles(0);
  };

  const getInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Inhale deeply...';
      case 'hold': return 'Hold your breath...';
      case 'exhale': return 'Exhale slowly...';
      default: return 'Ready to breathe?';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="flex-1 flex flex-col items-center justify-center text-center"
    >
      <div className="mb-12">
        <span className={cn("font-medium text-xs uppercase tracking-widest opacity-60", COLORS.accent)}>Step 3</span>
        <h2 className={cn("text-2xl font-semibold mt-1 leading-tight", COLORS.textBright)}>Breathe.</h2>
        <p className={cn("mt-2 text-sm max-w-[240px] mx-auto", COLORS.textMuted)}>The 4-7-8 technique helps calm the nervous system.</p>
      </div>

      <div className="relative flex items-center justify-center w-56 h-56 mb-12">
        {/* Outer Glow - very subtle */}
        <motion.div 
          animate={{ 
            scale: phase === 'inhale' ? 1.4 : phase === 'hold' ? 1.4 : 1,
            opacity: phase === 'idle' ? 0.05 : 0.15
          }}
          transition={{ duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl"
        />
        
        {/* Breathing Circle */}
        <motion.div 
          animate={{ 
            scale: phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 0.8,
          }}
          transition={{ duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0.5, ease: "easeInOut" }}
          className={cn("w-40 h-40 rounded-full border border-indigo-500/20 flex items-center justify-center backdrop-blur-sm relative z-10", COLORS.card)}
        >
          <div className="flex flex-col items-center">
            <span className={cn("text-3xl font-semibold mb-1", COLORS.textBright)}>
              {phase === 'idle' ? '4-7-8' : timer || phase === 'inhale' ? timer : ''}
            </span>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", COLORS.accent)}>
              {phase === 'idle' ? 'Technique' : `${timer}s`}
            </span>
          </div>
        </motion.div>

        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20">
          <circle
            cx="112"
            cy="112"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-slate-900"
          />
          {phase !== 'idle' && (
            <motion.circle
              cx="112"
              cy="112"
              r="88"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="552"
              initial={{ strokeDashoffset: 552 }}
              animate={{ 
                strokeDashoffset: 552 - (552 * (timer / (phase === 'inhale' ? 4 : phase === 'hold' ? 7 : 8)))
              }}
              className="text-indigo-900/60"
            />
          )}
        </svg>
      </div>

      <div className="h-16 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p 
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn("text-lg font-medium", COLORS.textBright)}
          >
            {getInstruction()}
          </motion.p>
        </AnimatePresence>
        {cycles > 0 && (
          <p className="text-xs text-slate-700 mt-1">Cycle {cycles} complete</p>
        )}
      </div>

      <div className="mt-12 w-full flex flex-col gap-4">
        {phase === 'idle' ? (
          <button
            onClick={start}
            className={cn("w-full py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg", COLORS.button, COLORS.buttonText, COLORS.buttonHover)}
          >
            Start Breathing
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="w-full py-4 bg-emerald-900/30 text-emerald-200 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-emerald-900/40 transition-all active:scale-[0.98] shadow-lg"
          >
            I feel better, finish <CheckCircle2 size={18} />
          </button>
        )}
        <button
          onClick={onBack}
          className="w-full py-2 text-slate-700 hover:text-slate-500 transition-colors text-xs font-medium"
        >
          Cancel and go back
        </button>
      </div>
    </motion.div>
  );
}

function HistoryView({ history, onClear }: { history: OffloadEntry[], onClear: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col"
    >
      <div className="mb-8 flex justify-between items-center">
        <h2 className={cn("text-2xl font-semibold leading-tight", COLORS.textBright)}>History</h2>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="p-2 text-slate-800 hover:text-red-900/60 transition-colors"
            title="Clear History"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className={cn("flex-1 flex flex-col items-center justify-center text-center p-12 rounded-3xl border border-dashed", COLORS.card, COLORS.border)}>
          <div className="w-12 h-12 bg-slate-900/50 rounded-full flex items-center justify-center text-slate-700 mb-4">
            <Moon size={24} />
          </div>
          <h3 className="text-base font-medium text-slate-600">The sky is clear</h3>
          <p className="text-xs text-slate-700 mt-2">Complete your first offload to see your history.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(entry => (
            <div key={entry.id} className={cn("p-5 rounded-2xl border", COLORS.card, COLORS.border)}>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 mb-3 uppercase tracking-widest">
                <Calendar size={10} />
                {format(entry.timestamp, 'MMM d, h:mm a')}
              </div>
              <p className={cn("text-sm leading-relaxed italic mb-4", COLORS.textBright)}>
                "{entry.thought}"
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
                  entry.stressLevel > 7 ? "bg-red-900/20 text-red-400/70" : 
                  entry.stressLevel > 4 ? "bg-amber-900/20 text-amber-400/70" : 
                  "bg-emerald-900/20 text-emerald-400/70"
                )}>
                  Lvl {entry.stressLevel}
                </span>
                {entry.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-900/50 text-slate-600 rounded text-[9px] font-bold uppercase tracking-widest border border-slate-800/50">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
