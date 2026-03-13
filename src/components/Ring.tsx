"use client";

import { formatTime } from "@/lib/utils";

const RADIUS = 120;
const STROKE = 10;
const SIZE = (RADIUS + STROKE) * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RingProps {
  progress: number; // 0 (empty) to 1 (full)
  timeRemaining: number; // seconds
  isWork: boolean;
  label: string; // current phase label for accessibility
}

export default function Ring({ progress, timeRemaining, isWork, label }: RingProps) {
  const offset = CIRCUMFERENCE * (1 - Math.max(0, Math.min(1, progress)));
  const trackColor = isWork ? "#f59e0b" : "#52525b"; // amber-500 / zinc-600

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* background track */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#27272a"
          strokeWidth={STROKE}
        />
        {/* progress arc */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={trackColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease, filter 0.5s ease",
            filter: isWork ? "drop-shadow(0 0 8px rgba(245,158,11,0.25))" : "none",
          }}
        />
      </svg>

      {/* centered time display — screen-reader accessible */}
      <div
        role="timer"
        aria-label={`${label}: ${formatTime(timeRemaining)} remaining`}
        className="absolute flex flex-col items-center select-none"
      >
        <span className="text-5xl font-bold text-white tabular-nums tracking-tight" aria-hidden="true">
          {formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  );
}
