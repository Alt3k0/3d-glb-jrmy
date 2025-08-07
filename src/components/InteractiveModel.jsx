import React, { useRef, useState, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function InteractiveModel({
  url,
  initialPosition = [0, 3, 0],
  scale = [1, 1, 1],
}) {
  const { scene } = useGLTF(url)
  const ref = useRef()
  const { camera, gl } = useThree()

  const [isDragging, setIsDragging] = useState(false)
  const [isNearby, setIsNearby] = useState(false)

  const velocity = useRef(new THREE.Vector3())
  const angularVelocity = useRef(new THREE.Vector3())

  const pointer = useRef(new THREE.Vector2())
  const lastPointer = useRef(new THREE.Vector2())
  const raycaster = new THREE.Raycaster()
  const initialPos = useRef(new THREE.Vector3(...initialPosition))

  const GRAVITY = -0.01
  const FLOOR_Y = 0.1
  const MAX_AREA = 10

  useEffect(() => {
    gl.shadowMap.enabled = true
    gl.shadowMap.type = THREE.PCFSoftShadowMap
  }, [gl])

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.material = child.material.clone() // éviter de partager le matériau
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
        setIsDragging(true)
        velocity.current.set(0, 0, 0)
        angularVelocity.current.set(0, 0, 0)
      }
    }

    const handlePointerUp = () => {
      if (isDragging) {
        const delta = pointer.current.clone().sub(lastPointer.current)
        const throwVelocity = new THREE.Vector3(delta.x, delta.y, 0).multiplyScalar(20)
        throwVelocity.clampLength(0, 0.2)
        throwVelocity.y = velocity.current.y
        velocity.current.copy(throwVelocity)

        angularVelocity.current.set(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        )
      }
      setIsDragging(false)
    }

    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 'f') {
        ref.current.position.copy(initialPos.current)
        ref.current.rotation.set(0, 0, 0)
        velocity.current.set(0, 0, 0)
        angularVelocity.current.set(0, 0, 0)
      }
    }

    const handleClick = () => {
      if (isNearby) {
        console.log("Action déclenchée à proximité !");
        // Ajoute ici ton action personnalisée
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClick)
    }
  }, [camera, isDragging, isNearby])

  useFrame(({ mouse, scene }) => {
    lastPointer.current.copy(pointer.current)
    pointer.current.set(mouse.x, mouse.y)

    const object = ref.current
    if (!object) return

    const sheep = scene.getObjectByName("Sheep")
    if (sheep) {
      const distance = object.position.distanceTo(sheep.position)
      const nearby = distance < 3
      setIsNearby(nearby)

      object.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(nearby ? 0xffaa00 : 0xffffff)
        }
      })
    }

    if (isDragging) {
      raycaster.setFromCamera(pointer.current, camera)
      const planeNormal = new THREE.Vector3()
      camera.getWorldDirection(planeNormal)
      const dragPlane = new THREE.Plane(planeNormal, -object.position.dot(planeNormal))

      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(dragPlane, intersection)

      if (intersection) {
        intersection.y = Math.max(intersection.y, FLOOR_Y)
        object.position.copy(intersection)
        velocity.current.set(0, 0, 0)
        angularVelocity.current.set(0, 0, 0)
      }
    } else {
      velocity.current.y += GRAVITY
      object.position.add(velocity.current)

      if (object.position.y <= FLOOR_Y) {
        object.position.y = FLOOR_Y
        velocity.current.y = -velocity.current.y * 0.3
        velocity.current.x *= 0.7
        velocity.current.z *= 0.7
        angularVelocity.current.multiplyScalar(0.9)
        if (Math.abs(velocity.current.y) < 0.01) velocity.current.y = 0
      }

      object.rotation.x += angularVelocity.current.x
      object.rotation.y += angularVelocity.current.y
      object.rotation.z += angularVelocity.current.z
    }

    object.position.x = THREE.MathUtils.clamp(object.position.x, -MAX_AREA / 2, MAX_AREA / 2)
    object.position.z = THREE.MathUtils.clamp(object.position.z, -MAX_AREA / 2, MAX_AREA / 2)
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
      onPointerLeave={() => (document.body.style.cursor = 'default')}
    />
  )
}
