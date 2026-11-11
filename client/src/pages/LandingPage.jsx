import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TaglineReveal from "../components/TaglineReveal";

const faqs = [
  {
    question: "What is LearnAI?",
    answer:
      "LearnAI is a learning app for web development. It brings courses, assessments, progress tracking, and an AI tutor together.",
  },
  {
    question: "Which topics can I study?",
    answer: "The current courses cover HTML, CSS, JavaScript, and React.",
  },
  {
    question: "Can I start as a beginner?",
    answer:
      "Yes. Create an account and begin with the course material. Assessments adapt to your current learning level.",
  },
  {
    question: "How do assessments work?",
    answer:
      "Answer the questions in an assessment to see your score, topic results, and the next suggested level.",
  },
  {
    question: "Can I see my learning progress?",
    answer:
      "Your dashboard and progress page show completed lessons, assessment results, topic performance, and learning streaks.",
  },
  {
    question: "What can the AI tutor help with?",
    answer:
      "Ask questions about your learning topics and get explanations shaped for your selected level. Review important answers against course material.",
  },
  {
    question: "What do I need to create an account?",
    answer:
      "Account creation asks for your name, email address, and password. You can update your profile and clear learning progress in Settings.",
  },
];

const benefits = [
  {
    number: "01",
    title: "Practice what needs attention",
    copy: "Assessment results show how you are doing across topics, so you can focus your next study session.",
  },
  {
    number: "02",
    title: "See progress as it happens",
    copy: "Completed lessons, scores, and learning streaks are gathered in one place.",
  },
  {
    number: "03",
    title: "Get help when you need it",
    copy: "Ask the AI tutor questions and request explanations at your current learning level.",
  },
  {
    number: "04",
    title: "Choose a useful next step",
    copy: "Use topic recommendations and a generated study plan to decide what to work on next.",
  },
];

