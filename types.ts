
export enum BlockType {
  MOVE_FORWARD = 'MOVE_FORWARD',
  MOVE_BACKWARD = 'MOVE_BACKWARD',
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  JUMP = 'JUMP',
  CHANGE_COLOR = 'CHANGE_COLOR',
  SCALE_UP = 'SCALE_UP',
  SCALE_DOWN = 'SCALE_DOWN',
  WAIT = 'WAIT',
  SAY = 'SAY',
  GHOST = 'GHOST',
  SPAWN_CUBE = 'SPAWN_CUBE',
  SPAWN_SPHERE = 'SPAWN_SPHERE',
  SPAWN_LIGHT = 'SPAWN_LIGHT',
  ENABLE_WASD = 'ENABLE_WASD',
  TOGGLE_PHYSICS = 'TOGGLE_PHYSICS',
  BROADCAST_SIGNAL = 'BROADCAST_SIGNAL',
  ON_SIGNAL = 'ON_SIGNAL'
}

export type GeometryType = 'box' | 'sphere' | 'torus' | 'cylinder' | 'icosahedron' | 'light';
export type CameraView = 'editor' | 'firstPerson' | 'thirdPerson';

export interface ModelConfig {
  geometry: GeometryType;
  metalness: number;
  roughness: number;
  emissiveIntensity: number;
  wireframe: boolean;
  textureUrl?: string;
  physicsEnabled?: boolean;
}

export interface GameObject {
  id: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
  modelConfig: ModelConfig;
  sayText?: string;
  blocks: Block[];
  controlsEnabled?: boolean;
}

export interface EngineSettings {
  bloom: number;
  vignette: number;
  chromaticAberration: number;
}

export interface EngineState {
  objects: GameObject[];
  selectedObjectId: string | null;
  activeCameraId: string | null;
  cameraView: CameraView;
  isAnimating: boolean;
  isBuilding: boolean;
  isInstalled: boolean;
  rawCode: string;
  gizmoMode: 'translate' | 'rotate' | 'scale';
  settings: EngineSettings;
  skyboxUrl: string | null;
}

export interface Block {
  id: string;
  type: BlockType;
  value?: string | number;
  color: string;
  label: string;
}

export const BLOCK_COLORS: Record<BlockType, string> = {
  [BlockType.MOVE_FORWARD]: 'bg-blue-500',
  [BlockType.MOVE_BACKWARD]: 'bg-blue-600',
  [BlockType.TURN_LEFT]: 'bg-yellow-500',
  [BlockType.TURN_RIGHT]: 'bg-yellow-600',
  [BlockType.JUMP]: 'bg-purple-500',
  [BlockType.CHANGE_COLOR]: 'bg-pink-500',
  [BlockType.SCALE_UP]: 'bg-green-500',
  [BlockType.SCALE_DOWN]: 'bg-green-600',
  [BlockType.WAIT]: 'bg-orange-500',
  [BlockType.SAY]: 'bg-indigo-500',
  [BlockType.GHOST]: 'bg-zinc-500',
  [BlockType.SPAWN_CUBE]: 'bg-red-500',
  [BlockType.SPAWN_SPHERE]: 'bg-red-400',
  [BlockType.SPAWN_LIGHT]: 'bg-yellow-400',
  [BlockType.ENABLE_WASD]: 'bg-cyan-500',
  [BlockType.TOGGLE_PHYSICS]: 'bg-orange-600',
  [BlockType.BROADCAST_SIGNAL]: 'bg-emerald-500',
  [BlockType.ON_SIGNAL]: 'bg-emerald-600',
};
