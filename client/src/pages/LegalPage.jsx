import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const policies = {
  "/privacy": {
    title: "Privacy",
    description:
      "A plain language overview of the information LearnAI uses to provide learning features.",
    sections: [
      {
        heading: "Information used by LearnAI",
        paragraphs: [
          "LearnAI stores your name, email address, password hash, profile settings, course progress, assessment answers and results, tutor conversations, badges, and notifications.",
          "LearnAI uses an authentication cookie to keep you signed in. Your password is stored as a hash rather than readable text.",
          "When you use the tutor, your message is sent to the AI service configured for LearnAI so it can produce a response.",
        ],
      },
      {
        heading: "Manage your learning data",
        paragraphs: [
          "You can clear learning progress from Settings. This removes assessment attempts, lesson progress, activity, study plan data, tutor conversations, notifications, and badges. Your account remains active.",
        ],
      },
    ],
  },
  "/terms": {
    title: "Terms",
    description: "A plain language guide to using LearnAI.",
    sections: [
      {
        heading: "Using your account",
        paragraphs: [
          "Keep your sign in details private and use your own account. Do not interfere with the service or use it to access another learner's information.",
        ],
      },
      {
        heading: "Learning content and AI responses",
        paragraphs: [
          "LearnAI provides learning material, assessments, and tutor responses for practice. AI responses can be incomplete or incorrect, so review important information with trusted learning resources.",
          "Do not include sensitive personal information in tutor messages.",
        ],
      },
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const policy = policies[pathname] || policies["/privacy"];

  useEffect(() => {
    const previousDescription = document.querySelector(
      'meta[name="description"]'
    )?.content;
    document.title = `${policy.title} | LearnAI`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = policy.description;
    return () => {
      document.title = "LearnAI | A clearer path to web development skills";
      if (description && previousDescription) {
        description.content = previousDescription;
      }
    };
  }, [policy]);

  return (
    <div className="landing-page min-h-screen">
      <header className="landing-header">
        <nav className="landing-nav" aria-label="Main navigation">
          <Link to="/" className="landing-wordmark title-3">
            <span className="wordmark-symbol caption-3">L</span>
            <span>LearnAI</span>
          </Link>
          <Link to="/login" className="nav-login caption-1">
            Log in
          </Link>
        </nav>
      </header>
      <main id="main-content" className="legal-main section-frame">
        <Link to="/" className="legal-back caption-1">
          <span aria-hidden="true">←</span> Back to LearnAI
        </Link>
        <p className="eyebrow caption-3 mt-10">
          <span className="eyebrow-mark" />
          LearnAI information
        </p>
        <h1 className="heading-2 mt-4">{policy.title}</h1>
        <p className="body-6 mt-4 max-w-2xl text-white/55 text-pretty">
          {policy.description}
        </p>
        <div className="legal-sections">
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="heading-6">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p className="body-6 mt-3 text-white/60 text-pretty" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <footer className="landing-footer section-frame">
        <Link to="/" className="landing-wordmark title-3">
          <span className="wordmark-symbol caption-3">L</span>
          <span>LearnAI</span>
        </Link>
        <div className="footer-links">
          <Link className="caption-1" to="/privacy">
            Privacy
          </Link>
          <Link className="caption-1" to="/terms">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
