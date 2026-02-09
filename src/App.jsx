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
            <a href="#features" className="hidden hover:text-primary transition-colors md:inline">
              Features
            </a>
            <a href="#workflow" className="hidden hover:text-primary transition-colors md:inline">
              Workflow
            </a>
            <a href="#launch" className="hidden hover:text-primary transition-colors md:inline">
              Launch
            </a>
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

        <div className="mt-18 grid items-end gap-12 md:grid-cols-[1.2fr_0.8fr]">
          <div className="reveal reveal-2">
            <p className="mb-6 inline-flex rounded-full border border-primary/50 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Built for fast learners
            </p>
            <h1 className="display-font text-5xl leading-[0.92] text-foreground sm:text-6xl md:text-7xl">
              The AI quiz platform that feels electric.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Run high-energy quizzes, personalize every question, and turn study sessions into an experience learners keep coming back to.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#launch"
                className="pulse-ring rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Start free
              </a>
              <a
                href="#features"
                className="rounded-full border border-border px-7 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Explore demo
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

      <section id="features" className="relative mx-auto w-full max-w-6xl px-6 py-20 md:px-10">
        <div className="reveal reveal-1 mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Section 2
            </p>
            <h2 className="display-font mt-3 text-4xl text-foreground sm:text-5xl">
              Why teams pick QuizLab
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            A focused feature set designed for momentum, clarity, and consistent learning outcomes.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`reveal reveal-${index + 1} rounded-3xl border border-border bg-card p-6`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {feature.metric}
              </p>
              <h3 className="display-font mt-4 text-2xl text-foreground">
                {feature.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {feature.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="relative mx-auto w-full max-w-6xl px-6 py-20 md:px-10">
        <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
          <div className="reveal reveal-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Section 3
            </p>
            <h2 className="display-font mt-3 text-4xl text-foreground sm:text-5xl">
              Launch a smart quiz cycle in three moves
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Built for schools, creators, and cohort programs that need a fast loop from content to insight.
            </p>
          </div>
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li
                key={step}
                className={`reveal reveal-${Math.min(index + 2, 3)} grid gap-3 rounded-2xl border border-border bg-card px-5 py-5 sm:grid-cols-[auto_1fr] sm:items-center`}
              >
                <span className="display-font inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="launch" className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-20 md:px-10">
        <div className="reveal reveal-2 rounded-[2rem] border border-border bg-gradient-to-br from-card via-muted to-muted px-6 py-12 text-center sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Section 4
          </p>
          <h2 className="display-font mx-auto mt-4 max-w-2xl text-4xl text-foreground sm:text-5xl">
            Ready to make your quiz experience unforgettable?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Start free today and run your first AI-powered quiz in under ten minutes.
          </p>
          <form className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-full border border-border bg-input px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Get Early Access
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}



