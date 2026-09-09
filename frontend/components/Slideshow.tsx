"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/images/pici1.jpg", alt: "Students reciting Qur'an together in class" },
  { src: "/images/pici2.jpg", alt: "Boys and girls studying in separate rows during lesson" },
  { src: "/images/pici3.jpg", alt: "Girls in hijab reading from their Qur'an copies" },
];

export default function Slideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -right-4 -top-4 h-full w-full rounded-xl2 border-2 border-gold-400/50" aria-hidden />
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl2 shadow-soft">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <Image src={slide.src} alt={slide.alt} fill priority={i === 0} sizes="(max-width: 768px) 90vw, 480px" className="object-cover" />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-teal-900/70 to-transparent p-5">
          <p className="text-sm font-medium text-white">Daily lessons in Qur&apos;an, Tajweed &amp; Islamic studies</p>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === index ? 24 : 8, backgroundColor: i === index ? "#0B4F45" : "#CFE4DF" }}
          />
        ))}
      </div>
    </div>
  );
}
