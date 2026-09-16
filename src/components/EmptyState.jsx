import { Link } from "react-router-dom";

export default function EmptyState({ title, desc, actionLabel, to }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-violet-200/70">
        ✦
      </div>
      <p className="text-lg font-medium text-white/80">{title}</p>
      <p className="max-w-sm text-sm text-white/40">{desc}</p>
      {actionLabel && to && (
        <Link
          to={to}
          className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-[0_0_22px_-6px_rgba(124,58,237,0.8)] transition-colors duration-300 hover:bg-violet-500"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
