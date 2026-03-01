"use client";

// ─────────────────────────────────────────────────────────────────
// Noted OS — Windows-inspired note-taking app
// A mini Windows desktop: draggable windows, taskbar, Start Menu,
// rich text notes, drawing canvas, and 4 visual themes.
// ─────────────────────────────────────────────────────────────────

import Link from "next/link";
import React, { useState, useRef, useCallback, useEffect } from "react";
import styles from "./styles.module.css";

// ─── Types ────────────────────────────────────────────────────────

type WinKind = "note" | "canvas" | "settings" | "search";
type Theme = "fluent" | "win7" | "xp" | "classic";
type DesktopBg = "gradient" | "dark" | "teal" | "solid";

interface Win {
  id: string;
  kind: WinKind;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  content: string;
}

interface Settings {
  theme: Theme;
  accentColor: string;
  snapToGrid: boolean;
  gridSize: number;
  desktopBg: DesktopBg;
}

// ─── Constants ───────────────────────────────────────────────────

let _counter = 3;
const newId = (prefix: string) => `${prefix}-${++_counter}`;

const INITIAL_WINS: Win[] = [
  {
    id: "win-1",
    kind: "note",
    title: "Welcome to Noted OS",
    x: 60,
    y: 40,
    w: 420,
    h: 340,
    minimized: false,
    maximized: false,
    zIndex: 2,
    content:
      "<h2>Welcome to Noted OS ⊞</h2><p>A Windows-inspired note-taking experience.</p><ul><li>Drag windows by their title bar</li><li>Open the <b>Start Menu ⊞</b> to create notes</li><li>Right-click the desktop for a context menu</li><li>Try different themes in <b>Settings ⚙️</b></li></ul>",
  },
  {
    id: "win-2",
    kind: "note",
    title: "Meeting Notes",
    x: 530,
    y: 90,
    w: 340,
    h: 300,
    minimized: false,
    maximized: false,
    zIndex: 1,
    content:
      "<h3>Q1 Planning</h3><p><i>Feb 28, 2026</i></p><ul><li>Review roadmap priorities</li><li>Assign owners per initiative</li><li>Deadlines for milestones</li></ul><p><b>Next:</b> March 3</p>",
  },
];

const DEFAULT_SETTINGS: Settings = {
  theme: "fluent",
  accentColor: "#0078d4",
  snapToGrid: false,
  gridSize: 20,
  desktopBg: "gradient",
};

const ACCENT_COLORS = [
  "#0078d4",
  "#107c10",
  "#c50f1f",
  "#8b008b",
  "#ca5010",
  "#00b7c3",
  "#7160e8",
  "#e3008c",
];

const BG_OPTIONS: { id: DesktopBg; label: string }[] = [
  { id: "gradient", label: "Blue Gradient" },
  { id: "dark", label: "Dark" },
  { id: "teal", label: "Teal Classic" },
  { id: "solid", label: "Solid Gray" },
];

// ─── Utilities ───────────────────────────────────────────────────

function snap(val: number, grid: number) {
  return Math.round(val / grid) * grid;
}
function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

// ─── Main Component ──────────────────────────────────────────────

