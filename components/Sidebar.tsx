
import React from 'react';
import { BlockType, BLOCK_COLORS } from '../types';
import { translations } from '../translations';
import { 
  ArrowUp, ArrowDown, RotateCcw, RotateCw, ArrowUpCircle, 
  Palette, Maximize, Minimize, Clock, MessageSquare, Ghost, Plus, Cuboid, CircleDot, Gamepad2, Lightbulb, Zap, Radio, Boxes
} from 'lucide-react';

interface SidebarProps {
  onAddBlock: (type: BlockType) => void;
  lang: string;
}

const CATEGORIES = [
  {
    name: "Actor Setup",
    items: [
      { type: BlockType.SPAWN_CUBE, icon: Cuboid },
      { type: BlockType.SPAWN_SPHERE, icon: CircleDot },
      { type: BlockType.SPAWN_LIGHT, icon: Lightbulb },
    ]
  },
  {
    name: "Input & Movement",
    items: [
      { type: BlockType.ENABLE_WASD, icon: Gamepad2 },
      { type: BlockType.MOVE_FORWARD, icon: ArrowUp },
      { type: BlockType.MOVE_BACKWARD, icon: ArrowDown },
      { type: BlockType.TURN_LEFT, icon: RotateCcw },
      { type: BlockType.TURN_RIGHT, icon: RotateCw },
      { type: BlockType.JUMP, icon: ArrowUpCircle },
    ]
  },
  {
    name: "Physics & Events",
    items: [
      { type: BlockType.TOGGLE_PHYSICS, icon: Boxes },
      { type: BlockType.BROADCAST_SIGNAL, icon: Radio },
      { type: BlockType.ON_SIGNAL, icon: Radio },
    ]
  },
  {
    name: "Visual Effects",
    items: [
      { type: BlockType.SAY, icon: MessageSquare },
      { type: BlockType.CHANGE_COLOR, icon: Palette },
      { type: BlockType.SCALE_UP, icon: Maximize },
      { type: BlockType.SCALE_DOWN, icon: Minimize },
      { type: BlockType.GHOST, icon: Ghost },
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddBlock, lang }) => {
  const t = translations[lang] || translations.en;

  return (
    <div className="w-64 flex flex-col border-r border-zinc-800 bg-[#0c0c0c] overflow-y-auto">
      <div className="p-5 border-b border-zinc-900 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Project Toolkit</h2>
        <p className="text-[8px] font-bold text-zinc-600 uppercase">UE5 Logic Synthesizer</p>
      </div>

      {CATEGORIES.map((cat) => (
        <div key={cat.name} className="p-4 border-b border-zinc-900/50">
          <h2 className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 ml-1">{cat.name}</h2>
          <div className="space-y-2">
            {cat.items.map((def) => {
              const Icon = def.icon;
              return (
                <button
                  key={def.type}
                  onClick={() => onAddBlock(def.type)}
                  className="group w-full flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/40 hover:bg-zinc-800 border border-white/5 transition-all text-left shadow-sm"
                >
                  <div className={`p-2 rounded-xl ${BLOCK_COLORS[def.type]} text-white shadow-lg`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-[11px] font-bold text-zinc-400 group-hover:text-white truncate uppercase tracking-tighter">
                    {t.blocks[def.type]}
                  </span>
                  <Plus size={12} className="ml-auto opacity-0 group-hover:opacity-40 text-blue-400" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      <div className="mt-auto p-6 bg-zinc-900/20 text-center">
        <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Engine Build: RC-2025.4</div>
      </div>
    </div>
  );
};
