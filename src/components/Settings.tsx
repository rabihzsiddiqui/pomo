"use client";

import { useEffect, useState } from "react";
import type { Settings } from "@/hooks/useSettings";

interface SettingsProps {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (next: Settings) => void;
}

interface FieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function Field({ label, value, min, max, onChange }: FieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-zinc-300">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= min && v <= max) onChange(v);
        }}
        className="w-20 px-3 py-1.5 text-sm text-right text-white bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500/60 transition-colors"
      />
    </div>
  );
}

export default function Settings({ open, settings, onClose, onSave }: SettingsProps) {
  const [draft, setDraft] = useState<Settings>(settings);

  // sync draft when external settings change (e.g. on load from localStorage)
  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function handleApply() {
    onSave(draft);
    onClose();
  }

  function handleBackdropClick() {
    // discard draft — reset to current saved settings
    setDraft(settings);
    onClose();
  }

  return (
    <>
      {/* backdrop */}
      <div
        aria-hidden="true"
        onClick={handleBackdropClick}
        className={[
          "fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* panel */}
      <aside
        aria-label="settings"
        role="dialog"
        aria-modal="true"
        className={[
          "fixed top-0 right-0 z-50 h-full w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white tracking-wide">settings</h2>
          <button
            onClick={handleBackdropClick}
            aria-label="close settings"
            className="text-zinc-500 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* fields */}
        <div className="flex-1 px-6 py-6 flex flex-col gap-6 overflow-y-auto">
          <section className="flex flex-col gap-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">durations (minutes)</p>
            <Field
              label="work"
              value={draft.workMinutes}
              min={1}
              max={120}
              onChange={(v) => setDraft((d) => ({ ...d, workMinutes: v }))}
            />
            <Field
              label="short break"
              value={draft.shortBreakMinutes}
              min={1}
              max={60}
              onChange={(v) => setDraft((d) => ({ ...d, shortBreakMinutes: v }))}
            />
            <Field
              label="long break"
              value={draft.longBreakMinutes}
              min={1}
              max={60}
              onChange={(v) => setDraft((d) => ({ ...d, longBreakMinutes: v }))}
            />
          </section>

          <section className="flex flex-col gap-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">sessions</p>
            <Field
              label="sessions before long break"
              value={draft.sessionsBeforeLongBreak}
              min={1}
              max={10}
              onChange={(v) => setDraft((d) => ({ ...d, sessionsBeforeLongBreak: v }))}
            />
            <Field
              label="daily goal (0 to disable)"
              value={draft.dailyGoal}
              min={0}
              max={24}
              onChange={(v) => setDraft((d) => ({ ...d, dailyGoal: v }))}
            />
          </section>
        </div>

        {/* footer */}
        <div className="px-6 py-5 border-t border-zinc-800">
          <button
            onClick={handleApply}
            className="w-full px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            apply
          </button>
        </div>
      </aside>
    </>
  );
}
