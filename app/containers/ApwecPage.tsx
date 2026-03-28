"use client";

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
import { GLTFLoader }  from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { useTranslations } from "next-intl";
import Header from "../components/Header";
import MenuButton from "../components/MenuButton";
import { useAppDispatch, useAppSelector } from "../hooks";
import ContactDrawer from "../components/ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";

const SCENES = 6;

const EXPLODE_TARGETS = [
  new THREE.Vector3(-1.6,  1.2, 0),
  new THREE.Vector3( 1.6,  1.2, 0),
  new THREE.Vector3(-1.6, -1.2, 0),
  new THREE.Vector3( 1.6, -1.2, 0),
];

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
  geo.dispose();
  return tex;
}

function centreAndScale(group: THREE.Group, isMobile: boolean) {
  group.scale.set(1, 1, 1);
  group.position.set(0, 0, 0);
  group.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(group);
  if (box.isEmpty()) return;
  const centre = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  group.children.forEach((c) => c.position.sub(centre));
  // Mobile: slightly smaller to not overflow, desktop: larger
  const TARGET = isMobile ? 1.3 : 1.8;
  group.scale.setScalar(TARGET / maxDim);
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

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

export default function ApwecPage() {
  const t           = useTranslations("apwec");
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const dispatch    = useAppDispatch();
  const canvasRef   = useRef<HTMLDivElement>(null);

  const threeRef = useRef<{
    renderer:    THREE.WebGLRenderer;
    scene:       THREE.Scene;
    camera:      THREE.PerspectiveCamera;
    clock:       THREE.Clock;
    rafId:       number;
    full:        THREE.Group | null;
    parts:       (THREE.Group | null)[];
    partPos:     THREE.Vector3[];
    rotX:        number;
    rotY:        number;
    rotZ:        number;
    scaleAll:    number;
    posY:        number;
    posX:        number;
    explodeFrac: number;
    showParts:   boolean;
    fittedScale: number;
    isMobile:    boolean;
    visible:     boolean;
  } | null>(null);

  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const isMobile = width <= 768;

  useEffect(() => {
    const r = () => setWidth(window.innerWidth);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  // ── Boot Three.js ─────────────────────────────────────────────────────────
  useEffect(() => {
    const div = canvasRef.current;
    if (!div) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const mobile = W <= 768;

    const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true });
    // Lower DPR on mobile for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace    = THREE.SRGBColorSpace;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    const canvas = renderer.domElement;
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    div.appendChild(canvas);

    const scene  = new THREE.Scene();
    // Slightly closer FOV on mobile so model fills more screen
    const fov    = mobile ? 38 : 32;
    const camera = new THREE.PerspectiveCamera(fov, W / H, 0.01, 500);
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const envTex = buildEnvMap(renderer);
    scene.environment = envTex;

    const key = new THREE.DirectionalLight(0xf0f4ff, 3.0);
    key.position.set(4, 8, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffeedd, 0.9);
    fill.position.set(-5, 2, 3);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xd0d8e8, metalness: 1.0, roughness: 0.20,
      envMapIntensity: 3.5, clearcoat: 0.15, clearcoatRoughness: 0.25,
    });

    const state: NonNullable<typeof threeRef.current> = {
      renderer, scene, camera, clock: new THREE.Clock(), rafId: 0,
      full: null,
      parts: [null, null, null, null],
      partPos: EXPLODE_TARGETS.map(() => new THREE.Vector3()),
      rotX: 0, rotY: 0, rotZ: Math.PI / 4,
      scaleAll: 1.0,
      // On mobile shift model down slightly so text above has room
      posY: mobile ? -0.4 : -0.8,
      // On mobile center model, on desktop offset slightly right
      posX: 0,
      explodeFrac: 0, showParts: false,
      fittedScale: 1,
      isMobile: mobile,
      visible: true,
    };
    threeRef.current = state;

    // ── GLTFLoader + DRACOLoader ──────────────────────────────────────────
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "/apwec-draco.glb",
      (gltf) => {
        const full = new THREE.Group();
        gltf.scene.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            const m = (c as THREE.Mesh).clone();
            m.material = mat;
            full.add(m);
          }
        });
        centreAndScale(full, mobile);
        state.fittedScale = full.scale.x;
        state.full = full;
        scene.add(full);
        dracoLoader.dispose();
      },
      undefined,
      (err) => console.error("[Three] GLB load failed:", err)
    );

    // ── Render loop ───────────────────────────────────────────────────────
    function animate() {
      state.rafId = requestAnimationFrame(animate);
      // Skip render when model is not visible (saves battery on mobile)
      if (!state.visible) return;

      const elapsed = state.clock.getElapsedTime();
      const s = threeRef.current!;

      if (s.full) {
        s.full.visible    = !s.showParts;
        s.full.rotation.x = s.rotX;
        s.full.rotation.y = s.rotY;
        s.full.rotation.z = s.rotZ;
        const fitted = s.fittedScale ?? 1;
        s.full.scale.setScalar(fitted * s.scaleAll);
        s.full.position.x = s.posX;
        s.full.position.y = s.posY + Math.sin(elapsed * 0.5) * (s.isMobile ? 0.03 : 0.05);
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
        p.scale.setScalar((s.fittedScale ?? 1) * s.scaleAll);
      });

      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // Update mobile flag live
      if (threeRef.current) threeRef.current.isMobile = w <= 768;
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
  const [vhPx, setVhPx] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const measure = () => {
      const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setVhPx(h);
    };
    const debounced = () => { clearTimeout(timer); timer = setTimeout(measure, 150); };
    measure();
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", debounced);
    }
    window.addEventListener("resize", debounced);
    return () => {
      clearTimeout(timer);
      if (window.visualViewport) window.visualViewport.removeEventListener("resize", debounced);
      window.removeEventListener("resize", debounced);
    };
  }, []);

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

  // Spring solo su desktop — su mobile progressMotion diretto = zero latenza
  const springValue = useSpring(progressMotion, { stiffness: 300, damping: 30 });
  const smooth = isMobile ? progressMotion : springValue;

  const vh = vhPx || 800;
  const totalHeight = vhPx > 0 ? vh * (SCENES + 2) : 10000;

  const headerTheme = useTransform(smooth, [1.1, 1.3], [0, 1]);

  // ── Card ──────────────────────────────────────────────────────────────────
  const cardInset   = useTransform(smooth, [0, 0.5, 2.0, 2.5], [16, 0, 0, 16]);
  const cardRadius  = useTransform(smooth, [0, 0.5, 2.0, 2.5], [24, 0, 0, 24]);
  const cardPad     = useTransform(cardInset,  (v) => `${v}px`);
  const cardRad     = useTransform(cardRadius, (v) => `${v}px`);
  const cardY       = useTransform(smooth, [2.0, 2.6], ["0vh", "-115vh"]);
  const cardOpacity = useTransform(smooth, [2.3, 2.6], [1, 0]);

  // ── Model → Three.js ──────────────────────────────────────────────────────
  const rotX     = useTransform(smooth, [0, 0.5], [0, Math.PI]);
  const rotZ     = useTransform(smooth, [0, 0.5], [Math.PI / 4, 0]);
  const scaleAll = useTransform(smooth, [0.5, 1.0], [1.0, 0.55]);
  // Mobile: model stays centered; desktop: slides slightly left during explode
  const posX     = useTransform(smooth, [0.5, 1.0], [0, isMobile ? 0 : -0.3]);
  const posY     = useTransform(smooth, [0.5, 1.0], [isMobile ? -0.4 : -0.8, 0]);
  const explode  = useTransform(smooth, [1.0, 1.5, 1.5, 2.0], [0, 1, 1, 0]);
  const showP    = useTransform(smooth, (p) => p >= 1.0 && p < 2.05);
  // Pause Three.js when model is off screen
  const visibleMV = useTransform(smooth, (p) => p < 2.5);

  useMotionValueEvent(rotX,      "change", (v) => { if (threeRef.current) threeRef.current.rotX = v; });
  useMotionValueEvent(rotZ,      "change", (v) => { if (threeRef.current) threeRef.current.rotZ = v; });
  useMotionValueEvent(scaleAll,  "change", (v) => { if (threeRef.current) threeRef.current.scaleAll = v; });
  useMotionValueEvent(posX,      "change", (v) => { if (threeRef.current) threeRef.current.posX = v; });
  useMotionValueEvent(posY,      "change", (v) => { if (threeRef.current) threeRef.current.posY = v; });
  useMotionValueEvent(explode,   "change", (v) => { if (threeRef.current) threeRef.current.explodeFrac = v; });
  useMotionValueEvent(showP,     "change", (v) => { if (threeRef.current) threeRef.current.showParts = v; });
  useMotionValueEvent(visibleMV, "change", (v) => { if (threeRef.current) threeRef.current.visible = v; });

  const bgOpacity = useTransform(smooth, [1.85, 2.1], [0, 1]);

  // ── Slide helper ──────────────────────────────────────────────────────────
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

  // ── Styles ────────────────────────────────────────────────────────────────
  const sup: React.CSSProperties = {
    fontSize: "clamp(0.62rem,0.85vw,0.74rem)", fontWeight: 700,
    letterSpacing: "0.16em", textTransform: "uppercase",
    color: "rgba(180,210,255,0.58)", marginBottom: "0.6rem", display: "block",
  };
  const h1s: React.CSSProperties = {
    margin: 0,
    fontSize: isMobile ? "clamp(1.6rem,7vw,2.4rem)" : "clamp(2rem,5vw,4.2rem)",
    fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.0, color: "#f4f7fa",
  };
  const h2s: React.CSSProperties = {
    margin: "0.75rem 0 0",
    fontSize: isMobile ? "clamp(0.82rem,3.5vw,1rem)" : "clamp(0.88rem,1.3vw,1.1rem)",
    fontWeight: 400, lineHeight: 1.65, color: "rgba(200,218,250,0.68)",
    maxWidth: isMobile ? "100%" : "480px",
  };

  // On mobile, text goes to BOTTOM of screen so model is fully visible above
  const slideBase: React.CSSProperties = isMobile
    ? { position: "absolute", bottom: "clamp(2rem,5vh,4rem)", left: 0, right: 0, padding: "0 clamp(1.2rem,5vw,2rem)", zIndex: 3, pointerEvents: "none" }
    : { position: "absolute", top: "clamp(5rem,9vh,7rem)", zIndex: 3, pointerEvents: "none" };

  return (
    <>
      <div style={{ height: totalHeight }} aria-hidden />

      <div className="absolute inset-x-0 top-0" style={{ height: totalHeight, zIndex: 1 }}>

        {!openContact && <Header headerTheme={headerTheme} />}
        {!openContact && <MenuButton />}

        {/* ── MAIN CARD ────────────────────────────────────────────────── */}
        <motion.div style={{ position: "fixed", inset: 0, zIndex: 10, padding: cardPad, y: cardY, opacity: cardOpacity }}>
          <motion.div style={{
            width: "100%", height: "100%", borderRadius: cardRad,
            overflow: "hidden", position: "relative",
            background: "linear-gradient(160deg, #1c398e 0%, #0070f3 55%, #050b26 100%)",
          }}>

            {/* bg image */}
            <motion.div style={{
              position: "absolute", inset: 0,
              backgroundImage: "url(/apwec-bg.png)",
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: bgOpacity,
            }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(5,10,38,0.50)", pointerEvents: "none" }} />

            {/* Three.js canvas */}
            <div ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

            {/* ── Slide 0 — centered top, model below ─────────────────── */}
            <motion.div style={{
              ...slideBase,
              ...(isMobile ? {} : { left: 0, right: 0, top: "clamp(5rem,9vh,7rem)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }),
              ...s0,
            }}>
              <span style={sup}>{t("slide0.suptitle")}</span>
              <h1 style={h1s}>{t("slide0.title")}</h1>
              <p style={{ ...h2s, textAlign: isMobile ? "left" : "center", maxWidth: isMobile ? "100%" : "560px" }}>{t("slide0.subtitle")}</p>
            </motion.div>

            {/* ── Slide 1 — left aligned ───────────────────────────────── */}
            <motion.div style={{
              ...slideBase,
              ...(isMobile ? {} : { left: "clamp(1.5rem,5vw,5rem)", maxWidth: "48%" }),
              ...s1,
            }}>
              <span style={sup}>{t("slide1.suptitle")}</span>
              <h1 style={h1s}>{t("slide1.title")}</h1>
              <p style={h2s}>{t("slide1.subtitle")}</p>
            </motion.div>

            {/* ── Slide 2 — left aligned ───────────────────────────────── */}
            <motion.div style={{
              ...slideBase,
              ...(isMobile ? {} : { left: "clamp(1.5rem,5vw,5rem)", maxWidth: "48%" }),
              ...s2,
            }}>
              <span style={sup}>{t("slide2.suptitle")}</span>
              <h1 style={h1s}>{t("slide2.title")}</h1>
              <p style={h2s}>{t("slide2.subtitle")}</p>
            </motion.div>

            {/* ── Slide 3 — centered (explode view) ───────────────────── */}
            <motion.div style={{
              ...slideBase,
              ...(isMobile ? {} : { left: "50%", top: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }),
              ...s3,
            }}>
              <span style={{ ...sup, textAlign: isMobile ? "left" : "center" }}>{t("slide3.suptitle")}</span>
              <h1 style={{ ...h1s, fontSize: isMobile ? "clamp(1.4rem,6vw,2rem)" : "clamp(1.6rem,3.5vw,3rem)" }}>{t("slide3.title")}</h1>
              <p style={{ ...h2s, textAlign: isMobile ? "left" : "center", maxWidth: isMobile ? "100%" : "360px", margin: isMobile ? "0.75rem 0 0" : "0.75rem auto 0" }}>{t("slide3.subtitle")}</p>
            </motion.div>

            {/* ── Slide 4 — right aligned on desktop, bottom on mobile ── */}
            <motion.div style={{
              ...slideBase,
              ...(isMobile ? {} : { right: "clamp(1.5rem,5vw,5rem)", maxWidth: "42%", textAlign: "right" }),
              ...s4,
            }}>
              <span style={{ ...sup, textAlign: isMobile ? "left" : "right" }}>{t("slide4.suptitle")}</span>
              <h1 style={h1s}>{t("slide4.title")}</h1>
              <p style={{ ...h2s, marginLeft: isMobile ? 0 : "auto" }}>{t("slide4.subtitle")}</p>
            </motion.div>

          </motion.div>
        </motion.div>

        {/* ── STATIC CONTENT ───────────────────────────────────────────── */}
        <div style={{
          position: "absolute", top: vh * (SCENES - 0.5), left: 0, right: 0, zIndex: 11,
          background: "linear-gradient(160deg, #1c398e 0%, #0070f3 55%, #050b26 100%)",
          padding: "clamp(5rem,10vh,8rem) clamp(1.5rem,8vw,8rem)",
        }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: "clamp(4rem,7vh,6rem)" }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "2rem" }}>
              <div style={{ width: "28px", height: "1px", background: "rgba(160,196,255,0.5)" }} />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(160,196,255,0.7)" }}>{t("static.label")}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "clamp(2rem,4vw,4rem)", alignItems: "start" }}>
              <h2 style={{ margin: 0, fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.0, color: "#f4f7fa" }}>{t("static.title")}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ margin: 0, fontSize: "clamp(0.9rem,1.3vw,1.05rem)", lineHeight: 1.7, color: "rgba(200,218,250,0.72)" }}>{t("static.p1")}</p>
                <p style={{ margin: 0, fontSize: "clamp(0.9rem,1.3vw,1.05rem)", lineHeight: 1.7, color: "rgba(200,218,250,0.72)" }}>{t("static.p2")}</p>
              </div>
            </div>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: "clamp(1rem,2vw,1.4rem)", marginBottom: "clamp(4rem,7vh,6rem)" }}>
            {(["f0", "f1", "f2"] as const).map((k, i) => (
              <motion.div key={k}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <GlassCard style={{ padding: "clamp(1.4rem,2.5vw,2.2rem)", height: "100%" }}>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(100,150,255,0.75)" }}>{t(`static.${k}.label`)}</p>
                  <h3 style={{ margin: "0 0 0.6rem", fontSize: "clamp(1.1rem,1.8vw,1.4rem)", fontWeight: 700, color: "#f4f7fa" }}>{t(`static.${k}.title`)}</h3>
                  <p style={{ margin: 0, fontSize: "clamp(0.82rem,1.1vw,0.95rem)", lineHeight: 1.65, color: "rgba(200,218,250,0.62)" }}>{t(`static.${k}.description`)}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassCard style={{ padding: "clamp(2rem,4vw,3rem)", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: "2rem" }}>
              <div>
                <h3 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.2rem,2vw,1.8rem)", fontWeight: 700, color: "#f4f7fa" }}>{t("static.cta.title")}</h3>
                <p style={{ margin: 0, fontSize: "clamp(0.85rem,1.2vw,1rem)", color: "rgba(200,218,250,0.60)", lineHeight: 1.6 }}>{t("static.cta.subtitle")}</p>
              </div>
              <a href="/contatti" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 28px", borderRadius: "100px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", color: "#f4f7fa", fontSize: "clamp(0.82rem,1vw,0.92rem)", fontWeight: 600, letterSpacing: "0.05em", textDecoration: "none", whiteSpace: "nowrap" }}>
                {t("static.cta.link")} ↗
              </a>
            </GlassCard>
          </motion.div>
        </div>

        <ContactDrawer
          open={openContact}
          onClose={() => {
            dispatch(setOpenContact(false));
            dispatch(setNavigationState(0));
          }}
        />
      </div>
    </>
  );
}