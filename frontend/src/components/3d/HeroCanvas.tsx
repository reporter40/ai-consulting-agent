"use client";

import { useRef, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroCanvasProps {
  frameCount: number;
  framePath: string; // e.g. "/frames/hero/frame_" — appends "00.svg", "01.svg", etc.
  frameExtension?: string;
  className?: string;
}

export function HeroCanvas({
  frameCount,
  framePath,
  frameExtension = "svg",
  className = "",
}: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  const padIndex = useCallback(
    (i: number) => String(i).padStart(2, "0"),
    []
  );

  // Preload all frames
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = `${framePath}${padIndex(i)}.${frameExtension}`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          // Draw first frame immediately
          renderFrame(0, images);
        }
      };
      images.push(img);
    }

    framesRef.current = images;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount, framePath, frameExtension]);

  const renderFrame = useCallback(
    (index: number, images?: HTMLImageElement[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const frames = images || framesRef.current;
      const img = frames[index];
      if (!img || !img.complete) return;

      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const canvasW = canvas.offsetWidth;
      const canvasH = canvas.offsetHeight;

      // Cover fit
      const scale = Math.max(canvasW / img.width, canvasH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvasW - w) / 2;
      const y = (canvasH - h) / 2;

      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.drawImage(img, x, y, w, h);
    },
    []
  );

  useGSAP(
    () => {
      if (!containerRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          const newFrame = Math.min(
            frameCount - 1,
            Math.floor(self.progress * frameCount)
          );
          if (newFrame !== currentFrameRef.current) {
            currentFrameRef.current = newFrame;
            renderFrame(newFrame);
          }
        },
      });

      // Fade-in animation
      gsap.fromTo(
        canvasRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef, dependencies: [frameCount] }
  );

  return (
    <div
      ref={containerRef}
      className={`relative h-[300vh] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="sticky top-0 h-screen w-full"
      />
    </div>
  );
}
