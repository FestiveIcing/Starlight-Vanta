import { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function Background({ enabled = true, reduceMotion = false }) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const smoothX = useSpring(pointerX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(pointerY, { stiffness: 50, damping: 20 });

  const active = enabled && !reduceMotion;

  useEffect(() => {
    if (!active) return undefined;
    const onMove = (event) => {
      pointerX.set(event.clientX / window.innerWidth);
      pointerY.set(event.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [active, pointerX, pointerY]);

  const driftX = useTransform(smoothX, [0, 1], [26, -26]);
  const driftY = useTransform(smoothY, [0, 1], [18, -18]);
  const glowX = useTransform(smoothX, (value) => `${(value * 100).toFixed(1)}%`);
  const glowY = useTransform(smoothY, (value) => `${(value * 100).toFixed(1)}%`);
  const pointerGlow = useMotionTemplate`radial-gradient(560px circle at ${glowX} ${glowY}, rgba(139,92,246,0.07), transparent 70%)`;

  if (!enabled) return <div className="fixed inset-0 -z-10 bg-[#050505]" />;

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

      <motion.div style={active ? { x: driftX, y: driftY } : undefined} className="absolute inset-0">
        <motion.div
          className="absolute -left-32 -top-48 h-[42rem] w-[42rem] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle,rgba(94,67,243,0.16),transparent 70%)" }}
          animate={active ? { x: [0, 90, 0], y: [0, 50, 0] } : undefined}
          transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-40 top-1/3 h-[38rem] w-[38rem] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle,rgba(168,85,247,0.13),transparent 70%)" }}
          animate={active ? { x: [0, -70, 0], y: [0, 60, 0] } : undefined}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-12rem] left-1/4 h-[34rem] w-[34rem] rounded-full blur-[140px]"
          style={{ background: "radial-gradient(circle,rgba(59,130,246,0.10),transparent 70%)" }}
          animate={active ? { x: [0, 60, 0], y: [0, -40, 0] } : undefined}
          transition={{ duration: 46, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {active && <motion.div className="absolute inset-0" style={{ background: pointerGlow }} />}

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
