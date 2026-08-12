import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VantaInput({
  value,
  onChange,
  placeholder,
  maxLength,
  icon: Icon,
  className = "",
  ...rest
}) {
  const ref = useRef(null);
  const chars = value ? value.split("") : [];

  return (
    <div
      className={`relative rounded-lg border border-white/10 bg-white/5 transition-all duration-200 focus-within:border-violet-400/50 focus-within:bg-white/[0.07] focus-within:shadow-[0_0_22px_-6px_rgba(139,92,246,0.4)] ${className}`}
    >
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/30" />
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
        <span className={`whitespace-pre py-2 text-sm leading-6 text-white ${Icon ? "pl-9" : "pl-3"}`}>
          <AnimatePresence initial={false}>
            {chars.map((c, i) => (
              <motion.span
                key={`${i}-${c}`}
                initial={{ opacity: 0, y: 3, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -2, scale: 0.85, filter: "blur(2px)" }}
                transition={{ duration: 0.13, ease: "easeOut" }}
                className="inline-block"
              >
                {c}
              </motion.span>
            ))}
          </AnimatePresence>
        </span>
      </div>

      <input
        ref={ref}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`vanta-field relative z-0 w-full bg-transparent py-2 pr-3 text-sm leading-6 text-transparent outline-none placeholder:text-white/20 ${Icon ? "pl-9" : "pl-3"}`}
        style={{ caretColor: "#a78bfa" }}
        {...rest}
      />
    </div>
  );
}