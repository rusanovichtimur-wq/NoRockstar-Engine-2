
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ModelConfig, GeometryType } from '../types';
import { Box, Sparkles, Download, Settings, Sliders, Wand2, Loader2 } from 'lucide-react';

interface ModelForgeProps {
  config: ModelConfig;
  onChange: (cfg: ModelConfig) => void;
  lang: string;
}

const GEOMETRIES: GeometryType[] = ['box', 'sphere', 'torus', 'cylinder', 'icosahedron'];

export const ModelForge: React.FC<ModelForgeProps> = ({ config, onChange, lang }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIForge = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate this model description into engine parameters: "${prompt}". 
        Geometry must be one of: ${GEOMETRIES.join(', ')}.
        Output JSON: { geometry, metalness (0-1), roughness (0-1), emissiveIntensity (0-2), wireframe (bool) }`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              geometry: { type: Type.STRING },
              metalness: { type: Type.NUMBER },
              roughness: { type: Type.NUMBER },
              emissiveIntensity: { type: Type.NUMBER },
              wireframe: { type: Type.BOOLEAN }
            }
          }
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      onChange({ ...config, ...data });
      setPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      <div>
        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
          <Wand2 size={12} /> AI Creator Tool
        </h3>
        <div className="relative">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your model (e.g. A chrome sphere with high emission)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs h-24 focus:outline-none focus:border-indigo-500 transition-all text-white placeholder:text-zinc-600 resize-none"
          />
          <button 
            onClick={handleAIForge}
            disabled={isGenerating || !prompt}
            className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white shadow-lg transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
          <Sliders size={12} /> Material Inspector
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {GEOMETRIES.map(g => (
              <button
                key={g}
                onClick={() => onChange({...config, geometry: g})}
                className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  config.geometry === g ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {[
              { label: 'Metalness', key: 'metalness' },
              { label: 'Roughness', key: 'roughness' },
              { label: 'Emissive', key: 'emissiveIntensity' }
            ].map(attr => (
              <div key={attr.key} className="space-y-1">
                <div className="flex justify-between text-[9px] font-black text-zinc-600 uppercase">
                  <span>{attr.label}</span>
                  <span>{(config as any)[attr.key].toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max={attr.key === 'emissiveIntensity' ? '2' : '1'} step="0.01"
                  value={(config as any)[attr.key]}
                  onChange={(e) => onChange({...config, [attr.key]: parseFloat(e.target.value)})}
                  className="w-full accent-indigo-600 bg-zinc-800 h-1 rounded-full appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <button className="w-full py-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-800 hover:text-white transition-all">
          <Download size={14} /> Import FBX/OBJ Pack
        </button>
      </div>
    </div>
  );
};
