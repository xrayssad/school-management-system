"use client";

import Image from "next/image";
import { colors } from "@/lib/colors";

type Props = {
  label?: string;
};

/** Katikati kabisa: juu/chini + kushoto/kulia */
export default function MadrasaLoader({ label = "Inapakia…" }: Props) {
  return (
    <div
      className="flex w-full flex-col items-center justify-center"
      style={{ minHeight: "min(70vh, 520px)" }}
    >
      <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center">
        <span
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent"
          style={{
            borderTopColor: colors.primary,
            borderRightColor: colors.sage || "#8FD9BA",
          }}
        />
        <Image
          src="/images/logo2.jpg"
          alt="Madrasa"
          width={44}
          height={44}
          className="rounded-full object-cover"
          style={{ width: 44, height: "auto" }}
          priority
        />
      </div>
      <p className="mt-4 text-sm font-medium" style={{ color: colors.stone }}>
        {label}
      </p>
    </div>
  );
}
