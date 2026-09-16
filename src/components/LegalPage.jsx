export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3 border-b border-white/[0.08] pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        <p className="text-[11px] uppercase tracking-widest text-white/30">Last updated {updated}</p>
        {intro.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed text-white/55">
            {paragraph}
          </p>
        ))}
      </header>

      <nav aria-label="Sections" className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {sections.map((section, index) => (
          <a
            key={section.heading}
            href={`#${section.id}`}
            className="text-white/35 transition-colors hover:text-violet-300"
          >
            {index + 1}. {section.heading}
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-10">
        {sections.map((section, index) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h2 className="text-sm font-medium text-white">
              <span className="mr-3 font-mono text-xs text-violet-300/50">
                {String(index + 1).padStart(2, "0")}
              </span>
              {section.heading}
            </h2>
            <div className="mt-3 flex flex-col gap-3 border-l border-white/[0.08] pl-5">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-white/50">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-white/50 marker:text-white/20">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
