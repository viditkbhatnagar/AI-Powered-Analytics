import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import type React from "react";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import BlurEffect from "react-progressive-blur";
import { GradientButton } from "@/components/ui/gradient-button";
import { BlurTextEffect } from "@/components/ui/blur-text-effect";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface HelixRingsProps {
  levelsUp?: number;
  levelsDown?: number;
  stepY?: number;
  rotationStep?: number;
}

const HelixRings: React.FC<HelixRingsProps> = ({
  levelsUp = 10,
  levelsDown = 10,
  stepY = 0.85,
  rotationStep = Math.PI / 16,
}) => {
  const groupRef = useRef<THREE.Group>(new THREE.Group());

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const ringGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 0.35;
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);

    const depth = 10;
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 64,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -depth / 2);
    return geometry;
  }, []);

  const elements = [];
  for (let i = -levelsDown; i <= levelsUp; i++) {
    elements.push({
      id: `helix-ring-${i}`,
      y: i * stepY,
      rotation: i * rotationStep,
    });
  }

  return (
    <group scale={1} position={[5, 0, 0]} ref={groupRef} rotation={[0, 0, 0]}>
      {elements.map((el) => (
        <mesh
          key={el.id}
          geometry={ringGeometry}
          position={[0, el.y, 0]}
          rotation={[0, Math.PI / 2 + el.rotation, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#45BFD3"
            metalness={0.7}
            roughness={0.5}
            clearcoat={0}
            clearcoatRoughness={0.15}
            reflectivity={0}
            iridescence={0.96}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[100, 400]}
          />
        </mesh>
      ))}
    </group>
  );
};

const Scene: React.FC = () => {
  return (
    <Canvas
      className="h-full w-full"
      orthographic
      shadows
      camera={{
        zoom: 70,
        position: [0, 0, 7],
        near: 0.1,
        far: 1000,
      }}
      gl={{ antialias: true }}
      style={{ background: "#ffffff" }}
    >
      <hemisphereLight color={"#cfe8ff"} groundColor={"#ffffff"} intensity={2} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={2}
        castShadow
        color={"#ffeedd"}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <HelixRings />
      <EffectComposer multisampling={8}>
        <Bloom
          kernelSize={3}
          luminanceThreshold={0}
          luminanceSmoothing={0.4}
          intensity={0.6}
        />
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={0.5}
        />
      </EffectComposer>
    </Canvas>
  );
};

interface HeroProps {
  title: string;
  description: string;
}

export const Hero: React.FC<HeroProps> = ({ title }) => {
  return (
    <section className="relative h-screen w-screen font-sans tracking-tight text-gray-900 bg-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>
      <div className="absolute top-[12%] left-4 md:left-10 lg:left-16 z-20 max-w-xl space-y-3">
        {/* Logo with premium hover effects */}
        <div className="group relative mb-4">
          <div className="absolute -inset-3 bg-gradient-to-r from-[#45BFD3]/30 via-[#2196F3]/25 to-[#1976D2]/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="absolute -inset-2 bg-gradient-to-br from-white/50 to-transparent rounded-xl opacity-0 group-hover:opacity-60 transition-all duration-500" />
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="AI-Powered Analytics Logo" 
              className="h-20 md:h-24 lg:h-28 w-auto object-contain drop-shadow-lg transition-all duration-500 ease-out group-hover:scale-105 group-hover:drop-shadow-xl"
              style={{
                filter: 'drop-shadow(0 8px 20px rgba(69, 191, 211, 0.15))'
              }}
            />
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight bg-gradient-to-r from-[#1976D2] via-[#2196F3] to-[#45BFD3] bg-clip-text text-transparent">
          {title}
        </h1>
        
        {/* Premium quote paragraph */}
        <div className="relative py-4">
          <div className="absolute left-0 top-0 text-4xl text-[#45BFD3]/30 font-serif leading-none">"</div>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed font-light italic pl-6 pr-2" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
            <BlurTextEffect className="text-gray-700">
              Navigate your career in UAE's Supply Chain & Logistics with AI-driven insights across 18 domains, real salary benchmarks from AED 6,500 to 160,000, and personalized recommendations to accelerate your professional growth.
            </BlurTextEffect>
          </p>
          <div className="absolute right-0 bottom-0 text-4xl text-[#45BFD3]/30 font-serif leading-none">"</div>
        </div>
        
        <Link href="/dashboard">
          <GradientButton className="mt-4 group">
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </GradientButton>
        </Link>
      </div>
      <BlurEffect
        className="absolute bg-gradient-to-b from-transparent to-white/20 h-1/2 md:h-1/3 w-full bottom-0"
        position="bottom"
        intensity={50}
      />
      <BlurEffect
        className="absolute bg-gradient-to-b from-white/20 to-transparent h-1/2 md:h-1/3 w-full top-0"
        position="top"
        intensity={50}
      />
    </section>
  );
};
