"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./styles.module.css";

type WindowId = "piano" | "sound" | "songs" | "metronome";

// Web Audio API oscillator types
type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

const OSCILLATOR_OPTIONS: { value: OscillatorType; label: string }[] = [
  { value: "sine", label: "Sine" },
  { value: "triangle", label: "Triangle" },
  { value: "square", label: "Square" },
  { value: "sawtooth", label: "Sawtooth" },
];

// Piano key configuration: 2 octaves (C3 to C5)
// White keys: C, D, E, F, G, A, B (7 per octave)
// Black keys: C#, D#, F#, G#, A# (5 per octave, positioned between whites)

type KeyType = "white" | "black";
type KeyInfo = { note: string; frequency: number; type: KeyType };

// Frequencies for piano notes (A4 = 440Hz)
const NOTE_FREQUENCIES: Record<string, number> = {
  C3: 130.81, "C#3": 138.59, D3: 146.83, "D#3": 155.56, E3: 164.81,
  F3: 174.61, "F#3": 185.0, G3: 196.0, "G#3": 207.65, A3: 220.0,
  "A#3": 233.08, B3: 246.94,
  C4: 261.63, "C#4": 277.18, D4: 293.66, "D#4": 311.13, E4: 329.63,
  F4: 349.23, "F#4": 369.99, G4: 392.0, "G#4": 415.3, A4: 440.0,
  "A#4": 466.16, B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  "D#5": 622.25,
  E5: 659.25,
};

// Layout: white keys in order, black keys with their position
const WHITE_KEYS: KeyInfo[] = [
  { note: "C3", frequency: NOTE_FREQUENCIES.C3, type: "white" },
  { note: "D3", frequency: NOTE_FREQUENCIES.D3, type: "white" },
  { note: "E3", frequency: NOTE_FREQUENCIES.E3, type: "white" },
  { note: "F3", frequency: NOTE_FREQUENCIES.F3, type: "white" },
  { note: "G3", frequency: NOTE_FREQUENCIES.G3, type: "white" },
  { note: "A3", frequency: NOTE_FREQUENCIES.A3, type: "white" },
  { note: "B3", frequency: NOTE_FREQUENCIES.B3, type: "white" },
  { note: "C4", frequency: NOTE_FREQUENCIES.C4, type: "white" },
  { note: "D4", frequency: NOTE_FREQUENCIES.D4, type: "white" },
  { note: "E4", frequency: NOTE_FREQUENCIES.E4, type: "white" },
  { note: "F4", frequency: NOTE_FREQUENCIES.F4, type: "white" },
  { note: "G4", frequency: NOTE_FREQUENCIES.G4, type: "white" },
  { note: "A4", frequency: NOTE_FREQUENCIES.A4, type: "white" },
  { note: "B4", frequency: NOTE_FREQUENCIES.B4, type: "white" },
  { note: "C5", frequency: NOTE_FREQUENCIES.C5, type: "white" },
  { note: "D5", frequency: NOTE_FREQUENCIES.D5, type: "white" },
  { note: "E5", frequency: NOTE_FREQUENCIES.E5, type: "white" },
];

// Black keys with position index (0 = between C3-D3, 1 = between D3-E3, etc.)
const BLACK_KEYS: { note: string; frequency: number; position: number }[] = [
  { note: "C#3", frequency: NOTE_FREQUENCIES["C#3"], position: 0 },
  { note: "D#3", frequency: NOTE_FREQUENCIES["D#3"], position: 1 },
  { note: "F#3", frequency: NOTE_FREQUENCIES["F#3"], position: 3 },
  { note: "G#3", frequency: NOTE_FREQUENCIES["G#3"], position: 4 },
  { note: "A#3", frequency: NOTE_FREQUENCIES["A#3"], position: 5 },
  { note: "C#4", frequency: NOTE_FREQUENCIES["C#4"], position: 7 },
  { note: "D#4", frequency: NOTE_FREQUENCIES["D#4"], position: 8 },
  { note: "F#4", frequency: NOTE_FREQUENCIES["F#4"], position: 10 },
  { note: "G#4", frequency: NOTE_FREQUENCIES["G#4"], position: 11 },
  { note: "A#4", frequency: NOTE_FREQUENCIES["A#4"], position: 12 },
  { note: "D#5", frequency: NOTE_FREQUENCIES["D#5"], position: 15 },
];

