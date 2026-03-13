"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Settings from "@/components/Settings";
import Timer from "@/components/Timer";
import { useSettings } from "@/hooks/useSettings";

export default function Home() {
  const { settings, update } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar onSettingsClick={() => setSettingsOpen(true)} />

      <div className="flex items-center justify-center min-h-screen">
        <Timer settings={settings} />
      </div>

      <Settings
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={update}
      />
    </main>
  );
}
