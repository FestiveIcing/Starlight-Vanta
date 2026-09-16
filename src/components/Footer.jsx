import { Link } from "react-router-dom";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-sm">
          <p className="text-sm font-medium text-white/80">Starlight Vanta</p>
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            A username generator that runs entirely in the page you are reading. Built and
            maintained in-house by Starlight Solutions, Inc.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-xs sm:grid-cols-3">
          <Link to="/generator" className="text-white/45 transition-colors hover:text-white">Generator</Link>
          <Link to="/collections" className="text-white/45 transition-colors hover:text-white">Collections</Link>
          <Link to="/builder" className="text-white/45 transition-colors hover:text-white">Builder</Link>
          <Link to="/donate" className="text-white/45 transition-colors hover:text-white">Donate</Link>
          <Link to="/privacy" className="text-white/45 transition-colors hover:text-white">Privacy</Link>
          <Link to="/terms" className="text-white/45 transition-colors hover:text-white">Terms</Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl border-t border-white/5 px-4 py-5 sm:px-6 lg:px-8">
        <p className="text-[11px] text-white/30">
          © {YEAR} Starlight Solutions, Inc. All rights reserved. Starlight Vanta is a product of
          Starlight Solutions, Inc.
        </p>
      </div>
    </footer>
  );
}