export default function NotedOS() {
  const [wins, setWins] = useState<Win[]>(INITIAL_WINS);
  const [activeId, setActiveId] = useState<string | null>("win-1");
  const [startOpen, setStartOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [clock, setClock] = useState(new Date());
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  // Refs for smooth drag / resize (avoids re-render per frame)
  const dragRef = useRef<{
    winId: string;
    startMX: number;
    startMY: number;
    startWX: number;
    startWY: number;
  } | null>(null);

  const resizeRef = useRef<{
    winId: string;
    handle: string;
    startMX: number;
    startMY: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  // Clock tick
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Global mouse move + up for drag / resize
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const { winId, startMX, startMY, startWX, startWY } = dragRef.current;
        const dx = e.clientX - startMX;
        const dy = e.clientY - startMY;
        setWins((prev) =>
          prev.map((w) => {
            if (w.id !== winId) return w;
            let nx = startWX + dx;
            let ny = startWY + dy;
            if (settings.snapToGrid) {
              nx = snap(nx, settings.gridSize);
              ny = snap(ny, settings.gridSize);
            }
            nx = clamp(nx, 0, window.innerWidth - w.w);
            ny = clamp(ny, 0, window.innerHeight - 52 - 32);
            return { ...w, x: nx, y: ny };
          })
        );
      }
      if (resizeRef.current) {
        const { winId, handle, startMX, startMY, startX, startY, startW, startH } =
          resizeRef.current;
        const dx = e.clientX - startMX;
        const dy = e.clientY - startMY;
        setWins((prev) =>
          prev.map((w) => {
            if (w.id !== winId) return w;
            let nx = w.x, ny = w.y, nw = w.w, nh = w.h;
            if (handle.includes("e")) nw = Math.max(240, startW + dx);
            if (handle.includes("s")) nh = Math.max(160, startH + dy);
            if (handle.includes("w")) {
              nw = Math.max(240, startW - dx);
              nx = startX + (startW - nw);
            }
            if (handle.includes("n")) {
              nh = Math.max(160, startH - dy);
              ny = startY + (startH - nh);
            }
            return { ...w, x: nx, y: ny, w: nw, h: nh };
          })
        );
      }
    };
    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [settings.snapToGrid, settings.gridSize]);

  // ── Window management callbacks ──────────────────────────────

  const focusWin = useCallback((id: string) => {
    setActiveId(id);
    setWins((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  }, []);

  const createWin = useCallback(
    (kind: WinKind) => {
      const id = newId(kind);
      const defaults: Record<WinKind, { w: number; h: number; title: string }> = {
        note: { w: 400, h: 320, title: "New Note" },
        canvas: { w: 620, h: 480, title: "Drawing Canvas" },
        settings: { w: 500, h: 440, title: "Settings" },
        search: { w: 420, h: 340, title: "Search" },
      };
      const d = defaults[kind];
      const maxZ = Math.max(...wins.map((w) => w.zIndex), 0);
      const newWin: Win = {
        id,
        kind,
        title: d.title,
        x: 80 + Math.random() * 160,
        y: 50 + Math.random() * 80,
        w: d.w,
        h: d.h,
        minimized: false,
        maximized: false,
        zIndex: maxZ + 1,
        content: kind === "note" ? "<p>Start typing…</p>" : "",
      };
      setWins((prev) => [...prev, newWin]);
      setActiveId(id);
      setStartOpen(false);
      setCtxMenu(null);
    },
    [wins]
  );

  // Open settings/search (singleton — reuse if already open)
  const openSpecial = useCallback(
    (kind: "settings" | "search") => {
      const existing = wins.find((w) => w.kind === kind);
      if (existing) {
        setWins((prev) =>
          prev.map((w) => (w.id === existing.id ? { ...w, minimized: false } : w))
        );
        focusWin(existing.id);
      } else {
        createWin(kind);
      }
      setStartOpen(false);
      setCtxMenu(null);
    },
    [wins, focusWin, createWin]
  );

  const closeWin = useCallback(
    (id: string) => {
      setWins((prev) => prev.filter((w) => w.id !== id));
      setActiveId((prev) => (prev === id ? null : prev));
    },
    []
  );

  const minimizeWin = useCallback((id: string) => {
    setWins((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
    setActiveId((prev) => (prev === id ? null : prev));
  }, []);

  const toggleMaximize = useCallback((id: string) => {
    setWins((prev) =>
      prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w))
    );
  }, []);

  const updateContent = useCallback((id: string, content: string) => {
    setWins((prev) => prev.map((w) => (w.id === id ? { ...w, content } : w)));
  }, []);

  const updateTitle = useCallback((id: string, title: string) => {
    setWins((prev) => prev.map((w) => (w.id === id ? { ...w, title } : w)));
  }, []);

  const onTitleBarMouseDown = useCallback(
    (e: React.MouseEvent, winId: string) => {
      const win = wins.find((w) => w.id === winId);
      if (!win || win.maximized) return;
      e.preventDefault();
      focusWin(winId);
      dragRef.current = {
        winId,
        startMX: e.clientX,
        startMY: e.clientY,
        startWX: win.x,
        startWY: win.y,
      };
    },
    [wins, focusWin]
  );

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent, winId: string, handle: string) => {
      const win = wins.find((w) => w.id === winId);
      if (!win) return;
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        winId,
        handle,
        startMX: e.clientX,
        startMY: e.clientY,
        startX: win.x,
        startY: win.y,
        startW: win.w,
        startH: win.h,
      };
    },
    [wins]
  );

  const onTaskbarWinClick = useCallback(
    (id: string) => {
      const w = wins.find((win) => win.id === id);
      if (!w) return;
      if (w.minimized) {
        setWins((prev) =>
          prev.map((win) => (win.id === id ? { ...win, minimized: false } : win))
        );
        focusWin(id);
      } else if (activeId === id) {
        minimizeWin(id);
      } else {
        focusWin(id);
      }
    },
    [wins, activeId, focusWin, minimizeWin]
  );

  // ── Clock format ──────────────────────────────────────────────
  const clockStr = clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = clock.toLocaleDateString([], { month: "short", day: "numeric" });

  // ── CSS accent variable ───────────────────────────────────────
  const desktopStyle = { "--accent": settings.accentColor } as React.CSSProperties;

  // ── Render ────────────────────────────────────────────────────
  return (
    <div
      className={`${styles.desktop} ${styles[`theme-${settings.theme}`]} ${styles[`bg-${settings.desktopBg}`]}`}
      style={desktopStyle}
      onClick={() => {
        setStartOpen(false);
        setCtxMenu(null);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY });
        setStartOpen(false);
      }}
    >
      {/* Back button */}
      <Link href="/" className={styles.backBtn} title="Back to home">
        ←
      </Link>

      {/* Desktop icons */}
      <div className={styles.desktopIcons}>
        <DesktopIcon icon="🗑️" label="Recycle Bin" />
        <DesktopIcon icon="💻" label="This PC" />
        <DesktopIcon icon="📁" label="Documents" />
      </div>

      {/* Windows */}
      {wins
        .filter((w) => !w.minimized)
        .map((win) => (
          <WindowFrame
            key={win.id}
            win={win}
            isActive={win.id === activeId}
            settings={settings}
            onFocus={() => focusWin(win.id)}
            onClose={() => closeWin(win.id)}
            onMinimize={() => minimizeWin(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
            onTitleBarMouseDown={(e) => onTitleBarMouseDown(e, win.id)}
            onResizeMouseDown={(e, h) => onResizeMouseDown(e, win.id, h)}
            onContentChange={(c) => updateContent(win.id, c)}
            onTitleChange={(t) => updateTitle(win.id, t)}
            allSettings={settings}
            onUpdateSettings={setSettings}
          />
        ))}

      {/* Context menu */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onNewNote={() => createWin("note")}
          onNewCanvas={() => createWin("canvas")}
          onSettings={() => openSpecial("settings")}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Start Menu */}
      {startOpen && (
        <StartMenu
          settings={settings}
          onCreateNote={() => createWin("note")}
          onCreateCanvas={() => createWin("canvas")}
          onOpenSettings={() => openSpecial("settings")}
          onOpenSearch={() => openSpecial("search")}
          onClose={() => setStartOpen(false)}
        />
      )}

      {/* Taskbar */}
      <Taskbar
        wins={wins}
        activeId={activeId}
        startOpen={startOpen}
        clockStr={clockStr}
        dateStr={dateStr}
        settings={settings}
        onStartClick={(e) => {
          e.stopPropagation();
          setStartOpen((prev) => !prev);
          setCtxMenu(null);
        }}
        onWinClick={onTaskbarWinClick}
        onNewNote={() => createWin("note")}
        onOpenSettings={() => openSpecial("settings")}
      />
    </div>
  );
}