// Keyboard mapping: computer keys → piano notes (QWERTY layout)
// White keys: A S D F G H J K L ; ' [ ] \ , . /
// Black keys: W E R T Y U I O P 2 3 (2 and 3 for A#4, D#5)
const KEY_TO_NOTE: Record<string, string> = {
  a: "C3", s: "D3", d: "E3", f: "F3", g: "G3", h: "A3", j: "B3",
  k: "C4", l: "D4", ";": "E4", "'": "F4", "[": "G4", "]": "A4", "\\": "B4",
  ",": "C5", ".": "D5", "/": "E5",
  w: "C#3", e: "D#3", r: "F#3", t: "G#3", y: "A#3",
  u: "C#4", i: "D#4", o: "F#4", p: "G#4", "2": "A#4", "3": "D#5",
};

// Für Elise - opening melody (note, duration in ms) - slowed down for visibility
const FUR_ELISE_MELODY: { note: string; duration: number }[] = [
  { note: "E5", duration: 450 }, { note: "D#5", duration: 450 }, { note: "E5", duration: 450 },
  { note: "D#5", duration: 450 }, { note: "E5", duration: 450 }, { note: "B4", duration: 450 },
  { note: "D5", duration: 450 }, { note: "C5", duration: 450 }, { note: "A4", duration: 650 },
  { note: "C4", duration: 450 }, { note: "E4", duration: 450 }, { note: "A4", duration: 450 },
  { note: "B4", duration: 450 }, { note: "E4", duration: 450 }, { note: "G#4", duration: 450 },
  { note: "B4", duration: 450 }, { note: "C5", duration: 450 }, { note: "E4", duration: 450 },
  { note: "A4", duration: 650 }, { note: "E4", duration: 450 }, { note: "C4", duration: 450 },
  { note: "B4", duration: 450 }, { note: "E4", duration: 450 }, { note: "G#4", duration: 450 },
  { note: "B4", duration: 450 }, { note: "C5", duration: 450 }, { note: "E4", duration: 450 },
  { note: "A4", duration: 650 },
];

// Ode to Joy (Beethoven) - opening melody in D major
const ODE_TO_JOY_MELODY: { note: string; duration: number }[] = [
  { note: "D4", duration: 450 }, { note: "D4", duration: 450 }, { note: "E4", duration: 450 },
  { note: "F#4", duration: 450 }, { note: "F#4", duration: 450 }, { note: "E4", duration: 450 },
  { note: "D4", duration: 450 }, { note: "C#4", duration: 450 }, { note: "B3", duration: 450 },
  { note: "B3", duration: 450 }, { note: "C#4", duration: 450 }, { note: "D4", duration: 450 },
  { note: "D4", duration: 450 }, { note: "C#4", duration: 450 }, { note: "C#4", duration: 650 },
  { note: "D4", duration: 450 }, { note: "D4", duration: 450 }, { note: "E4", duration: 450 },
  { note: "F#4", duration: 450 }, { note: "F#4", duration: 450 }, { note: "E4", duration: 450 },
  { note: "D4", duration: 450 }, { note: "C#4", duration: 450 }, { note: "B3", duration: 450 },
  { note: "B3", duration: 450 }, { note: "C#4", duration: 450 }, { note: "D4", duration: 450 },
  { note: "C#4", duration: 450 }, { note: "B3", duration: 450 }, { note: "B3", duration: 650 },
];

