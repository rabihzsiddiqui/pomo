"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useSessions } from "@/hooks/useSessions";
import { useNotifications } from "@/hooks/useNotifications";
import { useChime } from "@/hooks/useChime";
import { useFavicon } from "@/hooks/useFavicon";
import type { Settings } from "@/hooks/useSettings";
import { PHASE_LABELS, PHASES } from "@/lib/constants";
import type { Phase } from "@/lib/constants";
import Controls from "./Controls";
import Ring from "./Ring";
import SessionLog from "./SessionLog";

interface TimerProps {
  settings: Settings;
}

function totalForMode(mode: string, settings: Settings): number {
  if (mode === PHASES.WORK) return settings.workMinutes * 60;
  if (mode === PHASES.SHORT_BREAK) return settings.shortBreakMinutes * 60;
  return settings.longBreakMinutes * 60;
}

function notificationMessage(mode: Phase): { title: string; body: string } {
  if (mode === PHASES.WORK) return { title: "back to work", body: "break over. focus up." };
  if (mode === PHASES.SHORT_BREAK) return { title: "short break", body: "nice work. rest for a bit." };
  return { title: "long break", body: "you earned it. step away." };
}

export default function Timer({ settings }: TimerProps) {
  const { mode, timeRemaining, isRunning, completedSessions, start, pause, resume, skip, reset } =
    usePomodoro(settings);

  const { completedToday, logSession } = useSessions();
  const { requestPermission, notify } = useNotifications();
  const { play } = useChime();

  const total = totalForMode(mode, settings);
  const progress = timeRemaining / total;
  const isWork = mode === PHASES.WORK;

  useFavicon(isWork, progress);

  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("pomo-muted") === "1";
  });

  const [showHint, setShowHint] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("pomo-hint-dismissed") !== "1";
  });

  // reset timer whenever settings change
  const settingsKey = `${settings.workMinutes}-${settings.shortBreakMinutes}-${settings.longBreakMinutes}-${settings.sessionsBeforeLongBreak}`;
  const prevKeyRef = useRef(settingsKey);
  useEffect(() => {
    if (prevKeyRef.current !== settingsKey) {
      prevKeyRef.current = settingsKey;
      reset();
    }
  }, [settingsKey, reset]);

  // log to localStorage whenever a work session completes
  const prevCompletedRef = useRef(completedSessions);
  useEffect(() => {
    if (completedSessions > prevCompletedRef.current) {
      logSession();
    }
    prevCompletedRef.current = completedSessions;
  }, [completedSessions, logSession]);

  // notify + chime on phase transition
  const prevModeRef = useRef<Phase>(mode);
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;
      const { title, body } = notificationMessage(mode);
      notify(title, body);
      if (!muted) play();
    }
  }, [mode, notify, play, muted]);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    localStorage.setItem("pomo-hint-dismissed", "1");
  }, []);

  function handleStartPause() {
    if (!isRunning) requestPermission();
    if (isRunning) {
      pause();
    } else if (timeRemaining < total) {
      resume();
    } else {
      start();
    }
    dismissHint();
  }

  function handleSkip() {
    skip();
    dismissHint();
  }

  function handleReset() {
    reset();
    dismissHint();
  }

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem("pomo-muted", next ? "1" : "0");
      return next;
    });
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.code === "Space") {
        e.preventDefault();
        handleStartPause();
      } else if (e.key === "s" || e.key === "S") {
        handleSkip();
      } else if (e.key === "r" || e.key === "R") {
        handleReset();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex flex-col items-center px-4">
      <span
        key={mode}
        aria-live="polite"
        aria-atomic="true"
        className="animate-phase-in text-sm font-medium text-zinc-400 tracking-widest uppercase mb-8"
      >
        {PHASE_LABELS[mode]}
      </span>

      <div key={`ring-${mode}`} className="animate-phase-in">
        <Ring
          progress={progress}
          timeRemaining={timeRemaining}
          isWork={isWork}
          label={PHASE_LABELS[mode]}
        />
      </div>

      <Controls
        isRunning={isRunning}
        onStartPause={handleStartPause}
        onSkip={handleSkip}
        onReset={handleReset}
      />

      <div className="flex flex-col items-center gap-2 mt-4">
        <div
          className="text-xs text-zinc-600 transition-opacity duration-500"
          style={{ opacity: showHint ? 1 : 0, pointerEvents: "none" }}
          aria-hidden={!showHint}
        >
          space start/pause &middot; s skip &middot; r reset
        </div>

        <button
          onClick={toggleMute}
          aria-label={muted ? "unmute chime" : "mute chime"}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-200 focus-visible:outline-none focus-visible:text-zinc-400"
        >
          {muted ? "sound off" : "sound on"}
        </button>
      </div>

      <SessionLog completed={completedToday} goal={settings.dailyGoal} />
    </div>
  );
}
