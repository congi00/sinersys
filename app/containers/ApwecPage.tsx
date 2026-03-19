"use client";

/**
 * /app/containers/ApwecPage.tsx
 *
 * IMPORTANTE: il route file /app/apwec/page.tsx deve essere:
 *
 *   "use client";
 *   import ApwecPage from "../containers/ApwecPage";
 *   export default function Page() { return <ApwecPage />; }
 */

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import Lenis from "@studio-freight/lenis";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { useTranslations } from "next-intl";
import Header from "../components/Header";
import MenuButton from "../components/MenuButton";
import { useAppSelector } from "../hooks";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const SCENES = 6;

const EXPLODE_TARGETS = [
  new THREE.Vector3(-2.0,  1.6, 0),
  new THREE.Vector3( 2.0,  1.6, 0),
  new THREE.Vector3(-2.0, -1.6, 0),
  new THREE.Vector3( 2.0, -1.6, 0),
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (module-level, not inside component — stable references)
// ─────────────────────────────────────────────────────────────────────────────

function buildEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const env = new THREE.Scene();
  const geo = new THREE.SphereGeometry(50, 32, 16);
  const pos = geo.attributes.position.array as Float32Array;
  const cols: number[] = [];
  for (let i = 0; i < pos.length; i += 3) {
    const t = (pos[i + 1] + 50) / 100;
    cols.push(0.18 + t * 0.74, 0.18 + t * 0.77, 0.22 + t * 0.78);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  env.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(28, 10),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  panel.position.set(0, 25, -15);
  panel.rotation.x = Math.PI * 0.25;
  env.add(panel);
  const tex = pmrem.fromScene(env).texture;
  pmrem.dispose();
  return tex;
}

function centreAndScale(group: THREE.Group) {
  // Reset scale to 1 first so Box3 measures raw geometry units
  group.scale.set(1, 1, 1);
  group.position.set(0, 0, 0);
  group.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(group);
  if (box.isEmpty()) {
    console.warn("[Three] bounding box empty");
    return;
  }
  const centre = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);

  // Translate each child so the group origin is at the model centroid
  group.children.forEach((c) => c.position.sub(centre));

  // Scale so the longest axis = 1.8 world units
  // Camera is at z=5 with FOV 32° → visible height at z=0 ≈ 2×5×tan(16°) ≈ 2.87
  // A model of size 1.8 fills ~63% of the screen height — visible but not clipping
  const TARGET = 1.8;
  group.scale.setScalar(TARGET / maxDim);

  console.log(
    `[Three] fitted: maxDim=${maxDim.toFixed(2)}  ` +
    `units scale=${(TARGET/maxDim).toFixed(4)}  ` +
    `size=(${size.x.toFixed(1)},${size.y.toFixed(1)},${size.z.toFixed(1)})`
  );
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

// ─────────────────────────────────────────────────────────────────────────────
// GlassCard
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      border: "1px solid rgba(255,255,255,0.13)",
      borderRadius: "20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ApwecPage() {
  const t = useTranslations("apwec");
  const openContact = useAppSelector((s) => s.siteState.openContact);
  // ── Three.js canvas div ───────────────────────────────────────────────────
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── Mutable scene state — never triggers re-renders ──────────────────────
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene:    THREE.Scene;
    camera:   THREE.PerspectiveCamera;
    clock:    THREE.Clock;
    rafId:    number;
    full:     THREE.Group | null;
    parts:    (THREE.Group | null)[];
    partPos:  THREE.Vector3[];
    // scroll-driven values (written by motion event listeners)
    rotX:        number;
    rotY:        number;
    rotZ:        number;
    scaleAll:    number;
    posY:        number;
    explodeFrac: number;
    showParts:   boolean;
    fittedScale: number;
  } | null>(null);

  // ── Boot Three.js ─────────────────────────────────────────────────────────
  useEffect(() => {
    const div = canvasRef.current;
    if (!div) { console.error("[Three] canvasRef is null"); return; }

    const W = window.innerWidth;
    const H = window.innerHeight;
    console.log("[Three] booting", W, "×", H);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace    = THREE.SRGBColorSpace;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    // The canvas itself is absolute inside the div — let CSS size it
    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.inset    = "0";
    canvas.style.width    = "100%";
    canvas.style.height   = "100%";
    div.appendChild(canvas);

    // Scene + camera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, W / H, 0.01, 500);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    // Environment
    const envTex = buildEnvMap(renderer);
    scene.environment = envTex;

    // Lights
    const key = new THREE.DirectionalLight(0xf0f4ff, 3.0);
    key.position.set(4, 8, 5);
    scene.add(key);
    scene.add(new THREE.DirectionalLight(0xffeedd, 0.9).position.set(-5, 2, 3) && new THREE.DirectionalLight(0xffeedd, 0.9));
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));

    // Shared aluminium material
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xd0d8e8, metalness: 1.0, roughness: 0.20,
      envMapIntensity: 3.5, clearcoat: 0.15, clearcoatRoughness: 0.25,
    });

    // State
    const state: NonNullable<typeof threeRef.current> = {
      renderer, scene, camera, clock: new THREE.Clock(), rafId: 0,
      full: null,
      parts: [null, null, null, null],
      partPos: EXPLODE_TARGETS.map(() => new THREE.Vector3()),
      rotX: 0, rotY: 0, rotZ: Math.PI / 4,
      scaleAll: 1.0, posY: -0.8,
      explodeFrac: 0, showParts: false,
      fittedScale: 1,  // set after OBJ loads — scale from centreAndScale
    };
    threeRef.current = state;

    // ── Load APWEC.obj ────────────────────────────────────────────────────
    console.log("[Three] fetching /APWEC.obj …");
    const loader = new OBJLoader();

    loader.load(
      "/APWEC.obj",
      (obj) => {
        console.log("[Three] OBJ loaded ✓");
        const full = new THREE.Group();
        let n = 0;
        obj.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            const m = (c as THREE.Mesh).clone();
            m.material = mat;
            full.add(m);
            n++;
          }
        });
        console.log(`[Three] ${n} meshes`);
        centreAndScale(full);
        // Store the scale that centreAndScale applied so the animate
        // loop can use it as a base multiplier instead of overwriting it
        state.fittedScale = full.scale.x;
        state.full = full;
        scene.add(full);
      },
      (xhr) => {
        if (xhr.total) {
          console.log(`[Three] OBJ progress: ${((xhr.loaded / xhr.total) * 100).toFixed(0)}%`);
        }
      },
      (err) => {
        console.error("[Three] OBJ load FAILED:", err);
      }
    );

    // ── Load 4 part files ─────────────────────────────────────────────────
    ["/APWEC_p1.obj", "/APWEC_p2.obj", "/APWEC_p3.obj", "/APWEC_p4.obj"].forEach((src, i) => {
      loader.load(src,
        (obj) => {
          console.log(`[Three] part ${i + 1} loaded ✓`);
          const g = new THREE.Group();
          obj.traverse((c) => {
            if ((c as THREE.Mesh).isMesh) {
              const m = (c as THREE.Mesh).clone();
              m.material = mat;
              g.add(m);
            }
          });
          centreAndScale(g);
          g.visible = false;
          state.parts[i] = g;
          scene.add(g);
        },
        undefined,
        (err) => console.warn(`[Three] part ${i + 1} failed (ok if file missing):`, err)
      );
    });

    // ── Render loop ───────────────────────────────────────────────────────
    function animate() {
      state.rafId = requestAnimationFrame(animate);
      const t2 = state.clock.getElapsedTime();
      const s  = threeRef.current!;

      if (s.full) {
        s.full.visible    = !s.showParts;
        s.full.rotation.x = s.rotX;
        s.full.rotation.y = s.rotY;
        s.full.rotation.z = s.rotZ;
        // scaleAll is a multiplier on top of the fitted scale:
        // at p=0 scaleAll=1.0 → fitted size; at p=1 scaleAll=0.55 → smaller
        const fitted = s.fittedScale ?? 1;
        s.full.scale.setScalar(fitted * s.scaleAll);
        s.full.position.y = s.posY + Math.sin(t2 * 0.5) * 0.05;
      }

      s.parts.forEach((p, i) => {
        if (!p) return;
        p.visible = s.showParts;
        if (!s.showParts) { s.partPos[i].set(0, 0, 0); return; }
        const target = EXPLODE_TARGETS[i].clone().multiplyScalar(s.explodeFrac);
        s.partPos[i].lerp(target, 0.10);
        p.position.copy(s.partPos[i]);
        p.rotation.x = s.rotX;
        p.rotation.y = s.rotY;
        const fittedP = s.fittedScale ?? 1;
        p.scale.setScalar(fittedP * s.scaleAll);
      });

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize ────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(state.rafId);
      ro.disconnect();
      renderer.dispose();
      envTex.dispose();
      mat.dispose();
      if (div.contains(canvas)) div.removeChild(canvas);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll ────────────────────────────────────────────────────────────────
  const progressMotion = useMotionValue(0);
  const [vhPx, setVhPx]  = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      const el = document.createElement("div");
      el.style.cssText = "position:fixed;top:0;left:0;width:1px;height:100dvh;pointer-events:none;visibility:hidden;";
      document.body.appendChild(el);
      setVhPx(el.getBoundingClientRect().height);
      document.body.removeChild(el);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const r = () => setWidth(window.innerWidth);
    r(); window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const isMobile = width <= 768;

  useEffect(() => {
    if (isTouchDevice()) {
      const fn = () => {
        const sy    = window.scrollY;
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        if (limit > 0) progressMotion.set(Math.min(SCENES, (sy / limit) * SCENES));
      };
      fn();
      window.addEventListener("scroll", fn, { passive: true });
      return () => window.removeEventListener("scroll", fn);
    }
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    let rafId = 0;
    const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", (e: { scroll: number; limit: number }) => {
      progressMotion.set(Math.min(SCENES, (e.scroll / e.limit) * SCENES));
    });
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, [progressMotion]);

  const smooth = useSpring(progressMotion, { stiffness: 300, damping: 30 });
  const vh = vhPx || 800; // never reference window here — may run on server

  const headerTheme = useTransform(smooth, [1.1, 1.3], [0, 1]);

  // ── Card inset/radius ─────────────────────────────────────────────────────
  const cardInset  = useTransform(smooth, [0, 0.5, 2.0, 2.5], [16, 0, 0, 16]);
  const cardRadius = useTransform(smooth, [0, 0.5, 2.0, 2.5], [24, 0, 0, 24]);
  const cardPad    = useTransform(cardInset,  (v) => `${v}px`);
  const cardRad    = useTransform(cardRadius, (v) => `${v}px`);
  const cardY      = useTransform(smooth, [2.0, 2.6], ["0vh", "-115vh"]);
  const cardOpacity = useTransform(smooth, [2.3, 2.6], [1, 0]);

  // ── Model state → Three.js ────────────────────────────────────────────────
  const rotX     = useTransform(smooth, [0, 0.5], [0, Math.PI]);
  const rotZ     = useTransform(smooth, [0, 0.5], [Math.PI / 4, 0]);
  const scaleAll = useTransform(smooth, [0.5, 1.0], [1.0, 0.55]);
  const posY     = useTransform(smooth, [0.5, 1.0], [-0.8, 0]);
  const explode  = useTransform(smooth, [1.0, 1.5, 1.5, 2.0], [0, 1, 1, 0]);
  const showP    = useTransform(smooth, (p) => p >= 1.0 && p < 2.05);

  useMotionValueEvent(rotX,     "change", (v) => { if (threeRef.current) threeRef.current.rotX = v; });
  useMotionValueEvent(rotZ,     "change", (v) => { if (threeRef.current) threeRef.current.rotZ = v; });
  useMotionValueEvent(scaleAll, "change", (v) => { if (threeRef.current) threeRef.current.scaleAll = v; });
  useMotionValueEvent(posY,     "change", (v) => { if (threeRef.current) threeRef.current.posY = v; });
  useMotionValueEvent(explode,  "change", (v) => { if (threeRef.current) threeRef.current.explodeFrac = v; });
  useMotionValueEvent(showP,    "change", (v) => { if (threeRef.current) threeRef.current.showParts = v; });

  // ── Background image fade ─────────────────────────────────────────────────
  const bgOpacity = useTransform(smooth, [1.85, 2.1], [0, 1]);

  // ── Slide texts ───────────────────────────────────────────────────────────
  function slide(enter: number, peak: number, exit: number) {
    return {
      opacity: useTransform(smooth, [enter, peak, exit - 0.06, exit], [0, 1, 1, 0]),
      y:       useTransform(smooth, [enter, peak, exit - 0.06, exit], [22, 0, 0, -18]),
    } as const;
  }
  const s0 = slide(0,   0.08, 0.45);
  const s1 = slide(0.5, 0.62, 0.95);
  const s2 = slide(1.0, 1.12, 1.45);
  const s3 = slide(1.5, 1.62, 1.95);
  const s4 = slide(2.0, 2.12, 2.40);

  let totalHeight = vh * (SCENES + 2);

  // NOTE: no early return here — canvasRef must always be in the DOM
  // so Three.js can mount. We hide content until vh is measured.
  const isReady = vhPx > 0;

  const sup: React.CSSProperties = {
    fontSize: "clamp(0.62rem,0.85vw,0.74rem)", fontWeight: 700,
    letterSpacing: "0.16em", textTransform: "uppercase",
    color: "rgba(180,210,255,0.58)", marginBottom: "0.6rem", display: "block",
  };
  const h1s: React.CSSProperties = {
    margin: 0, fontSize: "clamp(2rem,5vw,4.2rem)", fontWeight: 800,
    letterSpacing: "-0.03em", lineHeight: 1.0, color: "#f4f7fa",
  };
  const h2s: React.CSSProperties = {
    margin: "0.75rem 0 0", fontSize: "clamp(0.88rem,1.3vw,1.1rem)",
    fontWeight: 400, lineHeight: 1.65, color: "rgba(200,218,250,0.68)", maxWidth: "480px",
  };

  // totalHeight needs vh — use a safe fallback until measured
  totalHeight = isReady ? vh * (SCENES + 2) : 10000;

  return (
    <>
      {/* scroll spacer — always rendered so page has scrollable height */}
      <div style={{ height: totalHeight }} aria-hidden />

      <div className="absolute inset-x-0 top-0" style={{ height: totalHeight, zIndex: 1 }}>

      {!openContact && <Header headerTheme={headerTheme} />}
      {!openContact && <MenuButton />}

        {/* ── MAIN CARD ────────────────────────────────────────────────── */}
        <motion.div style={{ position:"fixed", inset:0, zIndex:10, padding:cardPad, y:cardY, opacity:cardOpacity }}>
          <motion.div style={{
            width:"100%", height:"100%", borderRadius:cardRad,
            overflow:"hidden", position:"relative",
            background:"linear-gradient(160deg,#080f36 0%,#0c1a52 55%,#050b26 100%)",
          }}>

            {/* bg image */}
            <motion.div style={{
              position:"absolute", inset:0,
              backgroundImage:"url(/apwec-bg.png)",
              backgroundSize:"cover", backgroundPosition:"center",
              opacity:bgOpacity,
            }} />
            <div style={{ position:"absolute", inset:0, background:"rgba(5,10,38,0.50)", pointerEvents:"none" }} />

            {/* ── Three.js canvas — ALWAYS in DOM so ref attaches ───────
                This div must never be conditionally rendered.
                Three.js mounts its <canvas> inside it on first useEffect.
            ──────────────────────────────────────────────────────── */}
            <div
              ref={canvasRef}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
              }}
            />

            {/* ── Slides ─────────────────────────────────────────────── */}
            <motion.div style={{ position:"absolute", top:"clamp(5rem,9vh,7rem)", left:0, right:0, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"0 clamp(1.5rem,4vw,4rem)", zIndex:3, pointerEvents:"none", ...s0 }}>
              <span style={sup}>{t("slide0.suptitle")}</span>
              <h1 style={h1s}>{t("slide0.title")}</h1>
              <p style={{ ...h2s, textAlign:"center", maxWidth:"560px" }}>{t("slide0.subtitle")}</p>
            </motion.div>

            <motion.div style={{ position:"absolute", top:"clamp(5rem,9vh,7rem)", left:"clamp(1.5rem,5vw,5rem)", maxWidth: isMobile?"90%":"48%", zIndex:3, pointerEvents:"none", ...s1 }}>
              <span style={sup}>{t("slide1.suptitle")}</span>
              <h1 style={h1s}>{t("slide1.title")}</h1>
              <p style={h2s}>{t("slide1.subtitle")}</p>
            </motion.div>

            <motion.div style={{ position:"absolute", top:"clamp(5rem,9vh,7rem)", left:"clamp(1.5rem,5vw,5rem)", maxWidth: isMobile?"90%":"48%", zIndex:3, pointerEvents:"none", ...s2 }}>
              <span style={sup}>{t("slide2.suptitle")}</span>
              <h1 style={h1s}>{t("slide2.title")}</h1>
              <p style={h2s}>{t("slide2.subtitle")}</p>
            </motion.div>

            <motion.div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", zIndex:3, pointerEvents:"none", ...s3 }}>
              <span style={{ ...sup, textAlign:"center" }}>{t("slide3.suptitle")}</span>
              <h1 style={{ ...h1s, fontSize:"clamp(1.6rem,3.5vw,3rem)" }}>{t("slide3.title")}</h1>
              <p style={{ ...h2s, textAlign:"center", maxWidth:"360px", margin:"0.75rem auto 0" }}>{t("slide3.subtitle")}</p>
            </motion.div>

            <motion.div style={{ position:"absolute", top:"clamp(5rem,9vh,7rem)", right:"clamp(1.5rem,5vw,5rem)", maxWidth: isMobile?"90%":"42%", textAlign:"right", zIndex:3, pointerEvents:"none", ...s4 }}>
              <span style={{ ...sup, textAlign:"right" }}>{t("slide4.suptitle")}</span>
              <h1 style={h1s}>{t("slide4.title")}</h1>
              <p style={{ ...h2s, marginLeft:"auto" }}>{t("slide4.subtitle")}</p>
            </motion.div>

          </motion.div>
        </motion.div>

        {/* ── STATIC CONTENT ───────────────────────────────────────────── */}
        <div style={{
          position:"absolute", top: vh * (SCENES - 0.5), left:0, right:0, zIndex:11,
          background:"linear-gradient(180deg,#0a1540 0%,#0d1d5e 20%,#081230 100%)",
          padding:"clamp(5rem,10vh,8rem) clamp(1.5rem,8vw,8rem)",
        }}>

          {/* intro */}
          <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-80px" }} transition={{ duration:0.7, ease:[0.22,1,0.36,1] }} style={{ marginBottom:"clamp(4rem,7vh,6rem)" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", marginBottom:"2rem" }}>
              <div style={{ width:"28px", height:"1px", background:"rgba(160,196,255,0.5)" }} />
              <span style={{ fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(160,196,255,0.7)" }}>{t("static.label")}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:"clamp(2rem,4vw,4rem)", alignItems:"start" }}>
              <h2 style={{ margin:0, fontSize:"clamp(2rem,4vw,3.5rem)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.0, color:"#f4f7fa" }}>{t("static.title")}</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                <p style={{ margin:0, fontSize:"clamp(0.9rem,1.3vw,1.05rem)", lineHeight:1.7, color:"rgba(200,218,250,0.72)" }}>{t("static.p1")}</p>
                <p style={{ margin:0, fontSize:"clamp(0.9rem,1.3vw,1.05rem)", lineHeight:1.7, color:"rgba(200,218,250,0.72)" }}>{t("static.p2")}</p>
              </div>
            </div>
          </motion.div>

          {/* features */}
          <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"repeat(3,1fr)", gap:"clamp(1rem,2vw,1.4rem)", marginBottom:"clamp(4rem,7vh,6rem)" }}>
            {(["f0","f1","f2"] as const).map((k, i) => (
              <motion.div key={k} initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-60px" }} transition={{ duration:0.6, delay:i*0.1, ease:[0.22,1,0.36,1] }}>
                <GlassCard style={{ padding:"clamp(1.4rem,2.5vw,2.2rem)", height:"100%" }}>
                  <p style={{ margin:"0 0 0.5rem", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(100,150,255,0.75)" }}>{t(`static.${k}.label`)}</p>
                  <h3 style={{ margin:"0 0 0.6rem", fontSize:"clamp(1.1rem,1.8vw,1.4rem)", fontWeight:700, color:"#f4f7fa" }}>{t(`static.${k}.title`)}</h3>
                  <p style={{ margin:0, fontSize:"clamp(0.82rem,1.1vw,0.95rem)", lineHeight:1.65, color:"rgba(200,218,250,0.62)" }}>{t(`static.${k}.description`)}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true, margin:"-40px" }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}>
            <GlassCard style={{ padding:"clamp(2rem,4vw,3rem)", display:"flex", flexDirection: isMobile?"column":"row", alignItems: isMobile?"flex-start":"center", justifyContent:"space-between", gap:"2rem" }}>
              <div>
                <h3 style={{ margin:"0 0 0.4rem", fontSize:"clamp(1.2rem,2vw,1.8rem)", fontWeight:700, color:"#f4f7fa" }}>{t("static.cta.title")}</h3>
                <p style={{ margin:0, fontSize:"clamp(0.85rem,1.2vw,1rem)", color:"rgba(200,218,250,0.60)", lineHeight:1.6 }}>{t("static.cta.subtitle")}</p>
              </div>
              <a href="/contatti" style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"12px 28px", borderRadius:"100px", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.22)", color:"#f4f7fa", fontSize:"clamp(0.82rem,1vw,0.92rem)", fontWeight:600, letterSpacing:"0.05em", textDecoration:"none", whiteSpace:"nowrap" }}>
                {t("static.cta.link")} ↗
              </a>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </>
  );
}