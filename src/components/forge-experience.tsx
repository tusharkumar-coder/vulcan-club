"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const Scene = dynamic(() => import("@/components/forge-canvas"), {
  ssr: false,
  loading: () => null,
});
const subscribeNoop = () => () => {};
const subscribeReducedMotion = (notify: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getMobileMode = () =>
  window.matchMedia("(max-width: 760px)").matches ||
  (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency < 6);
const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

export function ForgeExperience() {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
  const mobile = useSyncExternalStore(subscribeNoop, getMobileMode, () => false);
  const ready = useSyncExternalStore(subscribeNoop, supportsWebGL, () => false);
  useEffect(() => {
    const node = host.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.02,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="forge-canvas" ref={host} aria-hidden="true">
      <div className="forge-fallback" />
      {ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: visible ? 1 : 0,
            transition: "opacity .5s",
          }}
        >
          <Scene reduced={reduced || !visible} mobile={mobile} active={visible && !reduced} />
        </div>
      )}
    </div>
  );
}
