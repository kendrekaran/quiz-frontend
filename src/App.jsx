import { Link } from "react-router-dom";

export default function App() {
  const features = [
    {
      title: "Adaptive Question Engine",
      copy: "Questions adjust in difficulty after every answer so learners stay challenged without burning out.",
      metric: "2.7x retention",
    },
    {
      title: "Live Leaderboards",
      copy: "Turn every quiz into a friendly competition with real-time scoring, streaks, and class rankings.",
      metric: "47 sec avg rounds",
    },
    {
      title: "Teacher Insight Radar",
      copy: "Spot weak concepts instantly with visual performance maps and auto-generated revision packs.",
      metric: "68% faster review",
    },
  ];

  const steps = [
    "Create a quiz in minutes with AI-generated question sets.",
    "Invite learners by link or class code and launch timed rounds.",
    "Track mastery growth with instant analytics after each session.",
  ];

  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <div className="grain-layer" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="mesh-orb -left-24 top-24" />
        <div className="mesh-orb mesh-orb--teal right-[-100px] top-[28rem]" />
      </div>

      <section
        id="hero"
        className="relative mx-auto min-h-screen w-full max-w-6xl px-6 pb-16 pt-8 md:px-10"
      >
        <header className="reveal reveal-1 flex items-center justify-between">
          <a href="#hero" className="display-font text-2xl tracking-wide text-foreground">
            QUIZLAB
          </a>
          <nav className="flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground md:gap-8">
            <div className="ml-auto flex items-center gap-2 md:gap-3">
              <Link
                to="/login?role=student"
                className="rounded-full border border-border px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:border-primary hover:text-primary md:px-5 md:py-2.5 md:text-sm"
              >
                Login as student
              </Link>
              <Link
                to="/login?role=teacher"
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground transition-transform hover:-translate-y-0.5 md:px-5 md:py-2.5 md:text-sm"
              >
                Login as teacher
              </Link>
            </div>
          </nav>
        </header>

        <div className=" grid items-center justify-center mt-32 gap-12 md:grid-cols-[1.2fr_0.8fr]">
          <div className="reveal reveal-2">
            <p className="mb-6 inline-flex rounded-full border border-primary/50 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Built for fast learners
            </p>
            <h1 className="display-font text-5xl leading-[0.92] text-foreground sm:text-6xl md:text-7xl">
            Quick quizzes. Instant results.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Generate results immediately and track learning progress with smart analytics.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/login?role=student"
                className=" rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Start Now
              </a>
            </div>
          </div>

          <aside className="reveal reveal-3 rounded-3xl border border-border bg-card p-6 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.9)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Live session
            </p>
            <h2 className="display-font mt-4 text-3xl text-foreground">
              Friday Science Sprint
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <span>Participants</span>
                <strong className="text-primary">320</strong>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <span>Avg. accuracy</span>
                <strong className="text-primary">88%</strong>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <span>Questions solved</span>
                <strong className="text-primary">12,410</strong>
              </li>
            </ul>
          </aside>
        </div>
      </section>

     
    </main>
  );
}



