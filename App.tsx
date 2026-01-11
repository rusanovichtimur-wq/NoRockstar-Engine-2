
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SceneView } from './components/SceneView';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { AIConsole } from './components/AIConsole';
import { ModelForge } from './components/ModelForge';
import { BuildPanel } from './components/BuildPanel';
import { CodeEditor } from './components/CodeEditor';
import { Block, BlockType, EngineState, BLOCK_COLORS, GameObject, CameraView } from './types';
import { translations } from './translations';
import { Play, RotateCcw, Box, Sparkles, Layers, Globe, Cpu, Hammer, Code2, List, Move, Rotate3d, Maximize2, Download, Eye, Video, User, Zap, Lightbulb, Image as ImageIcon } from 'lucide-react';

// Utility to create a new game object with default properties
const createObject = (type: 'box' | 'sphere' | 'light', name: string): GameObject => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  position: [(Math.random() - 0.5) * 6, type === 'light' ? 3 : 0.5, (Math.random() - 0.5) * 6],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: type === 'light' ? '#fff9c4' : '#' + Math.floor(Math.random() * 16777215).toString(16),
  opacity: 1,
  modelConfig: {
    geometry: type === 'light' ? 'box' : type,
    metalness: 0.9,
    roughness: 0.1,
    emissiveIntensity: type === 'light' ? 2 : 0.4,
    wireframe: false,
    physicsEnabled: false
  },
  blocks: [],
  controlsEnabled: false
});

const INITIAL_STATE: EngineState = {
  objects: [createObject('box', 'Player_BP')],
  selectedObjectId: null,
  activeCameraId: null,
  cameraView: 'editor',
  isAnimating: false,
  isBuilding: false,
  isInstalled: false,
  rawCode: `// UE5 JS Runtime Simulation\nconsole.log("NoRockstar Engine Initialized");`,
  gizmoMode: 'translate',
  settings: {
    bloom: 1.5,
    vignette: 0.4,
    chromaticAberration: 0.002
  },
  skyboxUrl: null
};
INITIAL_STATE.selectedObjectId = INITIAL_STATE.objects[0].id;