// ─── Desktop Icon ─────────────────────────────────────────────────

function DesktopIcon({ icon, label }: { icon: string; label: string }) {
  return (
    <div className={styles.desktopIcon}>
      <span className={styles.desktopIconImg}>{icon}</span>
      <span className={styles.desktopIconLabel}>{label}</span>
    </div>
  );
}

// ─── Context Menu ────────────────────────────────────────────────

function ContextMenu({
  x, y, onNewNote, onNewCanvas, onSettings, onClose,
}: {
  x: number; y: number;
  onNewNote: () => void; onNewCanvas: () => void;
  onSettings: () => void; onClose: () => void;
}) {
  return (
    <div
      className={styles.ctxMenu}
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className={styles.ctxItem} onClick={onNewNote}>📝 New Note</button>
      <button className={styles.ctxItem} onClick={onNewCanvas}>🎨 New Canvas</button>
      <div className={styles.ctxDivider} />
      <button className={styles.ctxItem} onClick={onSettings}>⚙️ Settings</button>
      <div className={styles.ctxDivider} />
      <button className={styles.ctxItem} onClick={onClose}>✕ Close Menu</button>
    </div>
  );
}

// ─── Window Frame ────────────────────────────────────────────────

interface WindowFrameProps {
  win: Win;
  isActive: boolean;
  settings: Settings;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onTitleBarMouseDown: (e: React.MouseEvent) => void;
  onResizeMouseDown: (e: React.MouseEvent, handle: string) => void;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  allSettings: Settings;
  onUpdateSettings: (s: Settings) => void;
}

