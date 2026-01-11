
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Block, BlockType, BLOCK_COLORS, GameObject } from '../types';
import { translations } from '../translations';
import { Sparkles, Terminal, Send, Loader2, Image as ImageIcon, Camera, BrainCircuit } from 'lucide-react';

interface AIConsoleProps {
  onGenerateBlocks: (blocks: Block[]) => void;
  onTextureLoad: (objectId: string, url: string) => void;
  lang: string;
  objects: GameObject[];
}

export const AIConsole: React.FC<AIConsoleProps> = ({ onGenerateBlocks, onTextureLoad, lang, objects }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const t = translations[lang] || translations.en;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `SYSTEM PROMPT: You are the UE5 Blueprint Architect. Command: "${prompt}". 
        Engine Features: RigidBody Physics, Dynamic Lighting, WASD Mappings, First/Third Person Views.
        Context: ${objects.map(o => o.name).join(', ')}.
        TASK: Return valid JSON with block sequences or asset modifications. Use BlockType enum values only.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              blocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { type: { type: Type.STRING }, label: { type: Type.STRING } }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.blocks) {
        onGenerateBlocks(data.blocks.map((b: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          type: b.type as BlockType,
          label: b.label || t.blocks[b.type],
          color: BLOCK_COLORS[b.type as BlockType] || 'bg-zinc-600',
          value: b.type === BlockType.CHANGE_COLOR ? '#'+Math.floor(Math.random()*16777215).toString(16) : 1
        })));
      }
      setPrompt('');
    } catch (error) {
      console.error('Architect Logic Failure:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#0a0a0a]">
      <div className="flex-1 overflow-y-auto space-y-6 mb-6">
        <div className="flex gap-4 p-5 rounded-3xl bg-zinc-900/50 border border-zinc-800 shadow-2xl">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20 shadow-inner">
            <BrainCircuit size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Architect Core Active</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
              Ready to compile logic. Try: <span className="text-zinc-300 italic">"Configure a character with physics and a jump event"</span>. I will build the entire blueprint for you.
            </p>
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-md opacity-20 group-hover:opacity-60 transition duration-700"></div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter Blueprint Command..."
          className="relative w-full bg-black/80 backdrop-blur-3xl border border-zinc-800 rounded-2xl p-6 pr-16 text-sm focus:outline-none focus:border-blue-500 transition-all resize-none h-40 text-white placeholder:text-zinc-700 font-medium"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="absolute bottom-6 right-6 p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/50 transition-all active:scale-95 disabled:opacity-20"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
        </button>
      </div>
    </div>
  );
};
