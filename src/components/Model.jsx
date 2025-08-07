import React, { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { clone } from "three/examples/jsm/utils/SkeletonUtils";

export default function Model({
  url,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  type = "fixed", // 'fixed' = statique
}) {
  const { scene } = useGLTF(url);

  // Clone la scène pour éviter les conflits
  const clonedScene = useMemo(() => clone(scene), [scene]);
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });
  }, [clonedScene]);

  return (
    <RigidBody
      type={type}
      colliders="trimesh"
      position={position}
      rotation={rotation}
    >
      <primitive object={clonedScene} scale={scale} />
    </RigidBody>
  );
}