const RESIZE_HANDLES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];

const WIN_ICON: Record<WinKind, string> = {
  note: "📝",
  canvas: "🎨",
  settings: "⚙️",
  search: "🔍",
};

function WindowFrame({
  win, isActive, settings,
  onFocus, onClose, onMinimize, onMaximize,
  onTitleBarMouseDown, onResizeMouseDown,
  onContentChange, onTitleChange,
  allSettings, onUpdateSettings,
}: WindowFrameProps) {
  const frameStyle: React.CSSProperties = win.maximized
    ? { position: "fixed", left: 0, top: 0, width: "100vw", height: "calc(100vh - 48px)", zIndex: win.zIndex }
    : { position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.zIndex };

  return (
    <div
      className={`${styles.window} ${isActive ? styles.windowActive : styles.windowInactive}`}
      style={frameStyle}
      onMouseDown={onFocus}
    >
      {/* ── Title Bar ── */}
      <div
        className={styles.titleBar}
        onMouseDown={onTitleBarMouseDown}
        onDoubleClick={onMaximize}
      >
        <span className={styles.titleBarIcon}>{WIN_ICON[win.kind]}</span>
        <span className={styles.titleBarText}>{win.title}</span>
        <div className={styles.winControls}>
          <button
            className={`${styles.winBtn} ${styles.winBtnMin}`}
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            title="Minimize"
          >
            <span>─</span>
          </button>
          <button
            className={`${styles.winBtn} ${styles.winBtnMax}`}
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            title={win.maximized ? "Restore" : "Maximize"}
          >
            <span>{win.maximized ? "❐" : "□"}</span>
          </button>
          <button
            className={`${styles.winBtn} ${styles.winBtnClose}`}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            title="Close"
          >
            <span>✕</span>
          </button>
        </div>
      </div>

      {/* ── Window Body ── */}
      <div className={styles.windowBody}>
        {win.kind === "note" && (
          <NoteContent
            content={win.content}
            onChange={onContentChange}
            onTitleChange={onTitleChange}
          />
        )}
        {win.kind === "canvas" && <CanvasContent />}
        {win.kind === "settings" && (
          <SettingsContent
            settings={allSettings}
            onChange={onUpdateSettings}
            accentColors={ACCENT_COLORS}
            bgOptions={BG_OPTIONS}
          />
        )}
        {win.kind === "search" && <SearchContent />}
      </div>

      {/* ── Resize handles ── */}
      {!win.maximized &&
        RESIZE_HANDLES.map((h) => (
          <div
            key={h}
            className={`${styles.resizeHandle} ${styles[`rh-${h}`]}`}
            onMouseDown={(e) => onResizeMouseDown(e, h)}
          />
        ))}
    </div>
  );
}

// ─── Note Content ────────────────────────────────────────────────

type FmtBtn =
  | { cmd: "sep" }
  | { cmd: string; arg?: string; icon: string; title: string; bold?: boolean; italic?: boolean; underline?: boolean };

