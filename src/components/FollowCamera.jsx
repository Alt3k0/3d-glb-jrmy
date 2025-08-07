import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function FollowCamera({ targetRef, offset = new THREE.Vector3(0, 3, 6), lerpFactor = 0.1 }) {
  const { camera, mouse } = useThree()
  const currentPos = useRef(new THREE.Vector3())
  const initialized = useRef(false)

  useFrame(() => {
    const target = targetRef.current
    if (!target || !target.position) return

    const targetPos = target.position.clone()
    const baseDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(target.quaternion)

    const mouseInfluence = mouse.x * 0.5
    const direction = baseDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseInfluence)

    const desiredPos = targetPos.clone().add(direction.multiplyScalar(offset.z)).add(new THREE.Vector3(0, offset.y, 0))

    if (!initialized.current) {
      currentPos.current.copy(desiredPos)
      initialized.current = true
    } else {
      currentPos.current.lerp(desiredPos, lerpFactor)
    }

    camera.position.copy(currentPos.current)
    camera.lookAt(targetPos)
  })

  return null
}
