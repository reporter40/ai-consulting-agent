"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Menu, X } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const NAV_LINKS = [
  { label: "Технологии", href: "#tech" },
  { label: "История", href: "#legacy" },
  { label: "Карта памяти", href: "#map" },
  { label: "Этика", href: "#ethics" },
  { label: "Команда", href: "#team" },
] as const;

export function LandingNav() {
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useGSAP(() => {
    if (!navRef.current) return;

    ScrollTrigger.create({
      start: "top -80",
      onUpdate: (self) => {
        if (!navRef.current) return;
        if (self.direction === 1) {
          gsap.to(navRef.current, {
            backdropFilter: "blur(20px)",
            backgroundColor: "rgba(10, 10, 10, 0.9)",
            duration: 0.3,
          });
        }
      },
    });
  }, { scope: navRef });

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-colors lg:px-12"
    >
      <a href="/landing" className="font-heading text-2xl font-bold tracking-tight text-landing-text">
        Герои<span className="text-landing-accent"> не умирают</span>
      </a>

      {/* Desktop */}
      <div className="hidden items-center gap-8 md:flex">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm text-landing-muted transition-colors hover:text-landing-text"
          >
            {link.label}
          </a>
        ))}
        <a
          href="#search"
          className="rounded-full bg-landing-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Найти родственника
        </a>
      </div>

      {/* Mobile toggle */}
      <button
        className="text-landing-text md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 flex flex-col gap-4 bg-landing-bg/95 p-6 backdrop-blur-xl md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-landing-muted hover:text-landing-text"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#search"
            className="rounded-full bg-landing-accent px-5 py-2 text-center text-sm font-medium text-white"
            onClick={() => setMobileOpen(false)}
          >
            Найти родственника
          </a>
        </div>
      )}
    </nav>
  );
}
