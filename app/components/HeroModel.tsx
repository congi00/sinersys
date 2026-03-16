"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MotionValue, useMotionValueEvent } from "framer-motion";

interface Props {
  progressMotion: MotionValue<number>;
  rotationProgress: MotionValue<number>;
  stepSrc?: string;
}

export default function HeroModel({
  progressMotion,
  rotationProgress,
  stepSrc = "/APWEC2017.STEP",
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    modelGroup:   null as THREE.Group | null,
    rafId:        0,
    lastProgress: 0,
    tiltX:        0,
    targetTiltX:  0,
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.01, 1000);
    camera.position.set(0, 0.4, 5);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x3d6ef0, 1.2));
    const key = new THREE.DirectionalLight(0xd0e4ff, 3.8);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x1c398e, 2.0);
    fill.position.set(-5, 1, -3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.2);
    rim.position.set(0, -2, -6);
    scene.add(rim);

    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    stateRef.current.modelGroup = modelGroup;

    // Show placeholder immediately so model is always visible,
    // then replace with STEP if load succeeds
    addPlaceholder(modelGroup);
    loadStepAndReplace(modelGroup, stepSrc);

    const clock = new THREE.Clock();
    const s = stateRef.current;

    function animate() {
      s.rafId = requestAnimationFrame(animate);
      s.tiltX += (s.targetTiltX - s.tiltX) * 0.08;
      modelGroup.rotation.x = s.tiltX;
      modelGroup.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.03;
      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(s.rafId);
      ro.disconnect();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepSrc]);

  useMotionValueEvent(rotationProgress, "change", (rad) => {
    const { modelGroup } = stateRef.current;
    if (!modelGroup) return;
    modelGroup.rotation.y = rad;
  });

  useMotionValueEvent(progressMotion, "change", (p) => {
    const s = stateRef.current;
    const delta = p - s.lastProgress;
    s.lastProgress = p;
    if (p >= 2.5) { s.targetTiltX = 0; return; }
    const MAX_TILT = 0.10;
    s.targetTiltX = Math.abs(delta) > 0.0005 ? (delta > 0 ? MAX_TILT : -MAX_TILT) : 0;
  });

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }} />
  );
}

// ── Load STEP and swap out placeholder once ready ─────────────────────────────
async function loadStepAndReplace(group: THREE.Group, src: string) {
  try {
    const occtModule = await (
      import("occt-import-js") as Promise<typeof import("occt-import-js")>
    ).catch((e) => {
      console.warn("[HeroModel] occt-import-js not available:", e);
      return null;
    });

    if (!occtModule) {
      console.warn("[HeroModel] occt-import-js missing — keeping placeholder");
      return;
    }

    const occt = await occtModule.default({
      locateFile: (path: string) =>
        `https://cdn.jsdelivr.net/npm/occt-import-js@0.0.22/dist/${path}`,
    });

    console.log("[HeroModel] Fetching STEP:", src);
    const res = await fetch(src);
    if (!res.ok) {
      console.warn(`[HeroModel] STEP fetch failed: ${res.status} ${src}`);
      return; // keep placeholder
    }

    const fileBuffer = new Uint8Array(await res.arrayBuffer());
    console.log("[HeroModel] Parsing STEP file, size:", fileBuffer.byteLength);
    const result = occt.ReadStepFile(fileBuffer, null);

    if (!result.success || result.meshes.length === 0) {
      console.warn("[HeroModel] STEP parse failed or empty, keeping placeholder");
      return;
    }

    console.log("[HeroModel] STEP loaded, meshes:", result.meshes.length);

    // Clear placeholder
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    const mat = new THREE.MeshStandardMaterial({
      color: 0xc8d8f8,
      metalness: 0.72,
      roughness: 0.22,
    });

    for (const mesh of result.meshes) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(mesh.attributes.position.array), 3));
      if (mesh.attributes.normal) {
        geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(mesh.attributes.normal.array), 3));
      } else {
        geo.computeVertexNormals();
      }
      if (mesh.index) {
        geo.setIndex(new THREE.BufferAttribute(new Uint32Array(mesh.index.array), 1));
      }
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      group.add(m);
    }

    fitGroupToView(group);
    // Reset rotation so it starts from 0 after STEP loads
    group.rotation.set(0, 0, 0);
  } catch (err) {
    console.error("[HeroModel] Unexpected error loading STEP:", err);
    // placeholder remains
  }
}

// ── Placeholder ───────────────────────────────────────────────────────────────
function addPlaceholder(group: THREE.Group) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xb8cef0, metalness: 0.80, roughness: 0.15 });
  const add = (geo: THREE.BufferGeometry, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    group.add(m);
  };
  add(new THREE.BoxGeometry(5.0, 0.10, 1.2), 0, -0.55, 0);
  add(new THREE.BoxGeometry(2.2, 0.7, 0.9), 0, 0, 0);
  add(new THREE.CylinderGeometry(0.10, 0.10, 1.3, 20), -1.6, 0, 0);
  add(new THREE.CylinderGeometry(0.10, 0.10, 1.3, 20),  1.6, 0, 0);
  add(new THREE.BoxGeometry(3.6, 0.08, 0.22), 0, 0.60, 0);
  [-1.4, -0.7, 0, 0.7, 1.4].forEach((x) => add(new THREE.SphereGeometry(0.065, 14, 14), x, 0.63, 0));
  add(new THREE.BoxGeometry(0.18, 0.4, 0.9), -2.4, 0.1, 0);
  add(new THREE.BoxGeometry(0.18, 0.4, 0.9),  2.4, 0.1, 0);
  fitGroupToView(group);
}

function fitGroupToView(group: THREE.Group) {
  const box    = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale  = 2.2 / (maxDim || 1);
  group.children.forEach((c) => c.position.sub(center));
  group.scale.setScalar(scale);
}