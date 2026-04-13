"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface Props {
  progress: MotionValue<number>;
  isMobile: boolean;
  title: string;
  suptitle: string;
  badge: string;
  subtitle: string;
  phases: { number: string; label: string; desc: string }[];
  comingSoon: string;
  comingSoonSub: string;
}

export default function SixPhaseEngine({
  progress,
  isMobile,
  title,
  suptitle,
  badge,
  subtitle,
  phases,
  comingSoon,
  comingSoonSub,
}: Props) {
  // ── Scroll window: 1.8 → 2.8 (1 unità di budget) ────────────────────────
  const wrapOp = useTransform(progress, [1.75, 1.95, 2.65, 2.8], [0, 1, 1, 0]);
  const wrapY = useTransform(
    progress,
    [1.75, 1.95, 2.65, 2.8],
    [60, 0, 0, -60]
  );
  const wrapClip = useTransform(
    progress,
    [1.75, 1.95, 2.65, 2.8],
    [
      "inset(100% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(0% 0% 100% 0%)",
    ]
  );

  // staggered reveals
  const mk = (start: number) =>
    ({
      op: useTransform(progress, [start, start + 0.14], [0, 1]),
      y: useTransform(progress, [start, start + 0.14], [22, 0]),
    } as const);

  const label = mk(1.9);
  const titleA = mk(1.96);
  const body = mk(2.02);
  const c0 = mk(2.08);
  const c1 = mk(2.14);
  const c2 = mk(2.2);
  const c3 = mk(2.26);
  const cta = mk(2.36);

  const cards = [c0, c1, c2, c3];

  // rotating cog
  const cogRotate = useTransform(progress, [1.8, 2.8], [0, 90]);

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 11,
        opacity: wrapOp,
        y: wrapY,
        clipPath: wrapClip,
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        padding: isMobile
          ? "10rem clamp(1.2rem,5vw,2rem)"
          : "10rem clamp(3rem,8vw,8rem)",
        overflowY: "hidden",
      }}
    >
      {/* ── BG: large cog ──────────────────────────────────────────────── */}
      <motion.div
        style={{
          position: "absolute",
          right: isMobile ? "-22vw" : "-4vw",
          top: "50%",
          translateY: "-50%",
          width: isMobile ? "60vw" : "30vw",
          height: isMobile ? "60vw" : "30vw",
          opacity: 0.04,
          pointerEvents: "none",
          rotate: cogRotate,
        }}
      >
        <svg viewBox="0 0 200 200">
          <g transform="translate(100,100)">
            {/* Denti */}
            {[...Array(18)].map((_, i) => (
              <rect
                key={i}
                x="-6"
                y="-90"
                width="12"
                height="30"
                rx="2"
                fill="#a0c4ff"
                transform={`rotate(${i * 30})`}
              />
            ))}

            {/* Corpo */}
            <circle r="60" fill="#a0c4ff" />

            {/* Foro */}
            <circle r="28" fill="#060d2a" />
            <circle r="18" stroke="#a0c4ff" strokeWidth="2" fill="none" />
          </g>
        </svg>
      </motion.div>

      {/* ── BG: small cog bottom-left ───────────────────────────────────── */}
      <motion.div
        style={{
          position: "absolute",
          left: isMobile ? "-10vw" : "1vw",
          bottom: isMobile ? "4vh" : "8vh",
          width: isMobile ? "24vw" : "11vw",
          height: isMobile ? "24vw" : "11vw",
          opacity: 0.03,
          pointerEvents: "none",
          rotate: useTransform(cogRotate, (v) => -v * 1.4),
        }}
      >
        <svg viewBox="0 0 200 200">
          <g transform="translate(100,100)">
            {/* Denti */}
            {[...Array(18)].map((_, i) => (
              <rect
                key={i}
                x="-6"
                y="-90"
                width="12"
                height="30"
                rx="2"
                fill="#a0c4ff"
                transform={`rotate(${i * 30})`}
              />
            ))}

            {/* Corpo */}
            <circle r="60" fill="#a0c4ff" />
          </g>
        </svg>
      </motion.div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div
        style={{
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Label row */}
        <motion.div
          style={{
            opacity: label.op,
            y: label.y,
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "clamp(0.7rem,1.8vh,1.2rem)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "1px",
              background: "rgba(100,150,255,0.55)",
            }}
          />
          <span
            style={{
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(160,196,255,0.6)",
            }}
            className="text-[1rem] sm:text-[1.3rem]"
          >
            {suptitle}
          </span>
          <span
            style={{
              fontWeight: 700,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: "rgba(100,150,255,0.55)",
              background: "rgba(100,150,255,0.09)",
              border: "1px solid rgba(100,150,255,0.18)",
              borderRadius: "100px",
              padding: "2px 9px",
            }}
          >
            {badge}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h2
          style={{
            opacity: titleA.op,
            y: titleA.y,
            margin: "1rem 0 clamp(0.5rem,1.4vh,0.9rem)",
            lineHeight: 0.92,
            color: "#f4f7fa",
          }}
          className="text-3xl font-stretch-extra-expanded tracking-wide sm:text-7xl font-bold leading-tight"
        >
          {title.split("\\n").map((line, i) =>
            (
              <span key={i}>
                {line}
                <br />
              </span>
            )
          )}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          style={{
            opacity: body.op,
            y: body.y,
            margin: "0 0 clamp(1.2rem,3vh,2rem)",
            lineHeight: "1.3",
            color: "rgba(200,218,250,0.68)",
            maxWidth: isMobile ? "100%" : "760px",
          }}
          className="text-xl font-stretch-extra-expanded tracking-wide sm:text-2xl mt-4 whitespace-pre-line font-light"
        >
          {subtitle}
        </motion.p>

        {/* Phase cards */}
        {/* <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: "clamp(0.5rem,1vw,0.85rem)",
            marginBottom: "clamp(1.2rem,2.8vh,2rem)",
          }}
        >
          {phases.map((ph, i) => (
            <motion.div
              key={i}
              style={{
                opacity: cards[i].op,
                y: cards[i].y,
                background: "rgba(255,255,255,0.038)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: isMobile
                  ? "clamp(0.8rem,2.8vw,1.1rem)"
                  : "clamp(0.9rem,1.6vw,1.3rem)",
                position: "relative",
                overflow: "hidden",
              }}
            > */}
              {/* ghost number */}
              {/* <div
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.7rem",
                  fontSize: isMobile
                    ? "clamp(1.4rem,5vw,2rem)"
                    : "clamp(1.6rem,2.8vw,2.4rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                  color: "rgba(100,150,255,0.08)",
                  lineHeight: 1,
                  userSelect: "none",
                }}
              >
                {ph.number}
              </div> */}
              {/* accent bar */}
              {/* <div
                style={{
                  width: "clamp(18px,2.5vw,28px)",
                  height: "2px",
                  background:
                    "linear-gradient(90deg,rgba(100,165,255,0.65),transparent)",
                  borderRadius: "2px",
                  marginBottom: "clamp(0.4rem,1vh,0.65rem)",
                }}
              />
              <p
                style={{
                  margin: "0 0 clamp(0.2rem,0.5vh,0.35rem)",
                  fontSize: "clamp(0.54rem,0.76vw,0.64rem)",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(100,165,255,0.65)",
                }}
              >
                {ph.number}
              </p>
              <h3
                style={{
                  margin: "0 0 clamp(0.25rem,0.6vh,0.4rem)",
                  fontSize: isMobile
                    ? "clamp(0.72rem,2.8vw,0.85rem)"
                    : "clamp(0.76rem,1vw,0.88rem)",
                  fontWeight: 700,
                  color: "#eef2fa",
                  lineHeight: 1.2,
                }}
              >
                {ph.label}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: isMobile
                    ? "clamp(0.62rem,2.2vw,0.72rem)"
                    : "clamp(0.66rem,0.88vw,0.76rem)",
                  lineHeight: 1.55,
                  color: "rgba(175,200,245,0.5)",
                }}
              >
                {ph.desc}
              </p>
            </motion.div>
          ))}
        </div> */}

        {/* Coming-soon CTA */}
        <motion.div
          style={{
            opacity: cta.op,
            y: cta.y,
            display: "inline-flex",
            alignItems: "center",
            gap: isMobile ? "clamp(0.8rem,3vw,1rem)" : "clamp(1rem,2vw,1.4rem)",
            flexWrap: "wrap",
          }}
        >
          {/* Pulsing dot pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "100px",
              background: "rgba(100,160,255,0.07)",
              border: "1px solid rgba(100,160,255,0.18)",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "rgba(100,200,255,0.8)",
                boxShadow: "0 0 0 3px rgba(100,200,255,0.15)",
                display: "inline-block",
                animation: "pulse6ph 1.8s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: "clamp(0.78rem,0.9vw,0.78rem)",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "rgba(160,210,255,0.85)",
              }}
            >
              {comingSoon}
            </span>
          </div>
          <span
            style={{
              fontSize: "clamp(0.76rem,0.98vw,0.86rem)",
              color: "rgba(160,190,240,0.6)",
              letterSpacing: "0.04em",
            }}
          >
            {comingSoonSub}
          </span>
        </motion.div>
      </div>

      {/* Pulse keyframe */}
      <style>{`
        @keyframes pulse6ph {
          0%,100% { opacity:1; box-shadow:0 0 0 3px rgba(100,200,255,0.15); }
          50%      { opacity:.6; box-shadow:0 0 0 6px rgba(100,200,255,0.05); }
        }
      `}</style>
    </motion.div>
  );
}
