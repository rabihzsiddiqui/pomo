"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_LONG_BREAK_MINUTES,
  DEFAULT_SHORT_BREAK_MINUTES,
  DEFAULT_WORK_MINUTES,
  SESSIONS_BEFORE_LONG_BREAK,
} from "@/lib/constants";

export interface Settings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  dailyGoal: number; // 0 = no goal
}

const STORAGE_KEY = "pomo:settings";

const defaults: Settings = {
  workMinutes: DEFAULT_WORK_MINUTES,
  shortBreakMinutes: DEFAULT_SHORT_BREAK_MINUTES,
  longBreakMinutes: DEFAULT_LONG_BREAK_MINUTES,
  sessionsBeforeLongBreak: SESSIONS_BEFORE_LONG_BREAK,
  dailyGoal: 8,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaults);

  useEffect(() => {
    setSettings(load());
  }, []);

  function update(next: Settings) {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — silently ignore
    }
  }

  return { settings, update };
}
