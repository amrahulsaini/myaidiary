"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const slides = [
  { src: "/herobanner-img1.png", title: "Start your story" },
  { src: "/herobanner-img2.png", title: "See it in action" },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;
    const id = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [hovered]);

  return (
    <>
      <div
        className="hero-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {slides.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt="MyAIDiary — AI-powered journaling"
            className={`hero-slide-img${i === current ? " active" : ""}`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}

        <div className="hero-full-overlay">
          <span className="o-title" key={current}>{slides[current].title}</span>
          <Link href="/auth?mode=signup" className="btn btn-light">Start journaling</Link>
          <Link href="/auth" className="btn btn-ghost-light">I have an account</Link>
        </div>

        <div className="hero-dots" aria-hidden="true">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === current ? " active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Mobile CTAs — shown below the slider on touch/no-hover devices */}
      <div className="hero-mobile-cta">
        <Link href="/auth?mode=signup" className="btn btn-sand hero-cta-btn">Start journaling</Link>
        <Link href="/auth" className="btn btn-outline hero-cta-btn">I have an account</Link>
      </div>
    </>
  );
}
