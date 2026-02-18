import { useEffect, useState } from "react";
import * as THREE from "three";

export default function BackgroundVideo() {
  const [texture, setTexture] = useState<THREE.VideoTexture>();

  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/city-loop.mp4";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.play();

    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;

    setTexture(tex);
  }, []);

  if (!texture) return null;

  return (
    <mesh position={[0, 0, -15]}>
      <planeGeometry args={[40, 25]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
