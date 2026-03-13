"use client";

interface ControlsProps {
  isRunning: boolean;
  onStartPause: () => void;
  onSkip: () => void;
  onReset: () => void;
}

const secondaryBtn =
  "px-6 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

export default function Controls({ isRunning, onStartPause, onSkip, onReset }: ControlsProps) {
  return (
    <div className="flex items-center gap-4 mt-10">
      <button
        onClick={onReset}
        aria-label="reset timer"
        className={secondaryBtn}
      >
        reset
      </button>

      <button
        onClick={onStartPause}
        aria-label={isRunning ? "pause timer" : "start timer"}
        className="px-8 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-sm transition-all duration-150 hover:scale-105 active:scale-[0.93] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        {isRunning ? "pause" : "start"}
      </button>

      <button
        onClick={onSkip}
        aria-label="skip to next phase"
        className={secondaryBtn}
      >
        skip
      </button>
    </div>
  );
}
