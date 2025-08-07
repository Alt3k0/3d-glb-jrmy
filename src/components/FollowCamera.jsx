import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function FollowCamera({ targetRef, offset = new THREE.Vector3(0, 3, 6), lerpFactor = 0.1 }) {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3())
  const initialized = useRef(false)

  useFrame(() => {
    const target = targetRef.current
    if (!target || !target.position) {
      console.log('FollowCamera: waiting for target to be ready...')
      return
    }

    const targetPos = target.position.clone()
    const targetRotY = target.rotation.y

    const offsetRotated = offset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), targetRotY)
    const desiredPos = targetPos.clone().add(offsetRotated)

    if (!initialized.current) {
      currentPos.current.copy(desiredPos)
      initialized.current = true
      console.log('FollowCamera initialized at', desiredPos.toArray())
    } else {
      currentPos.current.lerp(desiredPos, lerpFactor)
    }

    camera.position.copy(currentPos.current) 
    camera.lookAt(targetPos)
  })

  return null
}