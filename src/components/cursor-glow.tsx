"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!glow || !finePointer.matches || reducedMotion.matches) return;

    function moveGlow(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      glow?.style.setProperty("--cursor-x", `${event.clientX}px`);
      glow?.style.setProperty("--cursor-y", `${event.clientY}px`);
      glow?.classList.add("is-visible");
    }

    function hideGlow() {
      glow?.classList.remove("is-visible");
    }

    window.addEventListener("pointermove", moveGlow, { passive: true });
    document.documentElement.addEventListener("pointerleave", hideGlow);
    return () => {
      window.removeEventListener("pointermove", moveGlow);
      document.documentElement.removeEventListener("pointerleave", hideGlow);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
