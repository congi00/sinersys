"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MotionValue, useMotionValueEvent } from "framer-motion";

interface Props {
  progressMotion:   MotionValue<number>;
  rotationProgress: MotionValue<number>;
  objSrc?: string;
}

// ── Shared preload cache ──────────────────────────────────────────────────────
type CacheEntry =
  | { status: "loading"; callbacks: Array<(g: THREE.Group) => void> }
  | { status: "ready";   group: THREE.Group };

const objCache = new Map<string, CacheEntry>();

export function preloadOBJ(src: string) {
  if (objCache.has(src)) return;
  const entry: CacheEntry = { status: "loading", callbacks: [] };
  objCache.set(src, entry);
  new OBJLoader().load(
    src,
    (obj) => {
      const group = new THREE.Group();
      obj.traverse((c) => { if ((c as THREE.Mesh).isMesh) group.add((c as THREE.Mesh).clone()); });
      const ready: CacheEntry = { status: "ready", group };
      objCache.set(src, ready);
      if (entry.status === "loading") entry.callbacks.forEach((cb) => cb(group));
    },
    undefined,
    (err) => console.error("[HeroModel] preload error:", err)
  );
}

function getOrLoadOBJ(src: string, onReady: (g: THREE.Group) => void) {
  const cached = objCache.get(src);
  if (cached?.status === "ready") { onReady(cached.group); return; }
  if (cached?.status === "loading") { cached.callbacks.push(onReady); return; }
  preloadOBJ(src);
  const e = objCache.get(src)!;
  if (e.status === "loading") e.callbacks.push(onReady);
}

