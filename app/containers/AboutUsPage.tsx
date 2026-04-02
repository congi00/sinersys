"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
} from "framer-motion";
import Lenis from "@studio-freight/lenis";
import { useTranslations } from "next-intl";
import { detectIOS } from "../support/useViewportHeight";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MenuButton from "../components/MenuButton";
import { useAppDispatch, useAppSelector } from "../hooks";
import ContactDrawer from "../components/ContactDrawer";
import { setNavigationState, setOpenContact } from "../features/counterSlice";

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

function FadeIn({ children, delay = 0, direction = "up" }: {
  children: React.ReactNode; delay?: number; direction?: "up"|"left"|"right"|"none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  const yMap = { up:40, down:-40, left:0, right:0, none:0 };
  const xMap = { up:0, down:0, left:60, right:-60, none:0 };
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, y:yMap[direction], x:xMap[direction] }}
      animate={inView ? { opacity:1, y:0, x:0 } : {}}
      transition={{ duration:0.65, delay, ease:[0.22,1,0.36,1] }}
    >{children}</motion.div>
  );
}

function GlassCard({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.07)", backdropFilter:"blur(24px) saturate(160%)", WebkitBackdropFilter:"blur(24px) saturate(160%)", border:"1px solid rgba(255,255,255,0.16)", borderRadius:"20px", boxShadow:"0 8px 32px rgba(12,24,70,0.22), inset 0 1px 0 rgba(255,255,255,0.14)", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", marginBottom:"clamp(2.5rem,5vh,4rem)" }}>
      <div style={{ width:"28px", height:"1px", background:"rgba(160,196,255,0.5)" }} />
      <span style={{ fontSize:"clamp(0.65rem,0.9vw,0.75rem)", fontWeight:700, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(160,196,255,0.7)" }}>{label}</span>
    </div>
  );
}

function TimelineItem({ index, year, title, description, isLast }: {
  index:number; year:string; title:string; description:string; isLast:boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-60px 0px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, x: index%2===0 ? -50 : 50 }}
      animate={inView ? { opacity:1, x:0 } : {}}
      transition={{ duration:0.7, delay:0.1, ease:[0.22,1,0.36,1] }}
      style={{ display:"flex", gap:"clamp(1.5rem,4vw,3rem)", paddingBottom: isLast ? 0 : "clamp(3rem,6vh,5rem)", position:"relative" }}
    >
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0, width:"clamp(60px,10vw,90px)" }}>
        <div style={{ background:"rgba(28,57,142,0.85)", border:"1px solid rgba(100,150,255,0.35)", borderRadius:"10px", padding:"6px 12px", fontSize:"clamp(0.65rem,1vw,0.78rem)", fontWeight:700, letterSpacing:"0.06em", color:"#a0c4ff", whiteSpace:"nowrap", backdropFilter:"blur(8px)" }}>{year}</div>
        {!isLast && (
          <motion.div initial={{ scaleY:0 }} animate={inView ? { scaleY:1 } : {}}
            transition={{ duration:0.8, delay:0.3, ease:"easeOut" }}
            style={{ width:"1px", flexGrow:1, marginTop:"12px", background:"linear-gradient(to bottom,rgba(100,150,255,0.4),rgba(100,150,255,0.05))", transformOrigin:"top" }}
          />
        )}
      </div>
      <div style={{ paddingTop:"4px", flex:1 }}>
        <div style={{ fontSize:"clamp(0.6rem,0.85vw,0.72rem)", fontWeight:700, letterSpacing:"0.18em", color:"rgba(160,196,255,0.45)", marginBottom:"0.4rem" }}>
          {String(index+1).padStart(2,"0")}
        </div>
        <GlassCard style={{ padding:"clamp(1.2rem,2.5vw,2rem)" }}>
          <h3 style={{ margin:0, fontSize:"clamp(1.1rem,2vw,1.5rem)", fontWeight:700, letterSpacing:"-0.015em", color:"#f4f7fa", marginBottom:"0.6rem" }}>{title}</h3>
          <p style={{ margin:0, fontSize:"clamp(0.85rem,1.2vw,1rem)", lineHeight:1.65, color:"rgba(200,218,250,0.72)" }}>{description}</p>
        </GlassCard>
      </div>
    </motion.div>
  );
}

