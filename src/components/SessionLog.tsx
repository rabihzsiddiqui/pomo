"use client";

interface SessionLogProps {
  completed: number;
  goal: number;
  onReset: () => void;
}

export default function SessionLog({ completed, goal, onReset }: SessionLogProps) {
  const hasGoal = goal > 0;
  const dotCount = hasGoal ? goal : completed;

  if (dotCount === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2.5 mt-8">
      <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-xs">
        {Array.from({ length: dotCount }, (_, i) => (
          <span
            key={i}
            className={
              i < completed
                ? "w-2 h-2 rounded-full bg-amber-500"
                : "w-2 h-2 rounded-full bg-zinc-700"
            }
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-600">
          {hasGoal
            ? `${completed} of ${goal} sessions`
            : `${completed} session${completed !== 1 ? "s" : ""} today`}
        </span>
        <button
          onClick={onReset}
          aria-label="reset session count"
          className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors duration-200 focus-visible:outline-none focus-visible:text-zinc-500"
        >
          clear
        </button>
      </div>
    </div>
  );
}
