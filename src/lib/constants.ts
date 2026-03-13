export const DEFAULT_WORK_MINUTES = 25;
export const DEFAULT_SHORT_BREAK_MINUTES = 5;
export const DEFAULT_LONG_BREAK_MINUTES = 15;
export const SESSIONS_BEFORE_LONG_BREAK = 4;

export const PHASES = {
  WORK: "work",
  SHORT_BREAK: "short_break",
  LONG_BREAK: "long_break",
} as const;

export type Phase = (typeof PHASES)[keyof typeof PHASES];

export const PHASE_LABELS: Record<Phase, string> = {
  work: "focus",
  short_break: "short break",
  long_break: "long break",
};
