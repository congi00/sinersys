import { forwardRef, useEffect, useState } from "react";
import * as THREE from "three";

const ProductVideo = forwardRef<THREE.Mesh>((_, ref) => {
  const [texture, setTexture] = useState<THREE.VideoTexture>();

  useEffect(() => {
    const video = document.createElement("video");
    video.src = "/product-loop.mp4";
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
    <mesh ref={ref} position={[0, 0, 0]}>
      <planeGeometry args={[4, 4]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0}
      />
    </mesh>
  );
});

export default ProductVideo;
