"use client";
import { useEffect } from "react";

export function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector(".site-header") as HTMLElement | null;
    if (!header) return;
    const sync = () => header.classList.toggle("scrolled", window.scrollY > 40);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);
  return null;
}
