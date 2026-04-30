"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  MotionValue,
  motion,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

interface Props {
  className?: string;
  style?: React.CSSProperties;
  progress?: MotionValue<number>;
  vhUnit?: string;
}

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2  uResolution;
uniform float uPalette;

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * smoothNoise(p); p = p * 2.1 + vec2(1.7,9.2); a *= 0.5; }
  return v;
}
float blob(vec2 uv, vec2 center, float radius, float distort, float t) {
  vec2 p = uv - center;
  float noise = fbm(vec2(atan(p.y,p.x)*0.8+t*0.12, t*0.07)) * distort;
  return smoothstep(0.0, radius*0.65, -(length(p)-radius-noise));
}

vec3 dBase      = vec3(0.110, 0.224, 0.553);
vec3 dDark      = vec3(0.086, 0.176, 0.443);
vec3 dVeryDark  = vec3(0.059, 0.125, 0.341);
vec3 dBright    = vec3(0.165, 0.322, 0.788);
vec3 dHighlight = vec3(0.239, 0.431, 0.941);

vec3 lBase      = vec3(0.980, 0.957, 0.969);
vec3 lDark      = vec3(0.920, 0.890, 0.910);
vec3 lVeryDark  = vec3(0.860, 0.820, 0.850);
vec3 lBright    = vec3(0.165, 0.322, 0.788);
vec3 lHighlight = vec3(0.239, 0.431, 0.941);

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 auv = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.90;

  vec2 c1 = vec2((0.30+sin(t*0.61)*0.17)*aspect, 0.52+cos(t*0.47)*0.14);
  vec2 c2 = vec2((0.72+cos(t*0.53)*0.13)*aspect, 0.32+sin(t*0.71)*0.17);
  vec2 c3 = vec2((0.12+sin(t*0.39)*0.11)*aspect, 0.22+cos(t*0.83)*0.11);
  vec2 c4 = vec2((0.82+cos(t*0.44)*0.14)*aspect, 0.72+sin(t*0.58)*0.13);
  vec2 c5 = vec2((0.48+sin(t*0.77)*0.18)*aspect, 0.82+cos(t*0.36)*0.09);
  vec2 c6 = vec2((0.22+cos(t*0.65)*0.09)*aspect, 0.62+sin(t*0.62)*0.15);

  float b1=blob(auv,c1,0.38,0.050,t*1.0);
  float b2=blob(auv,c2,0.32,0.042,t*0.85);
  float b3=blob(auv,c3,0.28,0.058,t*1.25);
  float b4=blob(auv,c4,0.35,0.045,t*0.75);
  float b5=blob(auv,c5,0.30,0.050,t*1.10);
  float b6=blob(auv,c6,0.25,0.065,t*0.95);

  float bg = fbm(auv*1.2+vec2(t*0.05,t*0.03))*0.40 + fbm(auv*2.0-vec2(t*0.04,t*0.06))*0.32;

  vec3 dark = dBase;
  dark = mix(dark, dDark,      clamp(bg*0.6,0.0,1.0));
  dark = mix(dark, dVeryDark,  b2*0.45);
  dark = mix(dark, dVeryDark,  b4*0.40);
  dark = mix(dark, dBright,    b1*0.55);
  dark = mix(dark, dBright,    b3*0.50);
  dark = mix(dark, dHighlight, b5*0.35);
  dark = mix(dark, dHighlight, b6*0.45);
  float ov = b1*b3+b3*b5+b1*b5+b2*b6;
  dark += dHighlight * clamp(ov*0.25,0.0,0.15);

  vec3 lite = lBase;
  lite = mix(lite, lDark,      clamp(bg*0.3,0.0,1.0));
  lite = mix(lite, lVeryDark,  b2*0.18);
  lite = mix(lite, lVeryDark,  b4*0.15);
  lite = mix(lite, lBright,    b1*0.45);
  lite = mix(lite, lBright,    b3*0.40);
  lite = mix(lite, lHighlight, b5*0.30);
  lite = mix(lite, lHighlight, b6*0.38);
  lite += lBright * clamp(ov*0.12,0.0,0.10);

  vec2 vig = uv*2.0-1.0;
  float vignette = 0.75+0.25*(1.0-dot(vig*vec2(0.50,0.65),vig*vec2(0.50,0.65)));
  dark *= vignette;
  float vigLite = 0.90+0.10*(1.0-dot(vig*vec2(0.40,0.55),vig*vec2(0.40,0.55)));
  lite *= vigLite;

  vec3 col = mix(dark, lite, uPalette);
  gl_FragColor = vec4(col, 1.0);
}
`;

// ── Misura l'altezza reale del viewport includendo vhUnit (lvh/dvh) ──────────
function measureVh(vhUnit: string): number {
  const probe = document.createElement("div");
  probe.style.cssText = `position:fixed;top:0;left:0;width:1px;height:100${vhUnit};pointer-events:none;visibility:hidden;`;
  document.body.appendChild(probe);
  const h = probe.getBoundingClientRect().height;
  document.body.removeChild(probe);
  return h;
}

// ── Rileva se siamo su Android Chrome ────────────────────────────────────────
function isAndroidChrome(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent) && /Chrome/.test(navigator.userAgent);
}

export default function LiquidBackground({
  className = "",
  style = {},
  progress = undefined,
  vhUnit = "dvh",
}: Props) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const paletteRef = useRef(0);
  // Ref al renderer e agli uniforms per poterli aggiornare dal resize handler
  const rendererRef  = useRef<THREE.WebGLRenderer | null>(null);
  const uniformsRef  = useRef<{ uResolution: { value: THREE.Vector2 } } | null>(null);

  if (!progress) return null;

  const inset = useTransform(
    progress,
    [0, 0.8],
    [
      "inset(16px 16px 16px 16px round 24px)",
      "inset(0px 0px 0px 0px round 0px)",
    ]
  );

  useMotionValueEvent(progress, "change", (p) => {
    const raw   = Math.min(1, Math.max(0, (p - 3.05) / 0.15));
    const eased = raw < 0.5 ? 3 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
    paletteRef.current = eased;
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = window.innerWidth;
    let H = measureVh(vhUnit);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(W, H) },
      uPalette:    { value: 0 },
    };
    uniformsRef.current = uniforms;

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
    });
    scene.add(new THREE.Mesh(geo, mat));

    let rafId = 0;
    const clock = new THREE.Clock();
    function animate() {
      rafId = requestAnimationFrame(animate);
      uniforms.uTime.value    = clock.getElapsedTime();
      uniforms.uPalette.value = paletteRef.current;
      renderer.render(scene, camera);
    }
    animate();

    // ── Resize handler ────────────────────────────────────────────────────
    // Su Android Chrome la toolbar sparisce/appare cambiando window.innerHeight.
    // Usiamo un debounce di 150ms per non ricalcolare ad ogni pixel di scroll.
    let resizeTimer: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newW = window.innerWidth;
        // Su Android Chrome usiamo window.innerHeight direttamente perché
        // innerHeight si aggiorna quando la toolbar sparisce.
        // Su iOS usiamo la probe con vhUnit (lvh non cambia con la Safari bar).
        const newH = isAndroidChrome()
          ? window.innerHeight
          : measureVh(vhUnit);

        if (newW === W && Math.abs(newH - H) < 2) return; // nessun cambiamento reale
        W = newW;
        H = newH;

        renderer.setSize(W, H);
        uniforms.uResolution.value.set(W, H);
      }, 150);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Android Chrome: la toolbar sparisce/appare senza triggerare "resize"
    // su alcune versioni → ascolta anche "visualViewport.resize"
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", handleResize);
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      if (vv) vv.removeEventListener("resize", handleResize);
      renderer.dispose();
      mat.dispose();
      geo.dispose();
      rendererRef.current = null;
      uniformsRef.current = null;
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [vhUnit]);

  return (
    <motion.div
      style={{
        position:  "fixed",
        top:       0,
        left:      0,
        right:     0,
        bottom:    0,
        clipPath:  inset,
        zIndex:    0,
        overflow:  "hidden",
        willChange: "clip-path",
      }}
    >
      <div
        ref={mountRef}
        className={className}
        style={{
          width:          "100%",
          height:         `100${vhUnit}`,
          pointerEvents:  "none",
          transform:      "translateZ(0)",
          // Su Android assicura che il canvas non venga stretchato dal CSS
          // quando innerHeight cambia prima che Three.js ricalcoli
          minHeight:      "100%",
        }}
      />
    </motion.div>
  );
}