import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePomodoro } from "./usePomodoro";
import { PHASES } from "@/lib/constants";

// Use 1-minute durations so tests advance quickly
const SHORT = { workMinutes: 1, shortBreakMinutes: 1, longBreakMinutes: 2 };
const TICK = 1000; // one second in ms

describe("usePomodoro — initial state", () => {
  it("starts in work mode with default 25-minute duration", () => {
    const { result } = renderHook(() => usePomodoro());
    expect(result.current.mode).toBe(PHASES.WORK);
    expect(result.current.timeRemaining).toBe(25 * 60);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.completedSessions).toBe(0);
  });

  it("respects custom config durations", () => {
    const { result } = renderHook(() =>
      usePomodoro({ workMinutes: 30, shortBreakMinutes: 10, longBreakMinutes: 20 }),
    );
    expect(result.current.timeRemaining).toBe(30 * 60);
  });
});

describe("usePomodoro — start / pause / resume", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("start sets isRunning to true", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);
  });

  it("counts down one second per tick", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5 * TICK));
    expect(result.current.timeRemaining).toBe(SHORT.workMinutes * 60 - 5);
  });

  it("pause stops countdown and sets isRunning false", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3 * TICK));
    act(() => result.current.pause());

    const frozenTime = result.current.timeRemaining;
    act(() => vi.advanceTimersByTime(5 * TICK)); // should not move
    expect(result.current.timeRemaining).toBe(frozenTime);
    expect(result.current.isRunning).toBe(false);
  });

  it("resume continues from paused time", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5 * TICK));
    act(() => result.current.pause());

    const pausedAt = result.current.timeRemaining;
    act(() => result.current.resume());
    act(() => vi.advanceTimersByTime(3 * TICK));
    expect(result.current.timeRemaining).toBe(pausedAt - 3);
    expect(result.current.isRunning).toBe(true);
  });

  it("calling start twice does not double-tick", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.start());
    act(() => result.current.start()); // second call should be a no-op
    act(() => vi.advanceTimersByTime(2 * TICK));
    expect(result.current.timeRemaining).toBe(SHORT.workMinutes * 60 - 2);
  });
});

describe("usePomodoro — reset", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("reset restores full duration for current mode and stops timer", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10 * TICK));
    act(() => result.current.reset());
    expect(result.current.timeRemaining).toBe(SHORT.workMinutes * 60);
    expect(result.current.isRunning).toBe(false);
  });

  it("timer does not advance after reset", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(10 * TICK));
    act(() => result.current.reset());
    act(() => vi.advanceTimersByTime(5 * TICK));
    expect(result.current.timeRemaining).toBe(SHORT.workMinutes * 60);
  });
});

describe("usePomodoro — skip", () => {
  it("skip from work increments session count and moves to short break", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.skip());
    expect(result.current.mode).toBe(PHASES.SHORT_BREAK);
    expect(result.current.completedSessions).toBe(1);
    expect(result.current.isRunning).toBe(false);
  });

  it("skip from break returns to work without incrementing session count", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.skip()); // work → short break
    act(() => result.current.skip()); // short break → work
    expect(result.current.mode).toBe(PHASES.WORK);
    expect(result.current.completedSessions).toBe(1);
  });

  it("skip sets timeRemaining to the correct duration for new phase", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.skip()); // work → short break
    expect(result.current.timeRemaining).toBe(SHORT.shortBreakMinutes * 60);
  });
});

describe("usePomodoro — mode transitions", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("transitions to short break when work timer expires", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(SHORT.workMinutes * 60 * TICK));
    expect(result.current.mode).toBe(PHASES.SHORT_BREAK);
    expect(result.current.completedSessions).toBe(1);
    expect(result.current.isRunning).toBe(false);
  });

  it("transitions back to work when break timer expires", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(SHORT.workMinutes * 60 * TICK)); // work done
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(SHORT.shortBreakMinutes * 60 * TICK)); // break done
    expect(result.current.mode).toBe(PHASES.WORK);
    expect(result.current.completedSessions).toBe(1);
  });
});

describe("usePomodoro — long break trigger", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("triggers long break (via skip) after 4 completed work sessions", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));

    act(() => result.current.skip()); // 1 work done → short break
    act(() => result.current.skip()); // short break → work
    act(() => result.current.skip()); // 2 work done → short break
    act(() => result.current.skip()); // short break → work
    act(() => result.current.skip()); // 3 work done → short break
    act(() => result.current.skip()); // short break → work
    act(() => result.current.skip()); // 4 work done → long break!

    expect(result.current.mode).toBe(PHASES.LONG_BREAK);
    expect(result.current.completedSessions).toBe(4);
    expect(result.current.timeRemaining).toBe(SHORT.longBreakMinutes * 60);
  });

  it("triggers long break (via timer) after 4 completed work sessions", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));

    // cycle through 3 work + 3 short breaks by running timers
    for (let i = 0; i < 3; i++) {
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(SHORT.workMinutes * 60 * TICK));
      act(() => result.current.start());
      act(() => vi.advanceTimersByTime(SHORT.shortBreakMinutes * 60 * TICK));
    }
    // 4th work session
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(SHORT.workMinutes * 60 * TICK));

    expect(result.current.mode).toBe(PHASES.LONG_BREAK);
    expect(result.current.completedSessions).toBe(4);
  });

  it("after long break skip returns to work mode", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));

    // Reach long break
    for (let i = 0; i < 4; i++) {
      act(() => result.current.skip()); // work done
      if (i < 3) act(() => result.current.skip()); // skip short break (not after 4th)
    }
    expect(result.current.mode).toBe(PHASES.LONG_BREAK);

    act(() => result.current.skip()); // long break → work
    expect(result.current.mode).toBe(PHASES.WORK);
    expect(result.current.completedSessions).toBe(4); // no additional increment
  });

  it("5th work session goes to short break (counter resets cycle)", () => {
    const { result } = renderHook(() => usePomodoro(SHORT));

    // Complete 4 work sessions to get long break
    act(() => result.current.skip()); // 1 work → short break
    act(() => result.current.skip()); // short break → work
    act(() => result.current.skip()); // 2 work → short break
    act(() => result.current.skip()); // short break → work
    act(() => result.current.skip()); // 3 work → short break
    act(() => result.current.skip()); // short break → work
    act(() => result.current.skip()); // 4 work → long break
    act(() => result.current.skip()); // long break → work
    act(() => result.current.skip()); // 5 work → short break (not long)

    expect(result.current.mode).toBe(PHASES.SHORT_BREAK);
    expect(result.current.completedSessions).toBe(5);
  });
});
