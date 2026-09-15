import { useNavigate } from "react-router-dom";
import { BrandMark, Wordmark, HeroArt, FeatureIcons } from "./Icons";
import KnowledgeGrid from "./KnowledgeGrid";

const phases = [
  {
    title: "1. Tell us about you",
    body: "A short profile — age, cycle history, lifestyle — sets your personal baseline.",
  },
  {
    title: "2. Log daily signals",
    body: "Weight, sleep, water, mood, and symptoms — thirty seconds a day, most days.",
  },
  {
    title: "3. See your risk score",
    body: "Our screening model flags your PCOS risk level with plain-language reasons.",
  },
  {
    title: "4. Follow your plan",
    body: "Get lifestyle recommendations that adjust as your logs and trends change.",
  },
];

const features = [
  {
    icon: "chart",
    title: "Progress dashboard",
    body: "Weight, sleep, cycle regularity, and mood trends visualised weekly and monthly.",
  },
  {
    icon: "clock",
    title: "Daily health log",
    body: "A quick check-in for the signals that matter most in PCOS — logged in seconds.",
  },
  {
    icon: "star",
    title: "Risk screening",
    body: "A guided questionnaire estimates your PCOS risk level with clear next steps.",
  },
  {
    icon: "book",
    title: "Knowledge centre",
    body: "Plain-language articles on PCOS, PCOD, diet, and exercise — no jargon.",
  },
  {
    icon: "leaf",
    title: "Personalised tips",
    body: "Lifestyle recommendations that respond to your BMI, sleep, and logged trends.",
  },
  {
    icon: "shield",
    title: "Private by default",
    body: "Your health data stays yours — nothing is shared without your say-so.",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const scrollToId = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      <nav className="sticky top-0 z-40 flex items-center justify-between px-[6vw] py-5 bg-bg/90 backdrop-blur border-b border-line">
        <div
          className="flex items-center gap-2.5 font-serif font-semibold text-[21px] text-wine-dark cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <BrandMark />
          <Wordmark />
        </div>
        <div className="hidden md:flex gap-8 text-[15px] font-medium">
          <span
            className="opacity-75 hover:opacity-100 cursor-pointer"
            onClick={() => scrollToId("features")}
          >
            Features
          </span>
          <span
            className="opacity-75 hover:opacity-100 cursor-pointer"
            onClick={() => scrollToId("phases")}
          >
            How it works
          </span>
          <span
            className="opacity-75 hover:opacity-100 cursor-pointer"
            onClick={() => scrollToId("knowledge-preview")}
          >
            Learn
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/auth/login")}
          >
            Log in
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/auth/signup")}
          >
            Get started
          </button>
        </div>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 px-[6vw] pt-16 pb-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-sage-tint text-[#3F5A43] px-3.5 py-1.5 rounded-full text-[13px] font-semibold mb-5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3a9 9 0 108.5 12.2A7 7 0 0112 3z" fill="#3F5A43" />
            </svg>
            Built for the 1 in 10 women living with PCOS
          </div>
          <h1 className="text-[clamp(34px,4.6vw,58px)] leading-[1.06] text-wine-dark">
            Track your cycle.
            <br />
            Understand your body.
            <br />
            <em className="not-italic italic text-rose">Feel in control.</em>
          </h1>
          <p className="text-[18px] text-muted max-w-[46ch] my-6">
            FeminaPulse turns your daily symptoms, sleep, and cycle data into a
            clear picture of your PCOS risk and progress — with a plan you can
            actually follow.
          </p>
          <div className="flex gap-3.5 items-center mb-5">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/auth/signup")}
            >
              Start tracking free
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => navigate("/auth/login")}
            >
              I have an account
            </button>
          </div>
          <p className="text-[13.5px] text-muted">
            No medical background needed · Set up in under 3 minutes
          </p>

          <div className="flex gap-9 mt-11 pt-7 border-t border-line">
            <div>
              <div className="font-serif text-[26px] font-semibold text-wine-dark">
                70%
              </div>
              <div className="text-[13px] text-muted">
                of PCOS cases go undiagnosed
              </div>
            </div>
            <div>
              <div className="font-serif text-[26px] font-semibold text-wine-dark">
                6
              </div>
              <div className="text-[13px] text-muted">
                core health signals tracked daily
              </div>
            </div>
            <div>
              <div className="font-serif text-[26px] font-semibold text-wine-dark">
                12wk
              </div>
              <div className="text-[13px] text-muted">
                guided program to build habits
              </div>
            </div>
          </div>
        </div>
        <div>
          <HeroArt />
        </div>
      </div>

      <div
        id="phases"
        className="flex overflow-x-auto gap-4 px-[6vw] py-16 bg-wine-dark"
      >
        {phases.map((p) => (
          <div
            key={p.title}
            className="flex-none w-[230px] bg-white/[0.06] border border-white/[0.14] rounded-card p-5 text-white"
          >
            <svg className="w-[26px] h-[26px] mb-3.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" fill="#fff" opacity="0.85" />
            </svg>
            <h3 className="text-[16px] font-semibold text-white mb-1.5">
              {p.title}
            </h3>
            <p className="text-[13px] text-white/70 leading-relaxed">
              {p.body}
            </p>
          </div>
        ))}
      </div>

      <section id="features" className="px-[6vw] py-16">
        <div className="max-w-[640px] mb-10">
          <div className="text-[13px] font-semibold text-rose mb-2.5">
            Everything in one place
          </div>
          <h2 className="text-[clamp(26px,3vw,36px)] text-wine-dark">
            Designed around how your body actually works
          </h2>
          <p className="text-muted mt-3 text-[16px]">
            FeminaPulse brings together tracking, screening, and education — so
            you're not piecing together spreadsheets, search results, and
            guesswork.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-line rounded-card p-6 hover:border-rose transition-colors"
            >
              <div className="w-[42px] h-[42px] mb-4">
                {FeatureIcons[f.icon]}
              </div>
              <h3 className="text-[17px] mb-2 text-wine-dark">{f.title}</h3>
              <p className="text-[14px] text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="knowledge-preview" className="px-[6vw] py-16">
        <div className="max-w-[640px] mb-10">
          <div className="text-[13px] font-semibold text-rose mb-2.5">
            From the knowledge centre
          </div>
          <h2 className="text-[clamp(26px,3vw,36px)] text-wine-dark">
            A little context goes a long way
          </h2>
          <p className="text-muted mt-3 text-[16px]">
            Short, clear reads on the questions women search at 1am.
          </p>
        </div>
        <KnowledgeGrid />
      </section>

      <div className="mx-[6vw] mb-20 p-10 md:p-14 rounded-3xl bg-gradient-to-b from-wine-tint to-rose-tint flex items-center justify-between gap-6 flex-wrap">
        <h2 className="text-[28px] text-wine-dark max-w-[420px]">
          Your cycle has patterns. Let's find yours.
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/auth/signup")}
        >
          Create your free account
        </button>
      </div>

      <footer className="px-[6vw] py-8 border-t border-line flex justify-between text-[13px] text-muted flex-wrap gap-2.5">
        <span>© 2026 FeminaPulse.</span>
        <span>Made for the women</span>
      </footer>
    </div>
  );
}
