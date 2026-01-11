
import React from 'react';
import { Terminal, Code2 } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  return (
    <div className="h-full flex flex-col bg-[#050505] font-mono">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-800 bg-[#0d0d0d]/50">
        <Code2 size={14} className="text-red-500" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">JS / HTML Runtime Editor</span>
      </div>
      
      <div className="flex-1 relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-black border-r border-zinc-800 flex flex-col items-center pt-4 text-[10px] text-zinc-700 font-bold select-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-6">{i + 1}</div>
          ))}
        </div>
        
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="absolute inset-0 left-12 w-[calc(100%-48px)] h-full p-4 bg-transparent text-red-400 text-xs focus:outline-none resize-none leading-6 font-mono"
        />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-black/40 text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex justify-between items-center">
        <span>Type: text/javascript</span>
        <span className="text-red-900/40">Manual Override Active</span>
      </div>
    </div>
  );
};
