"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

const BackgroundPlane = () => {
   const meshRef = useRef<THREE.Mesh>(null);
   const { size } = useThree();

   const uniforms = useMemo(
      () => ({
         uTime: { value: 0 },
         uColor1: { value: new THREE.Color("#0f172a") }, // Deep blue
         uColor2: { value: new THREE.Color("#1e293b") }, // Lighter blue
         uColor3: { value: new THREE.Color("#312e81") }, // Indigo
         uResolution: { value: new THREE.Vector2(size.width, size.height) },
      }),
      [size]
   );

   const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

   const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float d = length(p);

      float noise = sin(p.x * 2.0 + uTime * 0.5) * cos(p.y * 2.0 + uTime * 0.3);
      vec3 color = mix(uColor1, uColor2, vUv.y + noise * 0.2);
      color = mix(color, uColor3, clamp(1.0 - d + noise * 0.1, 0.0, 1.0));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

   useFrame((state) => {
      if (meshRef.current) {
         const material = meshRef.current.material as THREE.ShaderMaterial;
         material.uniforms.uTime.value = state.clock.getElapsedTime();
      }
   });

   return (
      <mesh ref={meshRef} scale={[size.width / 100, size.height / 100, 1]}>
         <planeGeometry args={[100, 100]} />
         <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
         />
      </mesh>
   );
};

const Particles = ({ count = 500 }) => {
   const pointsRef = useRef<THREE.Points>(null);
   const mouse = useRef(new THREE.Vector2(0, 0));

   const particles = useMemo(() => {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
         positions[i * 3] = (Math.random() - 0.5) * 10;
         positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
         positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
      return positions;
   }, [count]);

   useFrame((state) => {
      if (pointsRef.current) {
         pointsRef.current.rotation.y += 0.001;
         pointsRef.current.rotation.x += 0.0005;

         // Subtle mouse reaction
         const targetX = (state.mouse.x * 0.5);
         const targetY = (state.mouse.y * 0.5);
         pointsRef.current.position.x += (targetX - pointsRef.current.position.x) * 0.05;
         pointsRef.current.position.y += (targetY - pointsRef.current.position.y) * 0.05;
      }
   });

   return (
      <points ref={pointsRef}>
         <bufferGeometry>
            <bufferAttribute
               attach="attributes-position"
               count={particles.length / 3}
               array={particles}
               itemSize={3}
               args={[particles, 3]}
            />
         </bufferGeometry>
         <pointsMaterial
            size={0.02}
            color="#ffffff"
            transparent
            opacity={0.5}
            sizeAttenuation
         />
      </points>
   );
};

export default function ThreeScene() {
   return (
      <div className="absolute inset-0 -z-10">
         <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
         >
            <Suspense fallback={null}>
               <BackgroundPlane />
               <Particles />
               <ambientLight intensity={0.5} />
               <pointLight position={[10, 10, 10]} intensity={1} />
            </Suspense>
         </Canvas>
      </div>
   );
}
