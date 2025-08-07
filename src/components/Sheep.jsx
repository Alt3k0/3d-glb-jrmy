// Sheep.jsx
import React, { useRef, useEffect, forwardRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const MOVE_SPEED = 0.05;
const ROTATE_SPEED = 0.05;

const Sheep = forwardRef(function Sheep(
  { url, initialPosition = [0, 0, 0], scale = [1, 1, 1], floorY = 0.1 },
  ref
) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, group);
  const targetRotationY = useRef(0);


  const keysPressed = useRef({});
  const currentAction = useRef(null);

  // Propagation du ref au parent
  useEffect(() => {
    if (ref && group.current) {
      ref.current = group.current;
      targetRotationY.current = group.current.rotation.y;
    }
  }, [ref]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Rotation gauche/droite
    // Calcule la rotation cible
    if (keysPressed.current["q"]) {
      targetRotationY.current += ROTATE_SPEED;
    }
    if (keysPressed.current["d"]) {
      targetRotationY.current -= ROTATE_SPEED;
    }

    // Interpolation douce vers la rotation cible
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetRotationY.current,
      0.1 // plus petit = plus lent
    );

    let moveDistance = 0;
    if (keysPressed.current["s"]) moveDistance = MOVE_SPEED;
    else if (keysPressed.current["z"]) moveDistance = -MOVE_SPEED;

    if (moveDistance !== 0) {
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(
        group.current.rotation
      );
      group.current.position.add(forward.multiplyScalar(moveDistance));

      group.current.position.add(forward.multiplyScalar(moveDistance));

      // ✅ Limites de la zone (-10 à +10, car le sol fait 20x20)
      const limit = 9;
      group.current.position.x = Math.max(
        -limit,
        Math.min(limit, group.current.position.x)
      );
      group.current.position.z = Math.max(
        -limit,
        Math.min(limit, group.current.position.z)
      );
    }

    group.current.position.y = floorY;

    let nextActionName = "AnimalArmature|AnimalArmature|AnimalArmature|Idle";
    if (moveDistance !== 0) {
      nextActionName = "AnimalArmature|AnimalArmature|AnimalArmature|Walk";
    }

    if (actions) {
      const nextAction = actions[nextActionName];
      if (currentAction.current !== nextAction) {
        currentAction.current?.fadeOut(0.3);
        nextAction?.reset().fadeIn(0.3).play();
        currentAction.current = nextAction;
      }
    }

    mixer?.update(delta);
  });

  return (
    <group
      ref={group}
      position={initialPosition}
      scale={scale}
      castShadow
      receiveShadow
    >
      <primitive object={scene} />
    </group>
  );
});

export default Sheep;
