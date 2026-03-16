"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  className?: string;
  style?: React.CSSProperties;
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

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1,0)), f.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * smoothNoise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float blob(vec2 uv, vec2 center, float radius, float distort, float t) {
  vec2 p = uv - center;
  float noise = fbm(vec2(atan(p.y, p.x) * 0.8 + t * 0.12, t * 0.07)) * distort;
  return smoothstep(0.0, radius * 0.65, -(length(p) - radius - noise));
}

// ── Palette — tutto ruota attorno a #1c398e ───────────────────────────────
// #1c398e  primary (base dominante)
// #162d72  dark variant
// #0f2057  very dark
// #2a52c9  bright accent blob
// #3d6ef0  highlight overlap
vec3 cBase      = vec3(0.031, 0.041, 0.271); // #1c398e linear
vec3 cDark      = vec3(0.046, 0.153, 0.855); // #162d72 linear
vec3 cVeryDark  = vec3(0.022, 0.082, 0.560); // #0f2057 linear
vec3 cBright    = vec3(0.022, 0.082, 0.560); // #2a52c9 linear
vec3 cHighlight = vec3(0.096, 0.153, 0.855); // #3d6ef0 linear

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 auv = vec2(uv.x * aspect, uv.y);

  float t = uTime * 0.90;

  vec2 c1 = vec2((0.30 + sin(t * 0.61) * 0.17) * aspect, 0.52 + cos(t * 0.47) * 0.14);
  vec2 c2 = vec2((0.72 + cos(t * 0.53) * 0.13) * aspect, 0.32 + sin(t * 0.71) * 0.17);
  vec2 c3 = vec2((0.12 + sin(t * 0.39) * 0.11) * aspect, 0.22 + cos(t * 0.83) * 0.11);
  vec2 c4 = vec2((0.82 + cos(t * 0.44) * 0.14) * aspect, 0.72 + sin(t * 0.58) * 0.13);
  vec2 c5 = vec2((0.48 + sin(t * 0.77) * 0.18) * aspect, 0.82 + cos(t * 0.36) * 0.09);
  vec2 c6 = vec2((0.22 + cos(t * 0.65) * 0.09) * aspect, 0.62 + sin(t * 0.62) * 0.15);

  float b1 = blob(auv, c1, 0.38, 0.050, t * 1.0);
  float b2 = blob(auv, c2, 0.32, 0.042, t * 0.85);
  float b3 = blob(auv, c3, 0.28, 0.058, t * 1.25);
  float b4 = blob(auv, c4, 0.35, 0.045, t * 0.75);
  float b5 = blob(auv, c5, 0.30, 0.050, t * 1.10);
  float b6 = blob(auv, c6, 0.25, 0.065, t * 0.95);

  // Background warp su base #1c398e
  float bg = fbm(auv * 1.2 + vec2(t * 0.05, t * 0.03)) * 0.40
           + fbm(auv * 2.0 - vec2(t * 0.04, t * 0.06)) * 0.32;

  // Parti dal primary #1c398e come colore di base
  vec3 col = cBase;

  // Blob scuri per dare profondità (mai più scuri del 30% rispetto al base)
  col = mix(col, cDark,     clamp(bg * 0.6, 0.0, 1.0));
  col = mix(col, cVeryDark, b2 * 0.45); // solo leggera variazione scura
  col = mix(col, cVeryDark, b4 * 0.40);

  // Blob chiari — toni di blu più brillanti ma non dominanti
  col = mix(col, cBright,    b1 * 0.55);
  col = mix(col, cBright,    b3 * 0.50);
  col = mix(col, cHighlight, b5 * 0.35);
  col = mix(col, cHighlight,    b6 * 0.45);

  // Luminosità dove i blob si sovrappongono
  float overlap = b1*b3 + b3*b5 + b1*b5 + b2*b6;
  col += cHighlight * clamp(overlap * 0.25, 0.0, 0.15);

  // Vignette leggera — non troppo scura per non allontanarsi da #1c398e
  vec2 vig = uv * 2.0 - 1.0;
  float vignette = 0.75 + 0.25 * (1.0 - dot(vig * vec2(0.50, 0.65), vig * vec2(0.50, 0.65)));
  col *= vignette;



  gl_FragColor = vec4(col, 1.0);
}
`;

export default function LiquidBackground({ className = "", style = {} }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime:       { value: 0 },
      uResolution: { value: new THREE.Vector2(mount.clientWidth, mount.clientHeight) },
    };

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
    scene.add(new THREE.Mesh(geo, mat));

    let rafId: number;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.dispose();
      mat.dispose();
      geo.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}