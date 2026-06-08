"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const slides = [
  { src: "/herobanner-img1.png", title: "Start your story" },
  { src: "/herobanner-img2.png", title: "See it in action" },
];

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#@!0123456789";

function useScramble(text: string) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    let f = 0;
    const id = setInterval(() => {
      f++;
      if (f >= 16) { setOut(text); clearInterval(id); return; }
      const p = f / 16;
      setOut(
        text.split("").map((c, i) =>
          c === " " ? " " : i / text.length < p ? c : CHARS[Math.floor(Math.random() * CHARS.length)]
        ).join("")
      );
    }, 30);
    return () => clearInterval(id);
  }, [text]);
  return out;
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const curX = useRef(0);
  const curY = useRef(0);
  const rafId = useRef(0);
  const [px, setPx] = useState(0);
  const [py, setPy] = useState(0);

  const title = useScramble(slides[current].title);

  /* restart wipe animation on the target image */
  const restartAnim = useCallback((i: number) => {
    const el = imgRefs.current[i];
    if (!el) return;
    el.style.animation = "none";
    void el.offsetWidth; // force reflow
    el.style.animation = "";
  }, []);

  /* go to slide */
  const goTo = useCallback((i: number) => {
    restartAnim(i);
    setCurrent(i);
  }, [restartAnim]);

  /* auto-advance */
  useEffect(() => {
    if (hovered) return;
    const id = setInterval(() => {
      setCurrent(c => {
        const next = (c + 1) % slides.length;
        restartAnim(next);
        return next;
      });
    }, 5200);
    return () => clearInterval(id);
  }, [hovered, restartAnim]);

  /* mouse parallax — smooth lerp via rAF */
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    targetX.current = ((e.clientX - r.left) / r.width  - 0.5) * -18;
    targetY.current = ((e.clientY - r.top)  / r.height - 0.5) * -12;
  }, []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    targetX.current = 0;
    targetY.current = 0;
  }, []);

  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      curX.current += (targetX.current - curX.current) * 0.075;
      curY.current += (targetY.current - curY.current) * 0.075;
      setPx(curX.current);
      setPy(curY.current);
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(rafId.current); };
  }, []);

  return (
    <>
      <div
        ref={heroRef}
        className="hero-full"
        onMouseEnter={() => setHovered(true)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {slides.map((slide, i) => (
          <img
            key={slide.src}
            ref={el => { imgRefs.current[i] = el; }}
            src={slide.src}
            alt="MyAIDiary"
            className={`hero-slide-img${i === current ? " active" : ""}`}
            loading={i === 0 ? "eager" : "lazy"}
            style={i === current ? {
              transform: `translate(${px}px, ${py}px) scale(1.1)`,
            } : { transform: "scale(1.1)" }}
          />
        ))}

        {/* desktop: invisible until hover */}
        <div className="hero-full-overlay">
          <span className="o-title">{title}</span>
          <div className="hero-cta-row">
            <Link href="/auth?mode=signup" className="btn btn-light">Start journaling</Link>
            <Link href="/auth" className="btn btn-ghost-light">I have an account</Link>
          </div>
        </div>

        <div className="hero-dots" aria-hidden="true">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === current ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* mobile only */}
      <div className="hero-mobile-cta">
        <Link href="/auth?mode=signup" className="btn btn-sand hero-cta-btn">Start journaling</Link>
        <Link href="/auth" className="btn btn-outline hero-cta-btn">I have an account</Link>
      </div>
    </>
  );
}
