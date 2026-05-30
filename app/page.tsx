import Link from "next/link";

export default function Landing() {
  return (
    <main className="scanline min-h-dvh flex flex-col items-center justify-center bg-bg text-fg px-6">
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="text-fg-muted uppercase tracking-[0.35em] text-xs mb-8">
          a platform to clone yourself into an artificial consciousness
        </div>

        <h1 className="text-accent text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none">
          Æsh Eternal
        </h1>

        <p className="hand text-3xl sm:text-4xl text-fg mt-8">
          Gamify your life. Live forever?
        </p>

        <Link
          href="/play"
          className="group mt-16 inline-flex items-center gap-3 border border-accent px-10 py-4 text-accent uppercase tracking-widest text-sm hover:bg-accent/10 transition-colors"
        >
          <span className="text-fg-muted group-hover:text-accent">▸</span>
          start
          <span className="inline-block w-2 h-4 bg-accent animate-[blink_1s_step-end_infinite]" />
        </Link>

        <div className="text-fg-muted text-[10px] uppercase tracking-widest mt-10">
          scene 001 · first boot · age 4 · 1994
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}
