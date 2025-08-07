import React, { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Physics } from "@react-three/rapier";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Leva } from "leva";

import Ground from "./components/Ground";
import InteractiveModel from "./components/InteractiveModel";
import Sheep from "./components/Sheep";
import FollowCamera from "./components/FollowCamera";
import Model from "./components/Model";
import OverlayControls from './components/OverlayControls';

function App() {
  const sheepRef = useRef();

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 60 }}
        gl={{ antialias: true }}
        style={{ height: "100vh", background: "#87ceeb" }}
      >
        <Physics gravity={[0, -9.81, 0]}>
          {/* Lumières */}
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            position={[5, 10, 5]}
            intensity={1.5}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />

          {/* Sol */}
          <Ground />

          {/* Murs invisibles mais bloquants */}
          {[
            [-10, 0.5, 0],
            [10, 0.5, 0],
            [0, 0.5, -10],
            [0, 0.5, 10],
          ].map((pos, i) => (
            <mesh key={i} position={pos}>
              <boxGeometry args={[0.5, 1, 20]} />
              <meshStandardMaterial color="#3a3a3a" transparent opacity={0} />
            </mesh>
          ))}

          {/* Modèles */}
          <Suspense fallback={null}>
            <Model url="/models/Rock.glb" position={[-7, 0, -6]} scale={[10, 10, 10]} />
            <Model url="/models/Pond.glb" position={[7, 0.4, 8]} scale={[3, 3, 3]} />
            <Model url="/models/Low_poly_floating_islands.glb" position={[60, 0, -30]} scale={[0.1, 0.1, 0.1]} />
            <Model url="/models/Two_Trees.glb" position={[20, -7, 30]} scale={[16, 16, 16]} />
            <Model url="/models/Two_Trees.glb" position={[-20, 4, -30]} scale={[16, 16, 16]} />
            <InteractiveModel url="/models/Pinecone.glb" initialPosition={[7, 1, -7]} scale={[0.4, 0.4, 0.4]} />
            <InteractiveModel url="/models/Pinecone.glb" initialPosition={[6, 1, -7]} scale={[0.4, 0.4, 0.4]} />
            <InteractiveModel url="/models/Pinecone.glb" initialPosition={[6, 1, -6]} scale={[0.4, 0.4, 0.4]} />
            <Model url="/models/Pine.glb" position={[8, 0, -9]} scale={[0.8, 0.8, 0.8]} />
            <Model url="/models/Pine.glb" position={[7, 0, -8]} scale={[0.6, 0.6, 0.6]} />
            <Model url="/models/Pine.glb" position={[7, 0, -9]} scale={[0.6, 0.6, 0.6]} />
            <Model url="/models/Apple_tree.glb" position={[0, 0, 7]} scale={[0.8, 0.8, 0.8]} />
            <Model url="/models/Island.glb" position={[0, -18.4, 0]} scale={[25, 25, 25]} />
          </Suspense>

          {/* Mouton + Caméra */}
          <Suspense fallback={null}>
            <Sheep
              url="/models/Sheep.glb"
              initialPosition={[0, 0, 0]}
              scale={[0.5, 0.5, 0.5]}
              ref={sheepRef}
            />
            <FollowCamera targetRef={sheepRef} offset={new THREE.Vector3(0, 5, -10)} lerpFactor={0.1} />
          </Suspense>
        </Physics>

        {/* Effets de post-processing */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            height={300}
            intensity={1.2}
          />
        </EffectComposer>
      </Canvas>

      {/* UI Overlay */}
      <OverlayControls />

      {/* Panneau Leva */}
      <Leva collapsed={false} />
    </>
  );
}

export default App;
