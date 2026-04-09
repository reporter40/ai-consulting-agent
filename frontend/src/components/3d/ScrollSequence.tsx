"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollSequenceProps {
  children: ReactNode;
  className?: string;
  /** Total scrollable height as multiplier of viewport (default: 5) */
  scrollHeight?: number;
}

/**
 * Wrapper that pins its children and provides a normalized scroll progress
 * to child elements via CSS custom property --scroll-progress (0 → 1).
 */
export function ScrollSequence({
  children,
  className = "",
  scrollHeight = 5,
}: ScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current || !pinnedRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: pinnedRef.current,
        scrub: true,
        onUpdate: (self) => {
          pinnedRef.current?.style.setProperty(
            "--scroll-progress",
            String(self.progress)
          );
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: `${scrollHeight * 100}vh` }}
    >
      <div
        ref={pinnedRef}
        className="h-screen w-full overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}
