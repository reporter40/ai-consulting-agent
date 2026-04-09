"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface CTASectionProps {
  heading?: string;
  subheading?: string;
  buttonText?: string;
  buttonHref?: string;
}

export function CTASection({
  heading = "Ready to launch?",
  subheading = "Start building your immersive 3D experience today.",
  buttonText = "Get Started",
  buttonHref = "#",
}: CTASectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const elements = sectionRef.current.querySelectorAll("[data-animate]");

    gsap.fromTo(
      elements,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-6 py-32"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-landing-accent/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2
          data-animate
          className="mb-4 text-4xl font-bold tracking-tight text-landing-text md:text-5xl"
        >
          {heading}
        </h2>
        <p
          data-animate
          className="mb-8 text-lg text-landing-muted"
        >
          {subheading}
        </p>
        <a
          data-animate
          href={buttonHref}
          className="inline-flex items-center gap-2 rounded-full bg-landing-accent px-8 py-3 text-base font-medium text-landing-bg transition-all hover:gap-3 hover:opacity-90"
        >
          {buttonText}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
