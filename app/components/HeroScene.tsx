"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MotionValue } from "framer-motion";
import * as THREE from "three";
import BackgroundVideo from "./BackgroundVideo";
import ProductVideo from "./ProductVideo";

interface Props {
  progress: MotionValue<number>;
}

export default function HeroScene({ progress }: Props) {
  const productRef = useRef<THREE.Mesh>(null!);

  useFrame(({ camera }) => {
    const p = progress.get();

    // 🧠 ZOOM PIÙ PROGRESSIVO
    const smoothZoom = THREE.MathUtils.smoothstep(p, 0.1, 0.9);
    camera.position.z = 12 - smoothZoom * 9;

    // 🎥 PRODOTTO VISIBILE SOLO DOPO ZOOM COMPLETO
    if (productRef.current) {
      const revealStart = 0.85;
      const revealEnd = 1.1;

      const opacity = THREE.MathUtils.clamp(
        (p - revealStart) / (revealEnd - revealStart),
        0,
        1
      );

      (productRef.current.material as THREE.MeshBasicMaterial).opacity =
        opacity;
    }
  });

  return (
    <>
      <BackgroundVideo />

      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={2} />

      <ProductVideo ref={productRef} />
    </>
  );
}
