import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "./utils";

export default function TiltCard({ children, className = "", intensity = 1, ...props }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const i = intensity || 0.0001;
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7 * i, -7 * i]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7 * i, 7 * i]), { stiffness: 150, damping: 18 });

  function handleMove(e) {
    if (!ref.current || !intensity) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1000 }}
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}