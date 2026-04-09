"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ParallaxLayerProps {
  children: ReactNode;
  /** Parallax speed: 1 = normal scroll, 0.5 = half speed, 2 = double speed */
  speed?: number;
  /** Y offset range in pixels */
  offset?: number;
  className?: string;
}

export function ParallaxLayer({
  children,
  speed = 0.5,
  offset = 200,
  className = "",
}: ParallaxLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!layerRef.current) return;

    gsap.fromTo(
      layerRef.current,
      { y: -offset * speed },
      {
        y: offset * speed,
        ease: "none",
        scrollTrigger: {
          trigger: layerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }, { scope: layerRef });

  return (
    <div ref={layerRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