function RevealSection({ children, className = "", id }) {
  const ref = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`reveal-section${revealed ? " is-revealed" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

function MenuButton({ open, onClick }) {
  return (
    <button
      type="button"
      className={`menu-toggle${open ? " is-open" : ""}`}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
    >
      <span />
      <span />
      <span />
    </button>
  );
}

function ProductPreview() {
  return (
    <div className="preview-shell" aria-label="Preview of the LearnAI learning dashboard">
      <div className="preview-topbar">
        <div className="preview-brand caption-4">
          <span className="preview-mark caption-3">L</span>
          <span>LearnAI</span>
        </div>
        <span className="preview-label caption-4">Learning dashboard</span>
        <span className="preview-avatar caption-4" aria-hidden="true">
          A
        </span>
      </div>
      <div className="preview-content">
        <div className="preview-welcome">
          <p className="caption-4 text-white/50">YOUR LEARNING SPACE</p>
          <h2 className="heading-5 mt-2">Keep building your skills</h2>
          <p className="body-6 mt-1 text-white/55">
            Pick a course and continue at your pace.
          </p>
        </div>
        <div className="preview-grid">
          <article className="preview-card preview-course">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="caption-4 text-white/45">COURSE</p>
                <h3 className="title-2 mt-2">JavaScript</h3>
              </div>
              <span className="preview-dot" />
            </div>
            <p className="body-6 mt-5 text-white/55">Variables and data types</p>
            <div className="preview-progress" aria-label="Course progress">
              <span />
            </div>
            <p className="caption-5 mt-2 text-white/45">Continue lesson</p>
          </article>
          <article className="preview-card preview-assessment">
            <p className="caption-4 text-white/45">ASSESSMENT</p>
            <h3 className="title-2 mt-2">Check your understanding</h3>
            <p className="body-6 mt-2 text-white/55">Choose the best answer</p>
            <div className="preview-option preview-option-selected caption-5">
              <span className="preview-radio" />A block scoped variable
            </div>
            <div className="preview-option caption-5">
              <span className="preview-radio" />A reusable function
            </div>
          </article>
          <article className="preview-card preview-progress-card">
            <div className="flex items-center justify-between">
              <p className="caption-4 text-white/45">YOUR PROGRESS</p>
              <span className="caption-5 text-white/45">Recent activity</span>
            </div>
            <div className="preview-chart" aria-hidden="true">
              <span className="chart-line chart-line-one" />
              <span className="chart-line chart-line-two" />
              <span className="chart-line chart-line-three" />
              <span className="chart-line chart-line-four" />
              <span className="chart-line chart-line-five" />
            </div>
          </article>
        </div>
      </div>
      <span className="preview-caption caption-5">
        A preview of your learning workspace
      </span>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="landing-header">
      <nav className="landing-nav" aria-label="Main navigation">
        <Link to="/" className="landing-wordmark title-3" onClick={closeMenu}>
          <span className="wordmark-symbol caption-3">L</span>
          <span>LearnAI</span>
        </Link>
        <div className={`nav-links${open ? " nav-links-open" : ""}`}>
          <a className="caption-1" href="#benefits" onClick={closeMenu}>
            Why LearnAI
          </a>
          <a className="caption-1" href="#how-it-works" onClick={closeMenu}>
            How it works
          </a>
          <a className="caption-1" href="#questions" onClick={closeMenu}>
            Questions
          </a>
          <Link className="nav-login caption-1" to="/login" onClick={closeMenu}>
            Log in
          </Link>
        </div>
        <MenuButton open={open} onClick={() => setOpen((value) => !value)} />
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="landing-footer section-frame">
      <Link to="/" className="landing-wordmark title-3">
        <span className="wordmark-symbol caption-3">L</span>
        <span>LearnAI</span>
      </Link>
      <p className="caption-4 text-white/45">
        A steady path to stronger web development skills.
      </p>
      <div className="footer-links">
        <Link className="caption-1" to="/privacy">
          Privacy
        </Link>
        <Link className="caption-1" to="/terms">
          Terms
        </Link>
        <span className="caption-1">© {new Date().getFullYear()} LearnAI</span>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <section className="hero-section section-frame">
          <div className="hero-copy">
            <p className="eyebrow caption-3">
              <span className="eyebrow-mark" />A learning app for web development
            </p>
            <h1 className="heading-1 hero-heading text-balance">
              Build web skills
              <br />
              with a clearer path.
            </h1>
            <p className="body-3 hero-subheading text-pretty">
              Learn HTML, CSS, JavaScript, and React with guided courses, adaptive
              assessments, and an AI tutor that meets you at your level.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="primary-button button-md">
                Create your account
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <p className="caption-4 hero-proof">
              Get started with only your name, email, and password.
            </p>
          </div>
          <ProductPreview />
          <div className="hero-bottom-note">
            <span className="caption-4 text-white/45">Start with the basics</span>
            <span className="hero-bottom-rule" />
            <span className="caption-4 text-white/45">Keep making progress</span>
          </div>
        </section>

        <TaglineReveal />

        <RevealSection id="benefits" className="benefits-section section-frame">
          <div className="section-heading">
            <p className="eyebrow caption-3">
              <span className="eyebrow-mark" />
              Learning with direction
            </p>
            <h2 className="heading-3 max-w-[680px] text-balance">
              Make each study session count.
            </h2>
            <p className="body-6 mt-4 max-w-xl text-white/55 text-pretty">
              Build confidence by connecting what you learn with what to practice next.
            </p>
          </div>
          <div className="benefit-grid">
            {benefits.map((benefit) => (
              <article className="benefit-card" key={benefit.number}>
                <span className="caption-3 benefit-number">{benefit.number}</span>
                <h3 className="heading-6 mt-8 text-balance">{benefit.title}</h3>
                <p className="body-6 mt-3 text-white/55 text-pretty">{benefit.copy}</p>
              </article>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="how-it-works" className="steps-section section-frame">
          <div className="section-heading">
            <p className="eyebrow caption-3">
              <span className="eyebrow-mark" />A clear place to begin
            </p>
            <h2 className="heading-3 max-w-[680px] text-balance">
              From first lesson to next step.
            </h2>
          </div>
          <div className="steps-grid">
            {[
              {
                number: "01",
                title: "Create your account",
                copy: "Set up your learning space with your name, email, and password.",
              },
              {
                number: "02",
                title: "Choose a course",
                copy: "Work through lessons in HTML, CSS, JavaScript, or React.",
              },
              {
                number: "03",
                title: "Practice and review",
                copy: "Take an assessment, check your progress, and choose what to study next.",
              },
            ].map((step) => (
              <article className="step-card" key={step.number}>
                <span className="step-number caption-3">{step.number}</span>
                <div className="step-rule" />
                <h3 className="heading-6 mt-6">{step.title}</h3>
                <p className="body-6 mt-3 text-white/55 text-pretty">{step.copy}</p>
              </article>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="proof-section section-frame">
          <div className="proof-copy">
            <p className="eyebrow caption-3">
              <span className="eyebrow-mark" />
              Your work, made visible
            </p>
            <h2 className="heading-3 max-w-[680px] text-balance">
              Know what you have learned and where to go next.
            </h2>
            <p className="body-6 mt-4 max-w-xl text-white/55 text-pretty">
              LearnAI brings course completion, assessment history, topic results,
              streaks, and study planning into your own progress view.
            </p>
          </div>
          <div className="proof-list">
            {[
              ["Course progress", "See completed lessons by course"],
              ["Topic results", "Review strengths and practice areas"],
              ["Study plan", "Generate a weekly plan from recent results"],
              ["Tutor history", "Return to earlier learning conversations"],
            ].map(([label, description]) => (
              <div className="proof-row" key={label}>
                <span className="proof-check caption-3" aria-hidden="true">
                  +
                </span>
                <span className="proof-row-copy">
                  <span className="title-3">{label}</span>
                  <span className="caption-2 text-white/45">{description}</span>
                </span>
              </div>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="questions" className="faq-section section-frame">
          <div className="section-heading">
            <p className="eyebrow caption-3">
              <span className="eyebrow-mark" />
              Good to know
            </p>
            <h2 className="heading-3 max-w-[680px] text-balance">
              Questions before you begin.
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details className="faq-item" key={faq.question}>
                <summary>
                  <span className="caption-3 faq-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="title-3">{faq.question}</span>
                  <span className="faq-plus heading-6" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="body-6 faq-answer text-pretty">{faq.answer}</p>
              </details>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="final-cta section-frame">
          <p className="eyebrow caption-3">
            <span className="eyebrow-mark" />
            Your next step starts here
          </p>
          <h2 className="heading-2 max-w-[680px] text-balance">
            Give your learning a place to grow.
          </h2>
          <p className="body-6 mt-4 max-w-xl text-white/55 text-pretty">
            Create an account, choose a topic, and start with one lesson.
          </p>
          <Link to="/register" className="primary-button button-md mt-8">
            Create your account
            <span aria-hidden="true">↗</span>
          </Link>
        </RevealSection>
      </main>
      <Footer />
    </div>
  );
}
