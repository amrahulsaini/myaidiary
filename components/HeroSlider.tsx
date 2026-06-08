"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const slides = [
  { src: "/herobanner-img1.png", title: "Start your story" },
  { src: "/herobanner-img2.png", title: "See it in action" },
];

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!";
const SCRAMBLE_FRAMES = 14;
const SCRAMBLE_TICK = 32; // ms per frame

function useScramble(text: string) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      if (frame >= SCRAMBLE_FRAMES) {
        setDisplay(text);
        clearInterval(id);
        return;
      }
      const progress = frame / SCRAMBLE_FRAMES;
      setDisplay(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i / text.length < progress) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("")
      );
    }, SCRAMBLE_TICK);
    return () => clearInterval(id);
  }, [text]);
  return display;
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const scrambledTitle = useScramble(slides[current].title);

  /* auto-advance */
  useEffect(() => {
    if (hovered) return;
    const id = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5200);
    return () => clearInterval(id);
  }, [hovered]);

  /* smooth mouse parallax via rAF */
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetRef.current = { x: nx * -22, y: ny * -14 };
  }, []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    targetRef.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, 0.07);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, 0.07);
      setParallax({ x: currentRef.current.x, y: currentRef.current.y });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, []);

  const imgStyle = {
    transform: `translate(${parallax.x}px, ${parallax.y}px) scale(1.09)`,
    transition: "transform 0ms linear",
  };

  return (
    <>
      <div
        ref={heroRef}
        className="hero-full"
        onMouseEnter={() => setHovered(true)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {/* image layer — all stacked, active one wipes in on top */}
        <div className="hero-img-track" style={imgStyle}>
          {slides.map((slide, i) => (
            <img
              key={slide.src}
              src={slide.src}
              alt="MyAIDiary — AI-powered journaling"
              className={`hero-slide-img${i === current ? " active" : ""}`}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "auto"}
            />
          ))}
        </div>

        {/* desktop overlay — fades in on hover */}
        <div className="hero-full-overlay">
          <span className="o-title">{scrambledTitle}</span>
          <div className="hero-cta-row">
            <Link href="/auth?mode=signup" className="btn btn-light">Start journaling</Link>
            <Link href="/auth" className="btn btn-ghost-light">I have an account</Link>
          </div>
        </div>

        {/* always-visible dots */}
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

      {/* mobile — CTAs below the slider */}
      <div className="hero-mobile-cta">
        <Link href="/auth?mode=signup" className="btn btn-sand hero-cta-btn">Start journaling</Link>
        <Link href="/auth" className="btn btn-outline hero-cta-btn">I have an account</Link>
      </div>
    </>
  );
}
