
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment, ContactShadows, Grid, Float, Html, TransformControls, KeyboardControls, useKeyboardControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { GameObject, CameraView, EngineSettings } from '../types';

interface SceneViewProps {
  objects: GameObject[];
  selectedId: string | null;
  mode: 'translate' | 'rotate' | 'scale';
  cameraView: CameraView;
  activeCameraId: string | null;
  onUpdate: (id: string, updates: Partial<GameObject>) => void;
  settings: EngineSettings;
  skyboxUrl: string | null;
}

const Actor: React.FC<{ object: GameObject; isSelected: boolean }> = ({ object, isSelected }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { geometry, metalness, roughness, emissiveIntensity, wireframe } = object.modelConfig;
  const [, get] = useKeyboardControls();

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (object.controlsEnabled && isSelected) {
        const { forward, backward, left, right } = get();
        const speed = 7 * delta;
        const rotSpeed = 3 * delta;
        
        if (forward) meshRef.current.translateZ(-speed);
        if (backward) meshRef.current.translateZ(speed);
        if (left) meshRef.current.rotation.y += rotSpeed;
        if (right) meshRef.current.rotation.y -= rotSpeed;
        
        object.position[0] = meshRef.current.position.x;
        object.position[1] = meshRef.current.position.y;
        object.position[2] = meshRef.current.position.z;
        object.rotation[1] = meshRef.current.rotation.y;
      } else {
        meshRef.current.position.lerp(new THREE.Vector3(...object.position), 0.15);
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, object.rotation[1], 0.15);
        meshRef.current.scale.lerp(new THREE.Vector3(...object.scale), 0.15);
      }
    }
  });

  const isLight = object.name.includes('LIGHT');

  return (
    <group ref={meshRef} position={object.position} rotation={object.rotation} scale={object.scale}>
      {object.sayText && (
        <Html position={[0, 1.5, 0]} center>
          <div className="bg-indigo-600 border border-indigo-400 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-2xl relative animate-pulse whitespace-nowrap">
            {object.sayText}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-indigo-600 rotate-45 border-r border-b border-indigo-400"></div>
          </div>
        </Html>
      )}

      {isLight ? (
        <>
          <pointLight color={object.color} intensity={5} distance={20} decay={2} castShadow />
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={object.color} emissive={object.color} emissiveIntensity={10} />
          </mesh>
        </>
      ) : (
        <mesh castShadow receiveShadow>
          {geometry === 'sphere' ? <sphereGeometry args={[0.5, 64, 64]} /> : 
           geometry === 'torus' ? <torusGeometry args={[0.4, 0.15, 32, 100]} /> :
           geometry === 'cylinder' ? <cylinderGeometry args={[0.4, 0.4, 1, 32]} /> :
           geometry === 'icosahedron' ? <icosahedronGeometry args={[0.5, 0]} /> :
           <boxGeometry args={[0.8, 0.8, 0.8]} />}
          
          <meshStandardMaterial 
            color={object.color} 
            metalness={metalness} 
            roughness={roughness} 
            transparent 
            opacity={object.opacity}
            emissive={object.color} 
            emissiveIntensity={emissiveIntensity} 
            wireframe={wireframe}
            envMapIntensity={2.5}
          />
        </mesh>
      )}
    </group>
  );
};

const CameraController: React.FC<{ 
  mode: CameraView; 
  targetId: string | null; 
  objects: GameObject[] 
}> = ({ mode, targetId, objects }) => {
  const { camera } = useThree();
  const targetObj = objects.find(o => o.id === targetId);

  useFrame(() => {
    if (!targetObj || mode === 'editor') return;

    const targetPos = new THREE.Vector3(...targetObj.position);
    const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...targetObj.rotation));
    
    if (mode === 'firstPerson') {
      const eyeOffset = new THREE.Vector3(0, 0.4, -0.2).applyQuaternion(targetQuat);
      camera.position.copy(targetPos).add(eyeOffset);
      const lookAtPos = targetPos.clone().add(new THREE.Vector3(0, 0.4, -5).applyQuaternion(targetQuat));
      camera.lookAt(lookAtPos);
    } else if (mode === 'thirdPerson') {
      const followOffset = new THREE.Vector3(0, 2.5, 6).applyQuaternion(targetQuat);
      const desiredCamPos = targetPos.clone().add(followOffset);
      camera.position.lerp(desiredCamPos, 0.15);
      camera.lookAt(targetPos.clone().add(new THREE.Vector3(0, 1, 0)));
    }
  });

  return null;
};

export const SceneView: React.FC<SceneViewProps> = ({ objects, selectedId, mode, cameraView, activeCameraId, onUpdate, settings, skyboxUrl }) => {
  const selectedObj = objects.find(o => o.id === selectedId);

  return (
    <KeyboardControls map={[
      { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
      { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
      { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
      { name: 'right', keys: ['ArrowRight', 'KeyD'] },
      { name: 'jump', keys: ['Space'] },
    ]}>
      <div className="w-full h-full bg-[#010101] relative">
        <div className="absolute inset-0 pointer-events-none z-10 opacity-40 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"></div>
        
        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
          <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={cameraView === 'editor' ? 35 : 75} />
          
          {cameraView === 'editor' ? (
            <OrbitControls makeDefault dampingFactor={0.05} minDistance={2} maxDistance={100} />
          ) : (
            <CameraController mode={cameraView} targetId={activeCameraId} objects={objects} />
          )}

          <ambientLight intensity={0.02} />
          {skyboxUrl ? (
            <Environment files={skyboxUrl} background blur={0} />
          ) : (
            <Environment preset="city" blur={0.8} />
          )}
          
          {!skyboxUrl && <Stars radius={150} depth={50} count={10000} factor={6} saturation={1} fade speed={3} />}
          <Grid infiniteGrid fadeDistance={60} sectionColor="#1a1a1a" cellColor="#080808" sectionSize={5} cellSize={1} />
          
          <ContactShadows opacity={0.5} scale={30} blur={2.8} far={15} color="#000" />
          
          {objects.map(obj => (
            <Actor key={obj.id} object={obj} isSelected={selectedId === obj.id} />
          ))}

          {cameraView === 'editor' && selectedId && selectedObj && (
            <TransformControls 
              position={selectedObj.position}
              rotation={selectedObj.rotation}
              scale={selectedObj.scale}
              mode={mode}
              onMouseUp={(e: any) => {
                const { position, rotation, scale } = e.target.object;
                onUpdate(selectedId, {
                  position: [position.x, position.y, position.z],
                  rotation: [rotation.x, rotation.y, rotation.z],
                  scale: [scale.x, scale.y, scale.z]
                });
              }}
            />
          )}
        </Canvas>
      </div>
    </KeyboardControls>
  );
};
