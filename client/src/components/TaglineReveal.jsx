import { useEffect, useRef, useState } from "react";

function RevealWord({ word, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 1, rootMargin: "0px 0px -42% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={ref}
      className={`tagline-word${visible ? " is-visible" : ""}`}
      style={{ "--word-index": Math.min(index, 6) }}
    >
      {word}{" "}
    </span>
  );
}

export default function TaglineReveal() {
  const lines = ["Learn a little.", "Build something real."];
  let wordIndex = 0;

  return (
    <section
      aria-label="Learn a little. Build something real."
      className="tagline-section section-frame"
    >
      <p className="caption-3 mb-4 uppercase tracking-[0.12em] text-white/50">
        A better way to keep going
      </p>
      <h2 className="heading-2 max-w-[680px] text-balance">
        {lines.map((line) => (
          <span className="block" key={line}>
            {line.split(" ").map((word) => (
              <RevealWord key={`${word}-${wordIndex}`} word={word} index={wordIndex++} />
            ))}
          </span>
        ))}
      </h2>
    </section>
  );
}