const FMT_BTNS: FmtBtn[] = [
  { cmd: "bold", icon: "B", title: "Bold (Ctrl+B)", bold: true },
  { cmd: "italic", icon: "I", title: "Italic (Ctrl+I)", italic: true },
  { cmd: "underline", icon: "U", title: "Underline (Ctrl+U)", underline: true },
  { cmd: "sep" },
  { cmd: "formatBlock", arg: "h2", icon: "H1", title: "Heading 1" },
  { cmd: "formatBlock", arg: "h3", icon: "H2", title: "Heading 2" },
  { cmd: "sep" },
  { cmd: "insertUnorderedList", icon: "•≡", title: "Bullet List" },
  { cmd: "insertOrderedList", icon: "1≡", title: "Numbered List" },
  { cmd: "sep" },
  { cmd: "formatBlock", arg: "pre", icon: "</>", title: "Code Block" },
];

function NoteContent({
  content,
  onChange,
  onTitleChange,
}: {
  content: string;
  onChange: (c: string) => void;
  onTitleChange: (t: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize content only on mount (preserves cursor position on re-renders)
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    // Auto-update window title from first text line
    const firstLine = editorRef.current.innerText.split("\n")[0]?.trim();
    if (firstLine) onTitleChange(firstLine.slice(0, 40));
  };

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className={styles.noteWrap}>
      {/* Toolbar */}
      <div className={styles.noteToolbar}>
        {FMT_BTNS.map((btn, i) => {
          if (btn.cmd === "sep") return <span key={i} className={styles.tbSep} />;
          const b = btn as Exclude<FmtBtn, { cmd: "sep" }>;
          return (
            <button
              key={i}
              className={styles.tbBtn}
              title={b.title}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(b.cmd, b.arg);
              }}
              style={{
                fontWeight: b.bold ? "bold" : undefined,
                fontStyle: b.italic ? "italic" : undefined,
                textDecoration: b.underline ? "underline" : undefined,
              }}
            >
              {b.icon}
            </button>
          );
        })}
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        className={styles.noteEditor}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        spellCheck
      />
    </div>
  );
}

// ─── Canvas Content ──────────────────────────────────────────────

type DrawTool = "pen" | "highlighter" | "eraser";

const DRAW_TOOLS: { id: DrawTool; icon: string; label: string }[] = [
  { id: "pen", icon: "✏️", label: "Pen" },
  { id: "highlighter", icon: "🖊️", label: "Highlighter" },
  { id: "eraser", icon: "◻", label: "Eraser" },
];

const LINE_WIDTHS = [2, 4, 8, 14];

function CanvasContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [tool, setTool] = useState<DrawTool>("pen");
  const [color, setColor] = useState("#1a1a1a");
  const [lineWidth, setLineWidth] = useState(3);
  const history = useRef<ImageData[]>([]);
  const histIdx = useRef(-1);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.current = history.current.slice(0, histIdx.current + 1);
    history.current.push(data);
    histIdx.current = history.current.length - 1;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 580;
    canvas.height = canvas.offsetHeight || 380;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    saveState();
  }, [saveState]);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onDown = (e: React.MouseEvent) => {
    drawing.current = true;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const onMove = (e: React.MouseEvent) => {
    if (!drawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth =
      tool === "highlighter" ? lineWidth * 5 : tool === "eraser" ? lineWidth * 4 : lineWidth;
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : tool === "highlighter" ? color + "55" : color;
    ctx.globalAlpha = tool === "highlighter" ? 0.6 : 1;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const ctx = getCtx();
    if (ctx) ctx.globalAlpha = 1;
    saveState();
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || histIdx.current <= 0) return;
    histIdx.current--;
    ctx.putImageData(history.current[histIdx.current], 0, 0);
  };

  const redo = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || histIdx.current >= history.current.length - 1) return;
    histIdx.current++;
    ctx.putImageData(history.current[histIdx.current], 0, 0);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "canvas.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <div className={styles.canvasWrap}>
      {/* Canvas Toolbar */}
      <div className={styles.canvasToolbar}>
        <div className={styles.cvGroup}>
          {DRAW_TOOLS.map((t) => (
            <button
              key={t.id}
              className={`${styles.cvBtn} ${tool === t.id ? styles.cvBtnActive : ""}`}
              onClick={() => setTool(t.id)}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
        </div>
        <span className={styles.cvSep} />
        <div className={styles.cvGroup}>
          {LINE_WIDTHS.map((w) => (
            <button
              key={w}
              className={`${styles.cvWidthBtn} ${lineWidth === w ? styles.cvBtnActive : ""}`}
              onClick={() => setLineWidth(w)}
              title={`${w}px`}
            >
              <span
                style={{
                  width: w * 2,
                  height: w * 2,
                  background: "currentColor",
                  borderRadius: "50%",
                  display: "block",
                }}
              />
            </button>
          ))}
        </div>
        <span className={styles.cvSep} />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className={styles.cvColor}
          title="Pick color"
        />
        <span className={styles.cvSep} />
        <button className={styles.cvActionBtn} onClick={undo} title="Undo (Ctrl+Z)">↩</button>
        <button className={styles.cvActionBtn} onClick={redo} title="Redo">↪</button>
        <span className={styles.cvSep} />
        <button className={styles.cvActionBtn} onClick={clear} title="Clear">🗑</button>
        <button className={styles.cvActionBtn} onClick={exportPNG} title="Export PNG">⬇</button>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.drawCanvas}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
      />
    </div>
  );
}

