export default function Field({ icon: Icon, className = "", ...props }) {
  return (
    <div
      className={`relative rounded-lg border border-white/10 bg-white/5 transition-colors duration-200 focus-within:border-violet-400/50 focus-within:bg-white/[0.07] ${className}`}
    >
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />}
      <input
        className={`w-full bg-transparent py-2 pr-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 ${Icon ? "pl-9" : "pl-3"}`}
        {...props}
      />
    </div>
  );
}
