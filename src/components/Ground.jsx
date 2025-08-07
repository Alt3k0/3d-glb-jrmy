// Ground.jsx
import React from 'react'

export default function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#228B22" /> {/* ✅ vert forêt */}
    </mesh>
  )
}