export default function DigitalPianoPrototype() {
  const [oscillatorType, setOscillatorType] = useState<OscillatorType>("sine");
  const [pianoPosition, setPianoPosition] = useState({ x: 80, y: 60 });
  const [soundPosition, setSoundPosition] = useState({ x: 80, y: 420 });
  const [songsPosition, setSongsPosition] = useState({ x: 80, y: 560 });
  const [metronomePosition, setMetronomePosition] = useState({ x: 80, y: 720 });
  const [metronomeBpm, setMetronomeBpm] = useState(60);
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [metronomeBeat, setMetronomeBeat] = useState(0);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [draggingWindow, setDraggingWindow] = useState<WindowId | null>(null);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, windowX: 0, windowY: 0 });
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
  const metronomeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Center windows on first load (client-side only)
  useEffect(() => {
    const pianoWidth = 720;
    const soundWidth = 360;
    const songsWidth = 300;
    setPianoPosition({
      x: Math.max(20, (window.innerWidth - pianoWidth) / 2),
      y: Math.max(20, (window.innerHeight - 380) / 2 - 80),
    });
    setSoundPosition({
      x: Math.max(20, (window.innerWidth - soundWidth) / 2 - 180),
      y: Math.max(20, (window.innerHeight - 380) / 2 + 180),
    });
    setSongsPosition({
      x: Math.max(20, (window.innerWidth - songsWidth) / 2 + 180),
      y: Math.max(20, (window.innerHeight - 380) / 2 + 180),
    });
    setMetronomePosition({
      x: Math.max(20, (window.innerWidth - 280) / 2),
      y: Math.max(20, (window.innerHeight - 380) / 2 + 320),
    });
  }, []);

  const getWindowPosition = useCallback((windowId: WindowId) => {
    if (windowId === "piano") return pianoPosition;
    if (windowId === "sound") return soundPosition;
    if (windowId === "songs") return songsPosition;
    return metronomePosition;
  }, [pianoPosition, soundPosition, songsPosition, metronomePosition]);

  const handleDragStart = useCallback((windowId: WindowId, e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getWindowPosition(windowId);
    setDraggingWindow(windowId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      windowX: pos.x,
      windowY: pos.y,
    };
  }, [getWindowPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggingWindow === null) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    const newX = Math.max(0, dragStartRef.current.windowX + dx);
    const newY = Math.max(0, dragStartRef.current.windowY + dy);
    if (draggingWindow === "piano") setPianoPosition({ x: newX, y: newY });
    else if (draggingWindow === "sound") setSoundPosition({ x: newX, y: newY });
    else if (draggingWindow === "songs") setSongsPosition({ x: newX, y: newY });
    else setMetronomePosition({ x: newX, y: newY });
  }, [draggingWindow]);

  const handleMouseUp = useCallback(() => {
    setDraggingWindow(null);
  }, []);

  useEffect(() => {
    if (draggingWindow) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingWindow, handleMouseMove, handleMouseUp]);

  // Initialize Web Audio API (must be triggered by user interaction)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a tone using Web Audio API with selected oscillator type
  const playNote = useCallback(
    (frequency: number, note: string) => {
      const ctx = getAudioContext();

      // Stop any existing note with same name (for key repeat)
      const existing = activeOscillatorsRef.current.get(note);
      if (existing) {
        existing.stop();
        activeOscillatorsRef.current.delete(note);
      }

      // Create oscillators with user-selected type (fundamental + harmonics)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      const osc1 = ctx.createOscillator();
      osc1.type = oscillatorType;
      osc1.frequency.setValueAtTime(frequency, ctx.currentTime);

      const osc2 = ctx.createOscillator();
      osc2.type = oscillatorType;
      osc2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);

      const osc3 = ctx.createOscillator();
      osc3.type = oscillatorType;
      osc3.frequency.setValueAtTime(frequency * 3, ctx.currentTime);

      gainNode.connect(ctx.destination);
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc3.connect(gainNode);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc3.start(ctx.currentTime);

      activeOscillatorsRef.current.set(note, osc1);

      osc1.stop(ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
      osc3.stop(ctx.currentTime + 0.5);

      setTimeout(() => activeOscillatorsRef.current.delete(note), 600);
    },
    [getAudioContext, oscillatorType]
  );

  const playNoteWithVisual = useCallback((note: string, frequency: number) => {
    playNote(frequency, note);
    setActiveNotes((prev) => new Set(prev).add(note));
    setTimeout(() => setActiveNotes((prev) => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    }), 400);
  }, [playNote]);

  const handleKeyPress = useCallback(
    (note: string, frequency: number) => {
      playNoteWithVisual(note, frequency);
    },
    [playNoteWithVisual]
  );

  // Keyboard shortcuts: play notes with computer keys (must be after playNoteWithVisual)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Avoid key repeat
      // Don't capture keys when typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      const key = e.key.toLowerCase();
      const note = KEY_TO_NOTE[key];
      if (note) {
        e.preventDefault();
        const freq = NOTE_FREQUENCIES[note];
        if (freq) playNoteWithVisual(note, freq);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playNoteWithVisual]);

  const playSong = useCallback((melody: { note: string; duration: number }[]) => {
    if (isPlayingSong) return;
    setIsPlayingSong(true);
    getAudioContext(); // Wake up audio on first click
    let delay = 0;
    melody.forEach(({ note, duration }) => {
      const freq = NOTE_FREQUENCIES[note];
      if (freq) {
        setTimeout(() => playNoteWithVisual(note, freq), delay);
        delay += duration;
      }
    });
    setTimeout(() => setIsPlayingSong(false), delay + 100);
  }, [playNoteWithVisual, getAudioContext, isPlayingSong]);

  // Metronome: play click sound
  const playMetronomeClick = useCallback((accent = false) => {
    const ctx = getAudioContext();
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(accent ? 0.4 : 0.25, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(accent ? 880 : 660, ctx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, [getAudioContext]);

  // Metronome: start/stop and interval
  const toggleMetronome = useCallback(() => {
    if (metronomeRunning) {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
      setMetronomeRunning(false);
      setMetronomeBeat(0);
    } else {
      getAudioContext(); // Wake up audio
      setMetronomeBeat(1);
      playMetronomeClick(true); // First beat (accent)
      const intervalMs = 60000 / metronomeBpm;
      metronomeIntervalRef.current = setInterval(() => {
        setMetronomeBeat((b) => {
          const next = (b % 4) + 1;
          playMetronomeClick(next === 1); // Accent on beat 1
          return next;
        });
      }, intervalMs);
      setMetronomeRunning(true);
    }
  }, [metronomeRunning, metronomeBpm, getAudioContext, playMetronomeClick]);

  // Cleanup metronome on unmount or when BPM changes while running
  useEffect(() => {
    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton} aria-label="Back to home">
        ←
      </Link>

      <div
        className={styles.window}
        style={{
          position: "fixed",
          left: pianoPosition.x,
          top: pianoPosition.y,
          width: "720px",
          maxWidth: "calc(100vw - 40px)",
          zIndex: draggingWindow === "piano" ? 20 : 10,
        }}
      >
        <div
          className={`${styles.windowHeader} ${styles.draggableHeader}`}
          onMouseDown={(e) => handleDragStart("piano", e)}
        >
          <div className={styles.windowControls}>
            <span className={styles.control} />
            <span className={styles.control} />
            <span className={styles.control} />
          </div>
          <span className={styles.windowTitle}>Piano</span>
        </div>

        <div className={styles.pianoContainer}>
          <div className={styles.keysWrapper}>
            {/* Black keys - rendered first so they appear on top */}
            <div className={styles.blackKeys}>
              {BLACK_KEYS.map((key) => (
                <button
                  key={key.note}
                  className={`${styles.blackKey} ${activeNotes.has(key.note) ? styles.keyPressed : ""}`}
                  style={{
                    // Center black key between white keys
                    left: `${(key.position + 0.5) * (100 / 17)}%`,
                    transform: "translateX(-50%)",
                  }}
                  onMouseDown={() => handleKeyPress(key.note, key.frequency)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleKeyPress(key.note, key.frequency);
                  }}
                  aria-label={`Play ${key.note}`}
                />
              ))}
            </div>

            {/* White keys */}
            <div className={styles.whiteKeys}>
              {WHITE_KEYS.map((key) => (
                <button
                  key={key.note}
                  className={`${styles.whiteKey} ${activeNotes.has(key.note) ? styles.keyPressed : ""}`}
                  onMouseDown={() => handleKeyPress(key.note, key.frequency)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleKeyPress(key.note, key.frequency);
                  }}
                  aria-label={`Play ${key.note}`}
                >
                  <span className={styles.keyLabel}>{key.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.hint}>Click, tap, or use keyboard — A S D F G H J K L ; ' [ ] , . / (white) · W E R T Y U I O P 2 3 (black)</span>
        </div>
      </div>

      {/* Oscillator type selector window */}
      <div
        className={styles.window}
        style={{
          position: "fixed",
          left: soundPosition.x,
          top: soundPosition.y,
          width: "360px",
          maxWidth: "calc(100vw - 40px)",
          zIndex: draggingWindow === "sound" ? 20 : 10,
        }}
      >
        <div
          className={`${styles.windowHeader} ${styles.draggableHeader}`}
          onMouseDown={(e) => handleDragStart("sound", e)}
        >
          <div className={styles.windowControls}>
            <span className={styles.control} />
            <span className={styles.control} />
            <span className={styles.control} />
          </div>
          <span className={styles.windowTitle}>Sound</span>
        </div>

        <div className={styles.oscillatorPanel}>
          <label className={styles.oscillatorLabel}>Oscillator type</label>
          <div className={styles.segmentedControl}>
            {OSCILLATOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`${styles.segment} ${oscillatorType === option.value ? styles.segmentActive : ""}`}
                onClick={() => setOscillatorType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Songs autoplay window */}
      <div
        className={styles.window}
        style={{
          position: "fixed",
          left: songsPosition.x,
          top: songsPosition.y,
          width: "300px",
          maxWidth: "calc(100vw - 40px)",
          zIndex: draggingWindow === "songs" ? 20 : 10,
        }}
      >
        <div
          className={`${styles.windowHeader} ${styles.draggableHeader}`}
          onMouseDown={(e) => handleDragStart("songs", e)}
        >
          <div className={styles.windowControls}>
            <span className={styles.control} />
            <span className={styles.control} />
            <span className={styles.control} />
          </div>
          <span className={styles.windowTitle}>Songs</span>
        </div>

        <div className={styles.songsPanel}>
          <label className={styles.oscillatorLabel}>Choose a song to autoplay</label>
          <div className={styles.songButtons}>
            <button
              className={styles.playButton}
              onClick={() => playSong(FUR_ELISE_MELODY)}
              disabled={isPlayingSong}
            >
              Play Fur Elise
            </button>
            <button
              className={styles.playButton}
              onClick={() => playSong(ODE_TO_JOY_MELODY)}
              disabled={isPlayingSong}
            >
              Play Ode to Joy
            </button>
          </div>
        </div>
      </div>

      {/* Metronome window */}
      <div
        className={styles.window}
        style={{
          position: "fixed",
          left: metronomePosition.x,
          top: metronomePosition.y,
          width: "280px",
          maxWidth: "calc(100vw - 40px)",
          zIndex: draggingWindow === "metronome" ? 20 : 10,
        }}
      >
        <div
          className={`${styles.windowHeader} ${styles.draggableHeader}`}
          onMouseDown={(e) => handleDragStart("metronome", e)}
        >
          <div className={styles.windowControls}>
            <span className={styles.control} />
            <span className={styles.control} />
            <span className={styles.control} />
          </div>
          <span className={styles.windowTitle}>Metronome</span>
        </div>

        <div className={styles.metronomePanel}>
          <div className={styles.metronomeBeat}>
            {[1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={`${styles.beatDot} ${metronomeRunning && metronomeBeat === n ? styles.beatActive : ""} ${n === 1 ? styles.beatAccent : ""}`}
              />
            ))}
          </div>
          <div className={styles.metronomeControls}>
            <label className={styles.oscillatorLabel}>
              BPM: {metronomeBpm}
            </label>
            <input
              type="range"
              min="40"
              max="240"
              value={metronomeBpm}
              onChange={(e) => setMetronomeBpm(Number(e.target.value))}
              disabled={metronomeRunning}
              className={styles.bpmSlider}
            />
            <button
              className={`${styles.metronomeButton} ${metronomeRunning ? styles.metronomeButtonActive : ""}`}
              onClick={toggleMetronome}
            >
              {metronomeRunning ? "Stop" : "Start"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
