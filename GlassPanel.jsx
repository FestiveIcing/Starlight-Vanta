import { cn } from "./utils";

export default function GlassPanel({ children, className = "", ...props }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl",
        "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]",
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {children}
    </div>
  );
}