"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { colors } from "@/lib/colors";

export type Slide = {
  src: string;
  alt: string;
  caption?: string;
};

const DEFAULT_SLIDES: Slide[] = [
  {
    src: "/images/pici1.jpg",
    alt: "Wanafunzi wakisoma Qurani",
    caption: "Masomo ya kila siku ya Qurani na Tajwid",
  },
  {
    src: "/images/pici2.jpg",
    alt: "Mazingira ya kujifunza",
    caption: "Mazingira tulivu kwa kila mwanafunzi",
  },
  {
    src: "/images/pici3.jpg",
    alt: "Wanafunzi darasani",
    caption: "Ufuatiliaji wa maendeleo",
  },
];

type SlideshowProps = {
  slides?: Slide[];
  intervalMs?: number;
  className?: string;
  showDots?: boolean;
};

export default function Slideshow({
  slides = DEFAULT_SLIDES,
  intervalMs = 5000,
  className = "",
  showDots = true,
}: SlideshowProps) {
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      if (next === index) return;
      setPrev(index);
      setIndex(next);
    },
    [index]
  );

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => {
        setPrev(i);
        return (i + 1) % slides.length;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  const active = slides[index];

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className="relative overflow-hidden rounded-xl border"
        style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(0,0,0,0.15)" }}
      >
        <div className="relative aspect-[16/10] w-full">
          {slides.map((slide, i) => {
            const isActive = i === index;
            return (
              <div
                key={slide.src}
                className="absolute inset-0"
                style={{
                  zIndex: isActive ? 2 : i === prev ? 1 : 0,
                  clipPath: isActive ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                  transition: isActive
                    ? "clip-path 0.85s cubic-bezier(0.22, 1, 0.36, 1)"
                    : "none",
                }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-cover"
                />
              </div>
            );
          })}
          {active?.caption && (
            <div
              className="absolute inset-x-0 bottom-0 z-10 px-4 py-3"
              style={{
                background: `linear-gradient(to top, ${colors.primary}F0, transparent)`,
              }}
            >
              <p className="text-xs font-medium text-white sm:text-sm">{active.caption}</p>
            </div>
          )}
        </div>
      </div>
      {showDots && (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Picha ${i + 1}`}
              onClick={() => goTo(i)}
              className="h-1 rounded-full transition-all"
              style={{
                width: i === index ? 22 : 7,
                backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
