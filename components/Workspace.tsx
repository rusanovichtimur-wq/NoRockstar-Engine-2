
import React from 'react';
import { Block } from '../types';
import { X, GripVertical, ChevronRight } from 'lucide-react';

interface WorkspaceProps {
  blocks: Block[];
  onRemoveBlock: (id: string) => void;
  emptyMsg: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({ blocks, onRemoveBlock, emptyMsg }) => {
  return (
    <div className="h-full p-8 overflow-y-auto flex flex-col items-center bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] bg-[size:32px_32px]">
      {blocks.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
          <div className="w-20 h-20 border-2 border-dashed border-zinc-700 rounded-3xl flex items-center justify-center mb-6">
            <Boxes size={32} className="text-zinc-600" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">{emptyMsg}</p>
        </div>
      ) : (
        <div className="w-full space-y-2 flex flex-col items-center">
          {blocks.map((block, index) => (
            <div 
              key={block.id}
              className={`relative w-full max-w-sm flex items-center gap-4 p-4 rounded-2xl border border-white/10 shadow-2xl transition-all hover:scale-[1.02] hover:brightness-110 group ${block.color}`}
              style={{
                marginTop: index === 0 ? 0 : '-12px',
                zIndex: blocks.length - index,
                clipPath: `polygon(
                  0% 0%, 
                  35% 0%, 40% 10px, 60% 10px, 65% 0%, 
                  100% 0%, 
                  100% 100%, 
                  65% 100%, 60% calc(100% + 10px), 40% calc(100% + 10px), 35% 100%, 
                  0% 100%
                )`
              }}
            >
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <GripVertical size={14} className="text-white/60" />
              </div>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-[11px] font-black text-white uppercase tracking-tight">{block.label}</span>
                <ChevronRight size={12} className="text-white/30" />
              </div>
              <button 
                onClick={() => onRemoveBlock(block.id)}
                className="p-1.5 hover:bg-black/20 rounded-xl transition-colors text-white/40 hover:text-white opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import { Boxes } from 'lucide-react';