// ─── Settings Content ────────────────────────────────────────────

const THEMES: { id: Theme; label: string; desc: string }[] = [
  { id: "fluent", label: "⊞ Windows 11 Fluent", desc: "Acrylic blur · rounded corners" },
  { id: "win7", label: "🪟 Windows 7 Aero", desc: "Glass effect · dark taskbar" },
  { id: "xp", label: "🔵 Windows XP Luna", desc: "Blue gradient · classic Luna" },
  { id: "classic", label: "🖥️ Windows 95 Classic", desc: "Retro gray · pixel borders" },
];

function SettingsContent({
  settings,
  onChange,
  accentColors,
  bgOptions,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  accentColors: string[];
  bgOptions: { id: DesktopBg; label: string }[];
}) {
  return (
    <div className={styles.settingsWrap}>
      <h2 className={styles.settingsH}>⚙️ Settings</h2>

      <section className={styles.settingsSec}>
        <h3 className={styles.settingsSecH}>Theme</h3>
        <div className={styles.themeGrid}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`${styles.themeCard} ${settings.theme === t.id ? styles.themeCardOn : ""}`}
              onClick={() => onChange({ ...settings, theme: t.id })}
            >
              <span className={styles.themeCardName}>{t.label}</span>
              <span className={styles.themeCardDesc}>{t.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.settingsSec}>
        <h3 className={styles.settingsSecH}>Accent Color</h3>
        <div className={styles.accentRow}>
          {accentColors.map((c) => (
            <button
              key={c}
              className={`${styles.accentDot} ${settings.accentColor === c ? styles.accentDotOn : ""}`}
              style={{ background: c }}
              onClick={() => onChange({ ...settings, accentColor: c })}
              title={c}
            />
          ))}
          <input
            type="color"
            value={settings.accentColor}
            onChange={(e) => onChange({ ...settings, accentColor: e.target.value })}
            className={styles.accentCustom}
            title="Custom color"
          />
        </div>
      </section>

      <section className={styles.settingsSec}>
        <h3 className={styles.settingsSecH}>Desktop Background</h3>
        <div className={styles.bgRow}>
          {bgOptions.map((opt) => (
            <button
              key={opt.id}
              className={`${styles.bgBtn} ${settings.desktopBg === opt.id ? styles.bgBtnOn : ""}`}
              onClick={() => onChange({ ...settings, desktopBg: opt.id })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.settingsSec}>
        <h3 className={styles.settingsSecH}>Desktop Behavior</h3>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.snapToGrid}
            onChange={(e) => onChange({ ...settings, snapToGrid: e.target.checked })}
          />
          <span>Snap windows to grid</span>
        </label>
        {settings.snapToGrid && (
          <div className={styles.sliderRow}>
            <span>Grid: {settings.gridSize}px</span>
            <input
              type="range"
              min={10}
              max={40}
              value={settings.gridSize}
              onChange={(e) => onChange({ ...settings, gridSize: Number(e.target.value) })}
              className={styles.slider}
            />
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Search Content ──────────────────────────────────────────────

function SearchContent() {
  const [q, setQ] = useState("");
  return (
    <div className={styles.searchWrap}>
      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          autoFocus
          type="text"
          className={styles.searchInput}
          placeholder="Search notes…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className={styles.searchEmpty}>
        {q ? `No results for "${q}"` : "Start typing to search your notes."}
      </div>
    </div>
  );
}

// ─── Taskbar ─────────────────────────────────────────────────────

function Taskbar({
  wins, activeId, startOpen, clockStr, dateStr, settings,
  onStartClick, onWinClick, onNewNote, onOpenSettings,
}: {
  wins: Win[];
  activeId: string | null;
  startOpen: boolean;
  clockStr: string;
  dateStr: string;
  settings: Settings;
  onStartClick: (e: React.MouseEvent) => void;
  onWinClick: (id: string) => void;
  onNewNote: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className={styles.taskbar}>
      {/* Start Button */}
      <button
        className={`${styles.startBtn} ${startOpen ? styles.startBtnOn : ""}`}
        onClick={onStartClick}
        title="Start"
      >
        <span className={styles.startIcon}>⊞</span>
      </button>

      {/* Separator */}
      <span className={styles.tbBarSep} />

      {/* Pinned tools */}
      <div className={styles.pinnedTools}>
        <button className={styles.pinnedBtn} onClick={onNewNote} title="New Note">📝</button>
        <button className={styles.pinnedBtn} onClick={onOpenSettings} title="Settings">⚙️</button>
      </div>

      <span className={styles.tbBarSep} />

      {/* Open windows */}
      <div className={styles.taskbarWins}>
        {wins.map((w) => (
          <button
            key={w.id}
            className={`${styles.taskbarWinBtn} ${
              w.id === activeId && !w.minimized ? styles.taskbarWinActive : ""
            } ${w.minimized ? styles.taskbarWinMin : ""}`}
            onClick={() => onWinClick(w.id)}
            title={w.title}
          >
            <span className={styles.taskbarWinIcon}>
              {WIN_ICON[w.kind]}
            </span>
            <span className={styles.taskbarWinLabel}>{w.title}</span>
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div className={styles.taskbarSpacer} />

      {/* System tray + clock */}
      <div className={styles.tray}>
        <span className={styles.trayIcons}>🔊 🌐</span>
        <div className={styles.clock}>
          <span className={styles.clockTime}>{clockStr}</span>
          <span className={styles.clockDate}>{dateStr}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Start Menu ───────────────────────────────────────────────────

function StartMenu({
  settings, onCreateNote, onCreateCanvas, onOpenSettings, onOpenSearch, onClose,
}: {
  settings: Settings;
  onCreateNote: () => void;
  onCreateCanvas: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onClose: () => void;
}) {
  return (
    <div className={styles.startMenu} onClick={(e) => e.stopPropagation()}>
      {/* Search */}
      <div className={styles.smSearch} onClick={onOpenSearch}>
        <span>🔍</span>
        <span className={styles.smSearchPlaceholder}>Search notes and apps…</span>
      </div>

      {/* Pinned apps */}
      <div className={styles.smSection}>
        <div className={styles.smSectionTitle}>Pinned</div>
        <div className={styles.smPinned}>
          <SmBtn icon="📝" label="New Note" onClick={onCreateNote} />
          <SmBtn icon="🎨" label="Canvas" onClick={onCreateCanvas} />
          <SmBtn icon="🔍" label="Search" onClick={onOpenSearch} />
          <SmBtn icon="⚙️" label="Settings" onClick={onOpenSettings} />
          <SmBtn icon="📁" label="Documents" onClick={onClose} />
          <SmBtn icon="🗑️" label="Recycle Bin" onClick={onClose} />
        </div>
      </div>

      <div className={styles.smDivider} />

      {/* Footer */}
      <div className={styles.smFooter}>
        <div className={styles.smUser}>
          <span className={styles.smUserAvatar}>👤</span>
          <span className={styles.smUserName}>User</span>
        </div>
        <button className={styles.smPowerBtn} onClick={onClose} title="Close">
          <span>⏻</span>
        </button>
      </div>
    </div>
  );
}

function SmBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button className={styles.smAppBtn} onClick={onClick}>
      <span className={styles.smAppIcon}>{icon}</span>
      <span className={styles.smAppLabel}>{label}</span>
    </button>
  );
}
