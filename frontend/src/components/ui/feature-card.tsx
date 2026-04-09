"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon: Icon, title, description, index = 0 }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        delay: index * 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: cardRef });

  return (
    <div
      ref={cardRef}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-colors hover:border-landing-accent/30 hover:bg-white/[0.06]"
    >
      <div className="mb-4 inline-flex rounded-xl bg-landing-accent/10 p-3">
        <Icon className="h-6 w-6 text-landing-accent" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-landing-text">{title}</h3>
      <p className="text-sm leading-relaxed text-landing-muted">{description}</p>
    </div>
  );
}
