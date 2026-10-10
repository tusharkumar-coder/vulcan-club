"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function NetworkPoints({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const matrices = useMemo(() => {
    const temp = new THREE.Object3D();
    const result: THREE.Matrix4[] = [];
    for (let i = 0; i < count; i += 1) {
      const angle = i * 2.399963;
      const ring = 1.35 + (((i * 37) % 100) / 100) * 1.5;
      temp.position.set(
        Math.cos(angle) * ring,
        Math.sin(angle * 1.71) * 1.13,
        Math.sin(angle) * ring * 0.68,
      );
      const size = i % 9 === 0 ? 0.045 : 0.018;
      temp.scale.setScalar(size);
      temp.updateMatrix();
      result.push(temp.matrix.clone());
    }
    return result;
  }, [count]);
  useEffect(() => {
    if (!mesh.current) return;
    matrices.forEach((matrix, index) => mesh.current?.setMatrixAt(index, matrix));
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#9db4ca" transparent opacity={0.62} />
    </instancedMesh>
  );
}

function Core({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.y += delta * 0.15;
    group.current.rotation.x += delta * 0.055;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.045;
  });
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.03, 1]} />
        <meshStandardMaterial
          color="#232e3a"
          metalness={0.9}
          roughness={0.27}
          emissive="#182330"
          emissiveIntensity={0.3}
          flatShading
        />
      </mesh>
      <mesh scale={1.015}>
        <icosahedronGeometry args={[1.03, 1]} />
        <meshBasicMaterial color="#79dff2" wireframe transparent opacity={0.22} />
      </mesh>
      <mesh rotation={[0.55, 0.35, 0.2]}>
        <torusGeometry args={[1.52, 0.008, 6, 110]} />
        <meshBasicMaterial color="#ff6b35" transparent opacity={0.72} />
      </mesh>
      <mesh rotation={[1.12, -0.45, -0.4]}>
        <torusGeometry args={[1.82, 0.006, 6, 110]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} />
      </mesh>
      <mesh position={[1.2, 0.38, 0.18]}>
        <octahedronGeometry args={[0.12, 0]} />
        <meshStandardMaterial
          color="#ff8a54"
          emissive="#ff562b"
          emissiveIntensity={1.3}
          metalness={0.3}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[-1.05, -0.35, 0.42]}>
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial
          color="#69e7ff"
          emissive="#00a9d6"
          emissiveIntensity={1.2}
          metalness={0.3}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

function Scene({ reduced, mobile }: { reduced: boolean; mobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const trackPointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", trackPointer, { passive: true });
    return () => window.removeEventListener("pointermove", trackPointer);
  }, []);
  useFrame((_, delta) => {
    if (!group.current || reduced) return;
    group.current.rotation.y += delta * 0.025;
    group.current.rotation.x += (pointer.current.y * -0.045 - group.current.rotation.x) * 0.02;
    group.current.rotation.z += (pointer.current.x * 0.04 - group.current.rotation.z) * 0.02;
  });
  return (
    <group ref={group} scale={mobile ? 0.78 : 1} position={[0.45, 0, 0]}>
      <ambientLight intensity={0.38} />
      <pointLight position={[3, 3, 4]} intensity={18} color="#ff7944" distance={9} />
      <pointLight position={[-4, -1, 2]} intensity={14} color="#00bfe8" distance={10} />
      <directionalLight position={[-2, 4, 3]} intensity={1.4} />
      <Float
        speed={reduced ? 0 : 0.55}
        rotationIntensity={reduced ? 0 : 0.12}
        floatIntensity={reduced ? 0 : 0.11}
      >
        <Core reduced={reduced} />
      </Float>
      <NetworkPoints count={mobile ? 28 : 74} />
      <Stars
        radius={12}
        depth={3}
        count={mobile ? 65 : 180}
        factor={1.3}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.12}
      />
    </group>
  );
}

export default function ForgeCanvas({
  reduced,
  mobile,
  active,
}: {
  reduced: boolean;
  mobile: boolean;
  active: boolean;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "demand"}
      camera={{ position: [0, 0, 6.2], fov: 37 }}
      dpr={mobile ? [1, 1.15] : [1, 1.45]}
      gl={{ alpha: true, antialias: !mobile, powerPreference: "low-power" }}
    >
      <Scene reduced={reduced} mobile={mobile} />
    </Canvas>
  );
}