const App: React.FC = () => {
  const [lang, setLang] = useState('uk');
  const [engineState, setEngineState] = useState<EngineState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'editor' | 'ai' | 'models' | 'code'>('editor');
  
  const t = translations[lang] || translations.en;

  const selectedObject = useMemo(() => 
    engineState.objects.find(o => o.id === engineState.selectedObjectId),
    [engineState.objects, engineState.selectedObjectId]
  );

  const updateSelectedObject = (updater: (obj: GameObject) => GameObject) => {
    setEngineState(prev => ({
      ...prev,
      objects: prev.objects.map(o => o.id === prev.selectedObjectId ? updater(o) : o)
    }));
  };

  const handleObjectUpdate = (id: string, updates: Partial<GameObject>) => {
    setEngineState(prev => ({
      ...prev,
      objects: prev.objects.map(o => o.id === id ? { ...o, ...updates } : o)
    }));
  };

  const addBlock = (type: BlockType) => {
    if (!engineState.selectedObjectId && !type.toString().startsWith('SPAWN')) return;

    if (type === BlockType.SPAWN_CUBE || type === BlockType.SPAWN_SPHERE || type === BlockType.SPAWN_LIGHT) {
      const geom = type === BlockType.SPAWN_CUBE ? 'box' : type === BlockType.SPAWN_SPHERE ? 'sphere' : 'light';
      const newObj = createObject(geom as any, `${geom.toUpperCase()}_BP_${engineState.objects.length}`);
      setEngineState(prev => ({ ...prev, objects: [...prev.objects, newObj], selectedObjectId: newObj.id }));
      return;
    }

    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: t.blocks[type],
      color: BLOCK_COLORS[type],
      value: type === BlockType.CHANGE_COLOR ? '#'+Math.floor(Math.random()*16777215).toString(16) : 1
    };

    updateSelectedObject(obj => ({
      ...obj,
      blocks: [...obj.blocks, newBlock],
      controlsEnabled: type === BlockType.ENABLE_WASD ? true : obj.controlsEnabled
    }));
  };

  const quickSetupCharacter = (view: CameraView) => {
    if (!engineState.selectedObjectId) return;
    setEngineState(prev => ({
      ...prev,
      cameraView: view,
      activeCameraId: prev.selectedObjectId
    }));
    addBlock(BlockType.ENABLE_WASD);
  };

  const loadSkybox = () => {
    const url = prompt("Введіть URL для текстури Skybox (Equirectangular image):", "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/night_free_area_1k.hdr");
    if (url) {
      setEngineState(prev => ({ ...prev, skyboxUrl: url }));
    }
  };

  const removeBlock = (id: string) => {
    updateSelectedObject(obj => ({
      ...obj,
      blocks: obj.blocks.filter(b => b.id !== id),
      controlsEnabled: obj.blocks.some(b => b.id !== id && b.type === BlockType.ENABLE_WASD)
    }));
  };

  const handleBuild = () => setEngineState(prev => ({ ...prev, isBuilding: true }));
  const onBuildComplete = () => setEngineState(prev => ({ ...prev, isBuilding: false, isInstalled: true }));
  const resetScene = () => setEngineState(INITIAL_STATE);

  const downloadHtml = () => {
    const htmlContent = `<!DOCTYPE html><html><head><title>NoRockstar Engine 2 Standalone</title><style>body{margin:0;background:#000;overflow:hidden;}</style><script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script></head><body><script>const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(window.innerWidth,window.innerHeight);document.body.appendChild(renderer.domElement);const light=new THREE.PointLight(0xffffff,2,100);light.position.set(10,10,10);scene.add(light);scene.add(new THREE.AmbientLight(0x202020));const objects=${JSON.stringify(engineState.objects)};objects.forEach(obj=>{const geo=obj.modelConfig.geometry==='sphere'?new THREE.SphereGeometry(0.5,32,32):new THREE.BoxGeometry(0.8,0.8,0.8);const mat=new THREE.MeshStandardMaterial({color:obj.color,metalness:0.9,roughness:0.1});const mesh=new THREE.Mesh(geo,mat);mesh.position.set(...obj.position);scene.add(mesh);});camera.position.set(5,5,5);camera.lookAt(0,0,0);function animate(){requestAnimationFrame(animate);renderer.render(scene,camera);}animate();</script></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'norockstar_project.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-screen bg-black overflow-hidden font-sans text-zinc-300 select-none">
      {engineState.isBuilding && <BuildPanel t={t} onComplete={onBuildComplete} />}

      {/* Main Navigation Sidebar */}
      <div className="w-16 flex flex-col items-center py-6 border-r border-zinc-900 bg-[#080808] gap-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
          <Zap size={24} fill="currentColor" />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          {[
            { id: 'editor', icon: Layers },
            { id: 'ai', icon: Sparkles },
            { id: 'models', icon: Box },
            { id: 'code', icon: Code2 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                activeTab === tab.id ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-600 hover:bg-zinc-900 hover:text-zinc-400'
              }`}
            >
              <tab.icon size={20} />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          <button onClick={() => setLang(l => l === 'en' ? 'uk' : 'en')} className="text-[10px] font-black hover:text-white transition-colors">
            {lang.toUpperCase()}
          </button>
          <button className="text-zinc-600 hover:text-zinc-400"><User size={20} /></button>
        </div>
      </div>

      {/* Engine Interface Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Toolbar */}
        <div className="h-16 border-b border-zinc-900 bg-[#0c0c0c] flex items-center px-6 gap-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-black tracking-[0.2em] text-white uppercase">NoRockstar</h1>
            <div className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[8px] font-bold border border-blue-500/20">ENGINE v2</div>
          </div>

          <div className="h-6 w-px bg-zinc-800" />

          {/* Transform Mode Controls */}
          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
            {[
              { id: 'translate', icon: Move },
              { id: 'rotate', icon: Rotate3d },
              { id: 'scale', icon: Maximize2 },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setEngineState(s => ({ ...s, gizmoMode: m.id as any }))}
                className={`p-2 rounded-lg transition-all ${engineState.gizmoMode === m.id ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <m.icon size={16} />
              </button>
            ))}
          </div>

          {/* Camera View Controls */}
          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
            {[
              { id: 'editor', icon: Eye },
              { id: 'firstPerson', icon: Video },
              { id: 'thirdPerson', icon: User },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setEngineState(s => ({ ...s, cameraView: v.id as any }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${
                  engineState.cameraView === v.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <v.icon size={14} />
                <span>{t.views[v.id as keyof typeof t.views]}</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Global Operations */}
          <div className="flex items-center gap-3">
            <button onClick={loadSkybox} className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-all">
              <Globe size={14} /> {t.assets}
            </button>
            <button onClick={resetScene} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 transition-all">
              <RotateCcw size={18} />
            </button>
            <button onClick={handleBuild} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest">
              <Hammer size={16} /> {t.build}
            </button>
            {engineState.isInstalled && (
              <button onClick={downloadHtml} className="p-2.5 rounded-xl bg-green-600 text-white hover:bg-green-500 transition-all">
                <Download size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Viewport and Inspector Panels */}
        <div className="flex-1 flex overflow-hidden">
          {/* Engine 3D Viewport */}
          <div className="flex-1 relative border-r border-zinc-900 bg-[#050505]">
             <SceneView 
                objects={engineState.objects}
                selectedId={engineState.selectedObjectId}
                mode={engineState.gizmoMode}
                cameraView={engineState.cameraView}
                activeCameraId={engineState.activeCameraId}
                onUpdate={handleObjectUpdate}
                settings={engineState.settings}
                skyboxUrl={engineState.skyboxUrl}
             />
             
             {/* Scene Info Overlays */}
             <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Selected Actor</span>
                  <span className="text-xl font-black text-white uppercase italic tracking-tighter">{selectedObject?.name || 'World Root'}</span>
                </div>
                {selectedObject && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => quickSetupCharacter('thirdPerson')}
                      className="pointer-events-auto px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-[9px] font-black uppercase text-zinc-400 hover:text-white transition-all flex items-center gap-2 shadow-xl"
                    >
                      <Zap size={12} className="text-yellow-500" /> Init Controller
                    </button>
                  </div>
                )}
             </div>
          </div>

          {/* Side Inspector Tabs */}
          <div className="w-[420px] bg-[#080808] flex flex-col shadow-2xl z-20 overflow-hidden">
            {activeTab === 'editor' && (
              <>
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="h-12 border-b border-zinc-900 flex items-center px-6 gap-2 bg-zinc-900/20">
                    <List size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t.workspace}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Workspace 
                      blocks={selectedObject?.blocks || []} 
                      onRemoveBlock={removeBlock} 
                      emptyMsg={t.empty} 
                    />
                  </div>
                </div>
                <div className="h-[40%] border-t border-zinc-900 flex flex-col min-h-0">
                  <div className="h-12 border-b border-zinc-900 flex items-center px-6 gap-2 bg-zinc-900/20">
                    <Cpu size={14} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Actor Blueprints</span>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <Sidebar onAddBlock={addBlock} lang={lang} />
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'ai' && (
              <AIConsole 
                onGenerateBlocks={(blocks) => {
                  updateSelectedObject(obj => ({ ...obj, blocks: [...obj.blocks, ...blocks] }));
                }}
                onTextureLoad={(id, url) => {
                   handleObjectUpdate(id, { modelConfig: { ...engineState.objects.find(o => o.id === id)!.modelConfig, textureUrl: url } });
                }}
                lang={lang}
                objects={engineState.objects}
              />
            )}

            {activeTab === 'models' && selectedObject && (
              <ModelForge 
                config={selectedObject.modelConfig}
                onChange={(cfg) => updateSelectedObject(obj => ({ ...obj, modelConfig: cfg }))}
                lang={lang}
              />
            )}

            {activeTab === 'code' && (
              <CodeEditor 
                code={engineState.rawCode}
                onChange={(code) => setEngineState(s => ({ ...s, rawCode: code }))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
