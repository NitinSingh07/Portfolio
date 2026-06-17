'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Environment } from '@react-three/drei'
import { Suspense, useRef } from 'react'

function DistortedBlob() {
    const ref = useRef(null)
    useFrame(({ clock, pointer }) => {
        if (!ref.current) return
        ref.current.rotation.y = clock.getElapsedTime() * 0.15
        ref.current.rotation.x = clock.getElapsedTime() * 0.08
        // subtle tilt from mouse
        ref.current.rotation.z += (pointer.x * 0.2 - ref.current.rotation.z) * 0.02
    })
    return (
        <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
            <Sphere ref={ref} args={[1.4, 128, 128]}>
                <MeshDistortMaterial
                    color="#7c3aed"
                    attach="material"
                    distort={0.45}
                    speed={1.6}
                    roughness={0.15}
                    metalness={0.85}
                />
            </Sphere>
        </Float>
    )
}

export default function HeroScene() {
    return (
        <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 4.2], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            style={{ width: '100%', height: '100%' }}
        >
            <Suspense fallback={null}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[3, 3, 3]} intensity={1.4} color="#f0abfc" />
                <directionalLight position={[-3, -1, -2]} intensity={0.9} color="#38bdf8" />
                <pointLight position={[0, -2, 2]} intensity={1.2} color="#fb7185" />
                <DistortedBlob />
                <Environment preset="city" />
            </Suspense>
        </Canvas>
    )
}