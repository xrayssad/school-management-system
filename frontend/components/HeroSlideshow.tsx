"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/images/pici1.jpg",
    alt: "Wanafunzi darasani",
    caption: "Masomo ya kila siku ya Qur'ani, Tajweed na dini",
  },
  {
    src: "/images/pici2.jpg",
    alt: "Mazingira ya kujifunza",
    caption: "Mazingira tulivu ya kujifunza kwa kila mwanafunzi",
  },
  {
    src: "/images/pici3.jpg",
    alt: "Wasichana wakisoma",
    caption: "Ufuatiliaji wa karibu kwa maendeleo ya kila mtoto",
  },
  {
    src: "/images/q1.jpg",
    alt: "Qur'ani",
    caption: "Qur'ani ndio msingi wa kila somo",
  },
];

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Picha */}
      {SLIDES.map((s, i) => (
        <div
          key={s.src}
          className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0, zIndex: 0 }}
        >
          <Image
            src={s.src}
            alt={s.alt}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay — si nyeusi sana ili maneno yaonekane */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,47,40,0.45) 0%, rgba(15,47,40,0.30) 45%, rgba(15,47,40,0.65) 100%)",
        }}
      />
    </div>
  );
}

/** Caption inayobadilika na slide — weka nje ya HeroSlideshow kwenye page */
export function useHeroSlideCaption() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);
  return SLIDES[index]?.caption ?? "";
}

export { SLIDES };
