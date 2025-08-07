import React, { useRef, useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function InteractiveModel({
  url,
  initialPosition = [0, 3, 0], // hauteur de départ pour bien voir la chute
  scale = [1, 1, 1],
}) {
  const { scene } = useGLTF(url)
  const ref = useRef()
  const { camera, gl } = useThree()

  const [isDragging, setIsDragging] = useState(false)
  const [selected, setSelected] = useState(false)

  // Stocker les vitesses (translation + rotation) dans des refs pour garder les valeurs entre les frames
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const angularVelocity = useRef(new THREE.Vector3(0, 0, 0)) // rotation autour des axes x,y,z

  const pointer = useRef(new THREE.Vector2())
  const lastPointer = useRef(new THREE.Vector2())
  const raycaster = new THREE.Raycaster()
  const initialPos = useRef(new THREE.Vector3(...initialPosition))

  const GRAVITY = -0.01
  const FLOOR_Y = 0.1

  // Activer ombres sur le renderer
  useEffect(() => {
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
  }, [gl])

  // Activer ombre sur chaque mesh du modèle
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  useEffect(() => {
    const handlePointerDown = (event) => {
      pointer.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      )
      raycaster.setFromCamera(pointer.current, camera)
      const intersects = raycaster.intersectObject(ref.current, true)

      if (intersects.length > 0) {
        setSelected(true)
        setIsDragging(true)
        velocity.current.set(0, 0, 0) // Reset velocity
        angularVelocity.current.set(0, 0, 0) // Reset rotation vitesse
      }
    }

    const handlePointerUp = () => {
      if (isDragging) {
        const delta = pointer.current.clone().sub(lastPointer.current)
        // Vitesse brute selon déplacement souris
        const throwVelocity = new THREE.Vector3(delta.x, delta.y, 0).multiplyScalar(20)

        // Limiter la vitesse max pour éviter les lancers trop violents
        throwVelocity.clampLength(0, 0.2)

        // On conserve la vitesse verticale actuelle (gravitée)
        throwVelocity.y = velocity.current.y

        velocity.current.copy(throwVelocity)

        // Rotation aléatoire liée au "lancer"
        angularVelocity.current.set(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        )
      }
      setIsDragging(false)
    }

    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 'f' && selected) {
        ref.current.position.copy(initialPos.current)
        ref.current.rotation.set(0, 0, 0)
        velocity.current.set(0, 0, 0)
        angularVelocity.current.set(0, 0, 0)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [camera, isDragging, selected])

  useFrame(({ mouse }) => {
    lastPointer.current.copy(pointer.current)
    pointer.current.set(mouse.x, mouse.y)

    const object = ref.current
    if (!object) return

    if (isDragging && selected) {
      raycaster.setFromCamera(pointer.current, camera)

      const planeNormal = new THREE.Vector3()
      camera.getWorldDirection(planeNormal)
      const dragPlane = new THREE.Plane(planeNormal, -object.position.dot(planeNormal))

      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(dragPlane, intersection)

      if (intersection) {
        // On empêche de descendre sous le sol pendant le drag aussi
        intersection.y = Math.max(intersection.y, FLOOR_Y)
        object.position.copy(intersection)

        // Reset velocities pendant drag (pour éviter les comportements bizarres après drag)
        velocity.current.set(0, 0, 0)
        angularVelocity.current.set(0, 0, 0)
      }
    } else {
      // Gravité
      velocity.current.y += GRAVITY
      object.position.add(velocity.current)

      // Rebond au sol
      if (object.position.y <= FLOOR_Y) {
        object.position.y = FLOOR_Y

        // Rebond vertical avec amortissement
        velocity.current.y = -velocity.current.y * 0.3

        // Amortissement vitesse horizontale (frottement)
        velocity.current.x *= 0.7
        velocity.current.z *= 0.7

        // Amortissement rotation quand au sol
        angularVelocity.current.multiplyScalar(0.9)

        // Stop les petits rebonds infinis
        if (Math.abs(velocity.current.y) < 0.01) velocity.current.y = 0
      }

      // Appliquer rotation selon la vitesse angulaire
      object.rotation.x += angularVelocity.current.x
      object.rotation.y += angularVelocity.current.y
      object.rotation.z += angularVelocity.current.z
    }
  })

  return (
    <primitive
      ref={ref}
      object={scene}
      scale={scale}
      position={initialPos.current}
      castShadow
      receiveShadow
      onPointerEnter={() => (document.body.style.cursor = 'grab')}
      onPointerLeave={() => {
        document.body.style.cursor = 'default'
        setSelected(false)
      }}
    />
  )
}