// ── Build aluminium-like environment map procedurally ─────────────────────────
function buildEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem    = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envScene = new THREE.Scene();
  const geo      = new THREE.SphereGeometry(50, 64, 32);

  // Aluminium studio: bright top highlight, neutral mid, slightly warm floor bounce
  const posArr = geo.attributes.position.array as Float32Array;
  const cols: number[] = [];
  for (let i = 0; i < posArr.length; i += 3) {
    const t = (posArr[i + 1] + 50) / 100; // 0=floor, 1=ceiling
    // floor: warm grey  #3a3a3a → ceiling: bright white-blue #e8eeff
    const r = 0.227 + t * (0.910 - 0.227);
    const g = 0.227 + t * (0.933 - 0.227);
    const b = 0.227 + t * (1.000 - 0.227);
    cols.push(r, g, b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  envScene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));

  // Add a bright rectangular "studio light" area in the env
  const lightGeo = new THREE.PlaneGeometry(30, 12);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const lightPlane = new THREE.Mesh(lightGeo, lightMat);
  lightPlane.position.set(0, 30, -20);
  lightPlane.rotation.x = Math.PI * 0.3;
  envScene.add(lightPlane);

  const tex = pmrem.fromScene(envScene).texture;
  pmrem.dispose();
  geo.dispose();
  lightGeo.dispose();
  lightMat.dispose();
  return tex;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HeroModel({
  progressMotion,
  rotationProgress,
  objSrc = "/APWEC.obj",
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

    // ── Renderer ─────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace    = THREE.SRGBColorSpace;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    renderer.shadowMap.enabled   = true;
    renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      38, mount.clientWidth / mount.clientHeight, 0.01, 1000
    );
    // Camera pulled back enough so model is never clipped by near plane or frustum
    camera.position.set(0, 0, 7);
    camera.lookAt(0, 0, 0);

    // ── Environment (aluminium studio) ────────────────────────────────────
    const envTexture   = buildEnvMap(renderer);
    scene.environment  = envTexture;
    // No scene background — canvas is transparent (alpha:true)

    // ── Lights ────────────────────────────────────────────────────────────
    // Key: cold bright top-right
    const key = new THREE.DirectionalLight(0xf0f4ff, 3.5);
    key.position.set(4, 8, 5);
    key.castShadow = true;
    scene.add(key);
    // Fill: warm left
    const fill = new THREE.DirectionalLight(0xffe8c8, 1.2);
    fill.position.set(-5, 2, 3);
    scene.add(fill);
    // Rim: back cold
    const rim = new THREE.DirectionalLight(0xd0e8ff, 2.0);
    rim.position.set(2, -3, -8);
    scene.add(rim);
    // Very soft ambient
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    // ── Aluminium material ────────────────────────────────────────────────
    // Brushed aluminium: high metalness, moderate roughness, near-neutral color
    const aluminiumMat = new THREE.MeshPhysicalMaterial({
      color:              0xd8dde8,   // very slightly cool grey
      metalness:          1.0,
      roughness:          0.25,       // brushed — not mirror, not matte
      reflectivity:       1.0,
      envMapIntensity:    2.8,
      clearcoat:          0.15,       // very subtle clearcoat
      clearcoatRoughness: 0.3,
    });

    // ── Model group ───────────────────────────────────────────────────────
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    stateRef.current.modelGroup = modelGroup;

    getOrLoadOBJ(objSrc, (cached) => {
      while (modelGroup.children.length > 0) {
        const c = modelGroup.children[0];
        modelGroup.remove(c);
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
      }
      cached.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = (child as THREE.Mesh).clone();
          m.material   = aluminiumMat;
          m.castShadow = true;
          modelGroup.add(m);
        }
      });
      fitGroupToView(modelGroup, camera);
      modelGroup.rotation.set(0, 0, 0);
      console.log("[HeroModel] aluminium model ready");
    });

    // ── Animation loop ────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    const s     = stateRef.current;

    function animate() {
      s.rafId = requestAnimationFrame(animate);
      s.tiltX += (s.targetTiltX - s.tiltX) * 0.08;
      if (modelGroup) {
        modelGroup.rotation.x = s.tiltX;
        modelGroup.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.06;
      }
      renderer.render(scene, camera);
    }
    animate();

    // ── Resize ────────────────────────────────────────────────────────────
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
      aluminiumMat.dispose();
      envTexture.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objSrc]);

  // ── Z-axis rotation: 0 → π (180°) across progress 0→0.8, then holds ────
  useMotionValueEvent(rotationProgress, "change", (rad) => {
    const { modelGroup } = stateRef.current;
    if (modelGroup) modelGroup.rotation.z = rad;
  });

  // ── X tilt from scroll direction ──────────────────────────────────────────
  useMotionValueEvent(progressMotion, "change", (p) => {
    const s     = stateRef.current;
    const delta = p - s.lastProgress;
    s.lastProgress = p;
    if (p >= 2.5) { s.targetTiltX = 0; return; }
    const MAX_TILT = 0.08;
    s.targetTiltX = Math.abs(delta) > 0.0005 ? (delta > 0 ? MAX_TILT : -MAX_TILT) : 0;
  });

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }} />
  );
}

// ── Fit model so it is always fully visible inside the camera frustum ─────────
// Camera is at z=7, fov=38. At z=0 the visible half-height = 7 * tan(19°) ≈ 2.41
// We scale the model to fit within 80% of that — leaving 10% padding top/bottom.
function fitGroupToView(group: THREE.Group, camera: THREE.PerspectiveCamera) {
  const box    = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());

  // Centre the geometry at origin
  group.children.forEach((c) => c.position.sub(center));

  const camDist      = camera.position.z;
  const fovRad       = THREE.MathUtils.degToRad(camera.fov);
  const visibleHalfH = Math.tan(fovRad / 2) * camDist;
  const visibleHalfW = visibleHalfH * camera.aspect;
  const visibleH     = visibleHalfH * 2 * 0.78; // 78% — generous padding
  const visibleW     = visibleHalfW * 2 * 0.90;

  // Scale to fit within viewport (whichever axis is tighter)
  const maxDim = Math.max(size.x, size.y, size.z);
  const fitH   = visibleH / (size.y || 1);
  const fitW   = visibleW / (size.x || 1);
  const scale  =  6 / (maxDim || 1);

  group.scale.setScalar(scale);
}