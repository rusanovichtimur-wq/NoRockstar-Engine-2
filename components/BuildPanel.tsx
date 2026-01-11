
import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Terminal } from 'lucide-react';

interface BuildPanelProps {
  t: any;
  onComplete: () => void;
}

export const BuildPanel: React.FC<BuildPanelProps> = ({ t, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const logMessages = [
    "Initializing Core Engine v5.5.2...",
    "Linking static libraries...",
    "Compiling shaders (Vertex, Fragment, Compute)...",
    "Cooking content for Standalone target...",
    "Building reflection data...",
    "Compressing textures (DXT5)...",
    "Optimizing draw calls for high-end GPUs...",
    "Writing executable binaries...",
    "Finalizing package..."
  ];

  useEffect(() => {
    let currentLog = 0;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return 100;
        }
        
        if (p % 12 === 0 && currentLog < logMessages.length) {
          setLogs(prev => [...prev.slice(-8), logMessages[currentLog]]);
          currentLog++;
        }
        
        return p + 1;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center animate-pulse">
              <Terminal className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter text-white uppercase">{t.build}</h2>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{progress < 100 ? t.compiling : t.ready}</p>
            </div>
          </div>
          <span className="text-4xl font-black text-blue-500 italic">{progress}%</span>
        </div>

        <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mb-8 border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-black border border-white/5 rounded-2xl p-6 font-mono text-[11px] leading-loose shadow-2xl h-64 overflow-hidden">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-zinc-700">[{new Date().toLocaleTimeString()}]</span>
              <span className={i === logs.length - 1 ? "text-blue-400 font-bold animate-pulse" : "text-zinc-400"}>
                {log}
              </span>
            </div>
          ))}
          {progress === 100 && (
            <div className="mt-4 flex items-center gap-2 text-green-500 font-bold">
              <CheckCircle2 size={14} /> BUILD SUCCESSFUL
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