function TeamCard({ name, role, bio, index, photo }: {
  name:string; role:string; bio:string; index:number; photo?:string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once:true, margin:"-40px 0px" });
  const [hovered, setHovered] = useState(false);
  const initials = name.split(" ").map((w)=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <motion.div ref={ref}
      initial={{ opacity:0, y:50 }}
      animate={inView ? { opacity:1, y:0 } : {}}
      transition={{ duration:0.6, delay:index*0.08, ease:[0.22,1,0.36,1] }}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
    >
      <motion.div animate={{ y:hovered?-6:0, scale:hovered?1.02:1 }} transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}>
        <GlassCard style={{ padding:"clamp(1.4rem,2.5vw,2rem)", position:"relative", overflow:"hidden" }}>
          <motion.div animate={{ opacity:hovered?1:0 }} transition={{ duration:0.3 }}
            style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(28,57,142,0.25) 0%,transparent 60%)", pointerEvents:"none", borderRadius:"20px" }}
          />
          <div style={{ width:"clamp(56px,8vw,72px)", height:"clamp(56px,8vw,72px)", borderRadius:"50%", marginBottom:"1rem", overflow:"hidden", border:"2px solid rgba(100,150,255,0.25)", background: photo?"transparent":"linear-gradient(135deg,rgba(28,57,142,0.8),rgba(42,82,201,0.6))", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {photo
              ? <img src={photo} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> // eslint-disable-line
              : <span style={{ fontSize:"clamp(1rem,1.8vw,1.3rem)", fontWeight:700, color:"rgba(180,210,255,0.9)" }}>{initials}</span>
            }
          </div>
          <h3 style={{ margin:0, fontSize:"clamp(1rem,1.6vw,1.2rem)", fontWeight:700, letterSpacing:"-0.01em", color:"#f4f7fa", marginBottom:"0.2rem" }}>{name}</h3>
          <p style={{ margin:"0 0 0.8rem", fontSize:"clamp(0.65rem,0.9vw,0.78rem)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(100,150,255,0.8)" }}>{role}</p>
          <div style={{ height:"1px", background:"rgba(255,255,255,0.08)", marginBottom:"0.8rem" }} />
          <p style={{ margin:0, fontSize:"clamp(0.78rem,1.1vw,0.9rem)", lineHeight:1.65, color:"rgba(200,218,250,0.65)" }}>{bio}</p>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

export default function AboutUsPage() {
  const t           = useTranslations("aboutus");
  const openContact = useAppSelector((s) => s.siteState.openContact);
  const isIOS       = detectIOS();
  const dispatch    = useAppDispatch();

  const progressMotion = useMotionValue(0);
  const [vhPx, setVhPx]   = useState(0);
  const [width, setWidth]  = useState(0);
  const [contentH, setContentH] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const el = document.createElement("div");
      el.style.cssText = `position:fixed;top:0;left:0;width:1px;height:100${isIOS?"lvh":"dvh"};pointer-events:none;visibility:hidden;`;
      document.body.appendChild(el);
      setVhPx(el.getBoundingClientRect().height);
      document.body.removeChild(el);
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => { window.removeEventListener("resize", measure); window.removeEventListener("orientationchange", measure); };
  }, [isIOS]);

  useEffect(() => {
    const r = () => setWidth(window.innerWidth);
    r(); window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver(() => {
      if (contentRef.current) setContentH(contentRef.current.scrollHeight);
    });
    ro.observe(contentRef.current);
    setContentH(contentRef.current.scrollHeight);
    return () => ro.disconnect();
  }, []);

  const isMobile = width <= 768;

  useEffect(() => {
    if (isTouchDevice()) {
      const onScroll = () => {
        const sy    = window.scrollY;
        const limit = document.documentElement.scrollHeight - window.innerHeight;
        if (limit > 0) progressMotion.set(Math.min(6, (sy / limit) * 6));
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive:true });
      return () => window.removeEventListener("scroll", onScroll);
    }
    const lenis = new Lenis({ duration:1.2, smoothWheel:true });
    let rafId = 0;
    const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    lenis.on("scroll", (e: { scroll:number; limit:number }) => {
      progressMotion.set(Math.min(6, (e.scroll / e.limit) * 6));
    });
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, [progressMotion]);

  const smooth = useSpring(progressMotion, { stiffness:280, damping:28 });
  const vh     = vhPx || 1;

  // ── Hero scroll timeline ──────────────────────────────────────────────────
  const heroInset  = useTransform(smooth, [0, 0.4, 0.8, 1.3], [16, 0, 0, 16]);
  const heroRadius = useTransform(smooth, [0, 0.4, 0.8, 1.3], [24, 0, 0, 24]);
  const heroPad    = useTransform(heroInset,  (v) => `${v}px`);
  const heroRad    = useTransform(heroRadius, (v) => `${v}px`);
  const heroY      = useTransform(smooth, [0.8, 1.3], ["0vh", "-115vh"]);
  const heroOp     = useTransform(smooth, [1.1, 1.3], [1, 0]);

  const slide0Opacity = useTransform(smooth, [0, 0, 0.35, 0.5], [0, 1, 1, 0]);
  const slide0Y       = useTransform(smooth, [0, 0, 0.35, 0.5], [20, 0, 0, -30]);
  const slide1Opacity = useTransform(smooth, [0.4, 0.6, 1.0, 1.2], [0, 1, 1, 0]);
  const slide1Y       = useTransform(smooth, [0.4, 0.6, 1.0, 1.2], [30, 0, 0, -30]);

  const headerTheme  = useTransform(smooth, [1.2, 1.4], [0, 0]);
  const gradientPage = useTransform(smooth, [0, 1.3, 1.4], ["#F4F7FA", "#F4F7FA", "linear-gradient(160deg, #1c398e 0%, #0070f3 55%, #050b26 100%)"]);
  const bodyBg       = useTransform(smooth, [0, 1.3, 1.3, 4.9 ,5.0], ["#F4F7FA", "#F4F7FA", "linear-gradient(160deg, rgb(28, 57, 142) 29%, rgb(0, 112, 243) 71%, rgb(5, 11, 38) 100%)", "linear-gradient(160deg, rgb(28, 57, 142) 29%, rgb(0, 112, 243) 71%, rgb(5, 11, 38) 100%)", "#F4F7FA"]);
  const h2Color      = useTransform(smooth, [0, 1.3, 1.3], ["#1c398e", "#1c398e", "#f4f7fa"]);
  const pcolor       = useTransform(smooth, [0, 1.3, 1.3], ["#1c398e", "#1c398e", "rgba(200,218,250,0.75)"]);

  const CONTENT_TOP = vh * 2.0;
  const totalHeight = CONTENT_TOP + (contentH > 0 ? contentH : vh * 4.6);

  // ── Content card exit animation (inset + border-radius before footer) ─────
  // We use scroll progress mapped to the last ~15% of the page.
  // At p=5.0 → no inset, no radius. At p=5.6 → inset 16px, radius 24px.
  const contentInset  = useTransform(smooth, [5.0, 5.6], [0, 16]);
  const contentRadius = useTransform(smooth, [5.0, 5.6], [0, 24]);
  const contentScale = useTransform(smooth, [5.0, 5.6], [1, 0.96]);
  const contentY     = useTransform(smooth, [5.0, 5.6], [0, -20]);
  const contentBR     = useTransform(contentRadius, (v) => `${v}px`);

  if (vhPx === 0) return <div className="min-h-screen bg-[#0f2057]" />;

  const timeline = [
    { key:"t2018", year:"2018" }, { key:"t2019", year:"2019" },
    { key:"t2020", year:"2020" }, { key:"t2021", year:"2021" },
    { key:"t2022", year:"2022" }, { key:"t2023", year:"2023" },
    { key:"t2024", year:"2024" },
  ];

  const team = [
    { key:"member0", photo:"/team/1.jpg" },
    { key:"member1", photo:"/team/2.jpg" },
    { key:"member2", photo:"/team/3.jpg" },
  ];

  return (
    <>
      <motion.div style={{ height: totalHeight }} aria-hidden />

      <motion.div className="absolute inset-x-0 top-0" style={{ height: totalHeight, zIndex:1, background: bodyBg, }}>

        {!openContact && <Header headerTheme={headerTheme} />}
        {!openContact && <MenuButton />}

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <motion.div style={{ position:"fixed", inset:0, zIndex:10, padding:heroPad, y:heroY, opacity:heroOp }}>
          <motion.div style={{ width:"100%", height:"100%", borderRadius:heroRad, overflow:"hidden", position:"relative" }}>
            <img src="/aboutus.png" alt="" // eslint-disable-line
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}
            />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(6,12,44,0.50) 0%,rgba(6,12,44,0.35) 40%,rgba(6,12,44,0.68) 100%)" }} />

            {/* Slide 0 */}
            <motion.div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"clamp(2rem,6vw,5rem)", textAlign:"center", opacity:slide0Opacity, y:slide0Y, pointerEvents:"none" }}>
              <p style={{ margin:"0 0 1rem", fontSize:"clamp(0.68rem,1vw,0.82rem)", fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"rgba(180,210,255,0.7)" }}>
                {t("hero.suptitle")}
              </p>
              <h1 style={{ margin:0, fontSize:"clamp(2.8rem,7vw,6rem)", fontWeight:800, lineHeight:0.95, letterSpacing:"-0.03em", color:"#f4f7fa", marginBottom:"1.2rem", maxWidth:"820px" }}>
                {t("hero.title")}
              </h1>
              <p style={{ margin:0, fontSize:"clamp(1rem,1.6vw,1.3rem)", lineHeight:1.6, color:"rgba(200,218,250,0.78)", maxWidth:"560px" }}>
                {t("hero.subtitle")}
              </p>
            </motion.div>

            {/* Slide 1 */}
            <motion.div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"clamp(2rem,5vw,4.5rem)", opacity:slide1Opacity, y:slide1Y, pointerEvents:"none" }}>
              <div style={{ display:"flex", gap:"clamp(1.5rem,4vw,3.5rem)", flexWrap:"wrap", marginBottom:"clamp(1.5rem,3vh,2.5rem)" }}>
                {[
                  { val:t("hero.stat0val"), label:t("hero.stat0label") },
                  { val:t("hero.stat1val"), label:t("hero.stat1label") },
                  { val:t("hero.stat2val"), label:t("hero.stat2label") },
                ].map((s,i) => (
                  <div key={i}>
                    <div style={{ fontSize:"clamp(2.2rem,5vw,4rem)", fontWeight:800, letterSpacing:"-0.03em", color:"#f4f7fa", lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:"clamp(0.7rem,1vw,0.82rem)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"rgba(160,196,255,0.65)", marginTop:"0.3rem" }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <GlassCard style={{ padding:"clamp(1.2rem,2.5vw,2rem)", maxWidth:"680px" }}>
                <p style={{ margin:0, fontSize:"clamp(1rem,1.6vw,1.3rem)", fontWeight:400, lineHeight:1.65, color:"rgba(220,232,255,0.88)" }}>
                  {t("hero.mission")}
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── CONTENT ──────────────────────────────────────────────────── */}
        <motion.div
          ref={contentRef}
          style={{
            position:     "absolute",
            top:          CONTENT_TOP,
            left:         0,
            right:        0,
            zIndex:       11,
          }}
        >
          {/*
            Inner wrapper that animates margin + borderRadius as the user
            approaches the footer. The outer div keeps left:0/right:0 so the
            page background shows through the "inset gap".
          */}
          <motion.div
            style={{
              scale: contentScale,
              y: contentY,
              borderRadius: contentBR,
              overflow:         "hidden",
              background:       gradientPage,
            }}
          >
            {/* WHO WE ARE */}
            <section style={{ padding:"clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,8rem)" }}>
              <FadeIn><SectionLabel label={t("whoweareLabel")} /></FadeIn>
              <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:"clamp(2rem,5vw,4rem)", alignItems:"start" }}>
                <FadeIn direction="left">
                  <motion.h2 style={{ margin:0, fontSize:"clamp(2rem,4.5vw,3.8rem)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.0, color: h2Color }}>
                    {t("whoweare.title")}
                  </motion.h2>
                </FadeIn>
                <FadeIn direction="right" delay={0.1}>
                  <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
                    <motion.p style={{ margin:0, fontSize:"clamp(0.95rem,1.4vw,1.1rem)", lineHeight:1.7, color:pcolor }}>{t("whoweare.p1")}</motion.p>
                    <motion.p style={{ margin:0, fontSize:"clamp(0.95rem,1.4vw,1.1rem)", lineHeight:1.7, color:pcolor }}>{t("whoweare.p2")}</motion.p>
                  </div>
                </FadeIn>
              </div>
              <div style={{ display:"flex", gap:"clamp(0.6rem,1.5vw,1rem)", flexWrap:"wrap", marginTop:"clamp(2.5rem,5vh,4rem)" }}>
                {["value0","value1","value2","value3","value4"].map((key,i) => (
                  <FadeIn key={key} delay={i*0.06} direction="up">
                    <div style={{ padding:"10px 20px", borderRadius:"100px", background:"rgba(28,57,142,0.35)", border:"1px solid rgba(100,150,255,0.20)", backdropFilter:"blur(12px)", fontSize:"clamp(0.78rem,1.1vw,0.92rem)", fontWeight:600, color:"rgba(180,210,255,0.85)", letterSpacing:"0.04em" }}>
                      {t(`values.${key}`)}
                    </div>
                  </FadeIn>
                ))}
              </div>
            </section>

            <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"0 clamp(1.5rem,8vw,8rem)" }} />

            {/* TIMELINE */}
            <section style={{ padding:"clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,8rem)" }}>
              <FadeIn><SectionLabel label={t("timelineLabel")} /></FadeIn>
              <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:"0 clamp(3rem,6vw,6rem)", alignItems:"start" }}>
                <div style={{ position: isMobile?"static":"sticky", top:"clamp(6rem,10vh,8rem)", paddingBottom: isMobile?"2rem":0 }}>
                  <FadeIn direction="left">
                    <h2 style={{ margin:0, fontSize:"clamp(2rem,4.5vw,3.8rem)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.0, color:"#f4f7fa", marginBottom:"1.2rem" }}>
                      {t("timeline.heading")}
                    </h2>
                    <p style={{ margin:0, fontSize:"clamp(0.9rem,1.3vw,1.05rem)", lineHeight:1.65, color:"rgba(200,218,250,0.65)", maxWidth:"380px" }}>
                      {t("timeline.subheading")}
                    </p>
                  </FadeIn>
                </div>
                <div>
                  {timeline.map((item,i) => (
                    <TimelineItem key={item.key} index={i} year={item.year}
                      title={t(`timeline.${item.key}.title`)}
                      description={t(`timeline.${item.key}.description`)}
                      isLast={i===timeline.length-1}
                    />
                  ))}
                </div>
              </div>
            </section>

            <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"0 clamp(1.5rem,8vw,8rem)" }} />

            {/* TEAM */}
            <section style={{ padding:"clamp(4rem,8vh,7rem) clamp(1.5rem,8vw,8rem) clamp(5rem,10vh,8rem)" }}>
              <FadeIn><SectionLabel label={t("teamLabel")} /></FadeIn>
              <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:"0 clamp(3rem,6vw,6rem)", marginBottom:"clamp(3rem,6vh,5rem)" }}>
                <FadeIn direction="left">
                  <h2 style={{ margin:0, fontSize:"clamp(2rem,4.5vw,3.8rem)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.0, color:"#f4f7fa" }}>
                    {t("team.heading")}
                  </h2>
                </FadeIn>
                <FadeIn direction="right" delay={0.1}>
                  <p style={{ margin:0, fontSize:"clamp(0.9rem,1.3vw,1.05rem)", lineHeight:1.65, color:"rgba(200,218,250,0.65)" }}>
                    {t("team.subheading")}
                  </p>
                </FadeIn>
              </div>
              <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"repeat(3,1fr)", gap:"clamp(1rem,2vw,1.5rem)" }}>
                {team.map((m,i) => (
                  <TeamCard key={m.key} index={i} photo={m.photo}
                    name={t(`team.${m.key}.name`)}
                    role={t(`team.${m.key}.role`)}
                    bio={t(`team.${m.key}.bio`)}
                  />
                ))}
              </div>
              <FadeIn delay={0.3}>
                <GlassCard style={{ marginTop:"clamp(3rem,6vh,5rem)", padding:"clamp(2rem,4vw,3rem)", display:"flex", alignItems: isMobile?"flex-start":"center", justifyContent:"space-between", flexDirection: isMobile?"column":"row", gap:"1.5rem" }}>
                  <div>
                    <h3 style={{ margin:"0 0 0.4rem", fontSize:"clamp(1.2rem,2.2vw,1.8rem)", fontWeight:700, color:"#f4f7fa", letterSpacing:"-0.015em" }}>
                      {t("team.joinTitle")}
                    </h3>
                    <p style={{ margin:0, fontSize:"clamp(0.85rem,1.2vw,1rem)", color:"rgba(200,218,250,0.65)", lineHeight:1.6 }}>
                      {t("team.joinSubtitle")}
                    </p>
                  </div>
                  <a href="/contatti" style={{ display:"inline-flex", alignItems:"center", gap:"10px", padding:"12px 24px", borderRadius:"100px", background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.22)", color:"#f4f7fa", fontSize:"clamp(0.82rem,1.1vw,0.95rem)", fontWeight:600, letterSpacing:"0.04em", textDecoration:"none", whiteSpace:"nowrap" }}>
                    {t("team.joinCta")} ↗
                  </a>
                </GlassCard>
              </FadeIn>
            </section>
          </motion.div>

          {/* Whitespace gap before footer */}
          <div style={{ height:"20vh" }} />

          <Footer />
        </motion.div>

        <ContactDrawer
          open={openContact}
          onClose={() => {
            dispatch(setOpenContact(false));
            dispatch(setNavigationState(0));
          }}
        />
      </motion.div>
    </>
  );
}