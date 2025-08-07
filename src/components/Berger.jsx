
import React, { useRef, useEffect, useState } from "react";
import { useGLTF, useAnimations, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";


const phrases = [
  "Bonjour, petite brebis !",
  "Les autres nous attendent .", 
  "Tu t'es encore perdue... Viens avec moi .",
  "Suis moi ! Et ne crains rien !",
  "Il y en a d'autres qui sont perdues . Viens !",
  "Je suis là pour te guider .",
  "On va retrouver le troupeau ensemble .",
];


const Berger = ({ url, position = [5, 0, 5], scale = [1, 1, 1], sheepRef }) => {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, group);
  const [interacting, setInteracting] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [opacity, setOpacity] = useState(0);
  const currentAction = useRef(null);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "f" && sheepRef?.current && group.current) {
        const distance = group.current.position.distanceTo(sheepRef.current.position);
        if (distance < 3) {
          const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
          setPhrase(randomPhrase);
          setInteracting(true);
          setOpacity(1);

          setTimeout(() => {
            const fadeInterval = setInterval(() => {
              setOpacity((prev) => {
                if (prev <= 0.05) {
                  clearInterval(fadeInterval);
                  setInteracting(false);
                  return 0;
                }
                return prev - 0.05;
              });
            }, 100);
          }, 2000);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sheepRef]);

  useFrame((_, delta) => {
    const nextActionName = interacting ? "Interact" : "Idle";
    const nextAction = actions[nextActionName];
    if (currentAction.current !== nextAction) {
      currentAction.current?.fadeOut(0.3);
      nextAction?.reset().fadeIn(0.3).play();
      currentAction.current = nextAction;
    }
    mixer?.update(delta);
  });

  return (
    <group ref={group} position={position} scale={scale} rotation={[0, Math.PI, 0]}>
      <primitive object={scene} />
      {interacting && (
        <Html position={[0, 3, 0]} center>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              padding: "12px 24px",
              borderRadius: "16px",
              fontFamily: "Coolvetica, sans-serif",
              fontSize: "18px",
              color: "black",
              opacity: opacity,
              transition: "opacity 0.3s ease",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
            }}
          >
            {phrase}
          </div>
        </Html>
      )}
    </group>
  );
};

export default Berger;
