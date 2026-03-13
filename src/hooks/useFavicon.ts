"use client";

import { useEffect } from "react";

const RADIUS = 11;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function useFavicon(isWork: boolean, progress: number) {
  useEffect(() => {
    const ring = isWork ? "#f59e0b" : "#71717a";
    const track = "#27272a";
    const bg = "#09090b";
    const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="15" fill="${bg}"/>
  <circle cx="16" cy="16" r="${RADIUS}" fill="none" stroke="${track}" stroke-width="3"/>
  <circle
    cx="16" cy="16" r="${RADIUS}" fill="none"
    stroke="${ring}" stroke-width="3"
    stroke-linecap="round"
    stroke-dasharray="${CIRCUMFERENCE.toFixed(2)}"
    stroke-dashoffset="${offset.toFixed(2)}"
    transform="rotate(-90 16 16)"
  />
</svg>`;

    const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      document.head.appendChild(link);
    }
    link.href = url;
  }, [isWork, progress]);
}
