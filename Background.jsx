import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";

export default function Background({ effects = true, intensity = 1 }) {
  const active = effects && intensity > 0;
  const dur = (base) => (intensity ? base / intensity : base * 6);

  const cx = useMotionValue(0.5);
  const cy = useMotionValue(0.5);
  const sx = useSpring(cx, { stiffness: 50, damping: 20 });
  const sy = useSpring(cy, { stiffness: 50, damping: 20 });

  useEffect(() => {
    if (!active) return;
    function onMove(e) {
      cx.set(e.clientX / window.innerWidth);
      cy.set(e.clientY / window.innerHeight);
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [active, cx, cy]);

  const parX = useTransform(sx, [0, 1], [30, -30]);
  const parY = useTransform(sy, [0, 1], [20, -20]);
  const glowX = useTransform(sx, (v) => `${(v * 100).toFixed(1)}%`);
  const glowY = useTransform(sy, (v) => `${(v * 100).toFixed(1)}%`);
  const cursorGlow = useMotionTemplate`radial-gradient(560px circle at ${glowX} ${glowY}, rgba(139,92,246,0.07), transparent 70%)`;

  if (!effects) {
    return <div className="fixed inset-0 -z-10 bg-[#050505]" />;
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#050505]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center,#000 30%,transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center,#000 30%,transparent 85%)",
        }}
      />

      <motion.div style={active ? { x: parX, y: parY } : undefined} className="absolute inset-0">
        <motion.div
          className="absolute -top-48 -left-32 h-[42rem] w-[42rem] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle,rgba(94,67,243,0.16),transparent 70%)" }}
          animate={{ x: [0, 90, 0], y: [0, 50, 0] }}
          transition={{ duration: dur(34), repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 h-[38rem] w-[38rem] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle,rgba(168,85,247,0.13),transparent 70%)" }}
          animate={{ x: [0, -70, 0], y: [0, 60, 0] }}
          transition={{ duration: dur(40), repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-12rem] left-1/4 h-[34rem] w-[34rem] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle,rgba(59,130,246,0.10),transparent 70%)" }}
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: dur(46), repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {active && <motion.div className="absolute inset-0" style={{ background: cursorGlow }} />}

      <div
        className="absolute inset-0 opacity-[0.018] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
    </div>
  );
}