"use client";

/**
 * Typography Experiments — Logo Generator Pro
 * Export PNG/SVG, mode présentation, fonds, input hex
 */

import Link from "next/link";
import {
  IBM_Plex_Sans,
  Playfair_Display,
  Bebas_Neue,
  Space_Mono,
  Syne,
  Cinzel,
} from "next/font/google";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import styles from "./styles.module.css";

const COLOR_PALETTE = [
  { id: "noir", hex: "#1a1a1a", name: "Noir" },
  { id: "blanc", hex: "#ffffff", name: "Blanc" },
  { id: "vert", hex: "#22c55e", name: "Vert" },
  { id: "bleu", hex: "#3b82f6", name: "Bleu" },
  { id: "rouge", hex: "#ef4444", name: "Rouge" },
  { id: "ambre", hex: "#f59e0b", name: "Ambre" },
  { id: "violet", hex: "#8b5cf6", name: "Violet" },
  { id: "rose", hex: "#ec4899", name: "Rose" },
  { id: "cyan", hex: "#06b6d4", name: "Cyan" },
  { id: "ardoise", hex: "#64748b", name: "Ardoise" },
  { id: "lime", hex: "#84cc16", name: "Lime" },
  { id: "orange", hex: "#f97316", name: "Orange" },
];

const DEFAULT_SEGMENT_COLORS = ["#1a1a1a", "#22c55e", "#3b82f6", "#8b5cf6", "#ef4444"];

const BACKGROUND_OPTIONS = [
  { id: "blanc", value: "#ffffff", label: "Blanc" },
  { id: "noir", value: "#1a1a1a", label: "Noir" },
  { id: "gris", value: "#64748b", label: "Gris" },
  { id: "custom", value: "", label: "Personnalisé" },
];

const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValidHex(hex: string): boolean {
  return HEX_REGEX.test(hex) || hex === "";
}

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
});

const playfair = Playfair_Display({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

const syne = Syne({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
});

const cinzel = Cinzel({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel",
});

const DEFAULT_TEXT = "voya|go";

type Segment = { text: string; color: string };

const LOGO_STYLES = [
  {
    id: "minimal",
    label: "Minimal Bold",
    render: (segments: Segment[]) => (
      <div className={styles.logoMinimalBold}>
        {segments.map((s, i) => (
          <span key={i} className={styles.wordBlock} style={{ color: s.color }}>
            {s.text}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "stacked",
    label: "Stacked",
    render: (segments: Segment[]) => (
      <div className={styles.logoStacked}>
        {segments.map((s, i) => (
          <span
            key={i}
            className={styles.stackedWord}
            style={{ fontSize: `${100 - i * 18}%`, color: s.color }}
          >
            {s.text}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "monogram",
    label: "Monogram",
    render: (segments: Segment[]) => (
      <div className={styles.logoMonogram}>
        {segments.map((s, i) => (
          <span
            key={i}
            className={styles.monogramLetter}
            style={{ color: s.color, borderColor: s.color }}
          >
            {s.text.charAt(0).toUpperCase()}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "serif",
    label: "Serif",
    render: (segments: Segment[]) => (
      <div className={styles.logoSerif}>
        {segments.map((s, i) => (
          <span key={i} className={styles.serifWord} style={{ color: s.color }}>
            {s.text}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "editorial",
    label: "Editorial",
    render: (segments: Segment[]) => (
      <div className={styles.logoEditorial}>
        {segments.map((s, i) => (
          <span key={i} style={{ color: s.color }}>{s.text.toUpperCase()}</span>
        ))}
      </div>
    ),
  },
  {
    id: "geometric",
    label: "Geometric",
    render: (segments: Segment[]) => (
      <div className={styles.logoGeometric}>
        {segments.map((s, i) => (
          <span key={i} className={styles.geoWord} style={{ color: s.color }}>
            {s.text}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "understated",
    label: "Understated",
    render: (segments: Segment[]) => (
      <div className={styles.logoUnderstated}>
        {segments.map((s, i) => (
          <span key={i} className={styles.understatedWord} style={{ color: s.color }}>
            {s.text.toLowerCase()}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: "overline",
    label: "Overline",
    render: (segments: Segment[]) => (
      <div className={styles.logoOverline}>
        <span
          className={styles.overlineBar}
          style={{ background: segments[0]?.color ?? "#1a1a1a" }}
        />
        <span className={styles.logoOverlineText}>
          {segments.map((s, i) => (
            <span key={i} style={{ color: s.color }}>{s.text}</span>
          ))}
        </span>
      </div>
    ),
  },
  {
    id: "modern",
    label: "Modern",
    render: (segments: Segment[]) => (
      <div className={styles.logoModern}>
        {segments.map((s, i) => (
          <span
            key={i}
            className={styles.modernWord}
            style={{
              fontWeight: 600 + Math.min(i * 100, 200),
              color: s.color,
            }}
          >
            {s.text}
          </span>
        ))}
      </div>
    ),
  },
  /* Styles inspirés du monogramme classique (TM) — cercle, serif orné */
  {
    id: "monogram-cercle",
    label: "Monogram circulaire",
    render: (segments: Segment[]) => (
      <div className={styles.monogramCercle}>
        <div
          className={styles.monogramCercleRing}
          style={{ borderColor: segments[0]?.color ?? "#1a1a1a" }}
        >
          <span className={styles.monogramCercleLetters}>
            {segments.map((s, i) => (
              <span key={i} style={{ color: s.color }}>
                {s.text.charAt(0).toUpperCase()}
              </span>
            ))}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "monogram-orne",
    label: "Monogram orné",
    render: (segments: Segment[]) => (
      <div className={styles.monogramOrne}>
        <div
          className={styles.monogramOrneRing}
          style={{ borderColor: segments[0]?.color ?? "#1a1a1a" }}
        >
          <span className={styles.monogramOrneLetters}>
            {segments.map((s, i) => (
              <span key={i} className={styles.monogramOrneLetter} style={{ color: s.color }}>
                {s.text.charAt(0).toUpperCase()}
              </span>
            ))}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "sigle-luxe",
    label: "Sigle luxe",
    render: (segments: Segment[]) => (
      <div className={styles.sigleLuxe}>
        <div
          className={styles.sigleLuxeRing}
          style={{ borderColor: segments[0]?.color ?? "#1a1a1a" }}
        >
          <span className={styles.sigleLuxeLetters}>
            {segments.map((s, i) => (
              <span key={i} style={{ color: s.color }}>
                {s.text.charAt(0).toUpperCase()}
              </span>
            ))}
          </span>
        </div>
      </div>
    ),
  },
];

export default function TypographyExperiments() {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [segmentColors, setSegmentColors] = useState<string[]>([]);
  const [presentationMode, setPresentationMode] = useState(false);
  const [backgroundOption, setBackgroundOption] = useState("blanc");
  const [customBackground, setCustomBackground] = useState("#f8f7f4");
  const [hexInputs, setHexInputs] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const segments = useMemo(() => {
    const raw = inputText.trim() || "voyago";
    const parts = raw.split("|").map((p) => p.trim()).filter(Boolean);
    return parts.length > 0 ? parts : [raw];
  }, [inputText]);

  useEffect(() => {
    setSegmentColors((prev) => {
      const next = [...prev];
      for (let i = 0; i < segments.length; i++) {
        if (!next[i]) {
          next[i] = DEFAULT_SEGMENT_COLORS[i % DEFAULT_SEGMENT_COLORS.length];
        }
      }
      return next.slice(0, segments.length);
    });
    setHexInputs((prev) => {
      const next = [...prev];
      for (let i = 0; i < segments.length; i++) {
        if (!next[i]) {
          next[i] = DEFAULT_SEGMENT_COLORS[i % DEFAULT_SEGMENT_COLORS.length];
        }
      }
      return next.slice(0, segments.length);
    });
  }, [segments.length]);

  const segmentsWithColors: Segment[] = segments.map((text, i) => ({
    text,
    color: segmentColors[i] ?? DEFAULT_SEGMENT_COLORS[i % DEFAULT_SEGMENT_COLORS.length],
  }));

  // Ordre fixe au SSR pour éviter l'erreur d'hydratation (Math.random diffère serveur/client)
  const [shuffledStyles, setShuffledStyles] = useState(() => [...LOGO_STYLES]);

  useEffect(() => {
    setShuffledStyles(shuffle([...LOGO_STYLES]));
  }, [inputText]);

  const backgroundColor =
    backgroundOption === "custom"
      ? customBackground
      : BACKGROUND_OPTIONS.find((b) => b.id === backgroundOption)?.value ?? "#ffffff";

  const handleColorChange = (segmentIndex: number, hex: string) => {
    setSegmentColors((prev) => {
      const next = [...prev];
      next[segmentIndex] = hex;
      return next;
    });
    setHexInputs((prev) => {
      const next = [...prev];
      next[segmentIndex] = hex;
      return next;
    });
  };

  const handleHexInputChange = (segmentIndex: number, value: string) => {
    const normalized = value.startsWith("#") ? value : value ? `#${value}` : "";
    setHexInputs((prev) => {
      const next = [...prev];
      next[segmentIndex] = value;
      return next;
    });
    if (isValidHex(normalized)) {
      setSegmentColors((prev) => {
        const next = [...prev];
        next[segmentIndex] = normalized;
        return next;
      });
    }
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const copyColors = useCallback(() => {
    const text = segmentColors.map((c, i) => `${segments[i]}: ${c}`).join("\n");
    navigator.clipboard.writeText(text);
    showToast("Couleurs copiées !");
  }, [segmentColors, segments]);

  const exportPNG = useCallback(async (cardRef: HTMLDivElement | null, label: string) => {
    if (!cardRef) return;
    try {
      const canvas = await html2canvas(cardRef, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `logo-${label.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      showToast("PNG téléchargé");
    } catch {
      showToast("Erreur export PNG");
    }
  }, [showToast]);

  const exportSVG = useCallback(
    (label: string) => {
      const fullText = segmentsWithColors.map((s) => s.text).join("");
      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
  <style>
    text { font-family: 'IBM Plex Sans', sans-serif; font-weight: 700; font-size: 48px; }
  </style>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">
    ${segmentsWithColors
      .map(
        (s) =>
          `<tspan fill="${s.color}">${s.text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</tspan>`
      )
      .join("")}
  </text>
</svg>`;
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `logo-${label.replace(/\s+/g, "-").toLowerCase()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast("SVG téléchargé");
    },
    [segmentsWithColors, showToast]
  );

  const fontVariables = [
    ibmPlexSans.variable,
    playfair.variable,
    bebasNeue.variable,
    spaceMono.variable,
    syne.variable,
    cinzel.variable,
  ].join(" ");

  return (
    <div className={`${styles.container} ${fontVariables}`}>
      <Link href="/" className={styles.backButton} aria-label="Back to home">
        ←
      </Link>

      {toast && <div className={styles.toast}>{toast}</div>}

      {!presentationMode && (
        <div className={styles.controls}>
          <div className={styles.inputSection}>
            <label htmlFor="typo-input" className={styles.inputLabel}>
              Texte — utilisez <code>|</code> pour séparer (ex: voya|go)
            </label>
            <input
              id="typo-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="voya|go"
              className={styles.input}
              maxLength={60}
            />
          </div>

          <div className={styles.paletteSection}>
            <span className={styles.inputLabel}>Palette — couleur par partie</span>
            <div className={styles.paletteRows}>
              {segments.map((seg, i) => (
                <div key={i} className={styles.paletteRow}>
                  <span className={styles.paletteSegmentLabel}>« {seg} »</span>
                  <div className={styles.paletteRowContent}>
                    <input
                      type="text"
                      className={styles.hexInput}
                      value={hexInputs[i] ?? segmentColors[i] ?? DEFAULT_SEGMENT_COLORS[i % DEFAULT_SEGMENT_COLORS.length] ?? ""}
                      onChange={(e) => handleHexInputChange(i, e.target.value)}
                      placeholder="#000000"
                    />
                    <div className={styles.paletteSwatches}>
                      {COLOR_PALETTE.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className={`${styles.swatch} ${segmentColors[i] === c.hex ? styles.swatchActive : ""}`}
                          style={{ background: c.hex }}
                          onClick={() => handleColorChange(i, c.hex)}
                          title={c.name}
                          aria-label={`${seg} en ${c.name}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>
              <span className={styles.inputLabel}>Fond</span>
              <div className={styles.backgroundOptions}>
                {BACKGROUND_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.bgOption} ${backgroundOption === opt.id ? styles.bgOptionActive : ""}`}
                    onClick={() => setBackgroundOption(opt.id)}
                  >
                    {opt.id === "custom" ? (
                      <span className={styles.bgCustomPreview} style={{ background: customBackground }} />
                    ) : (
                      <span className={styles.bgPreview} style={{ background: opt.value }} />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
              {backgroundOption === "custom" && (
                <div className={styles.customBgRow}>
                  <input
                    type="color"
                    value={customBackground}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className={styles.colorPicker}
                  />
                  <input
                    type="text"
                    value={customBackground}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className={styles.hexInput}
                  />
                </div>
              )}
            </div>

            <div className={styles.toolbarGroup}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setPresentationMode(true)}
              >
                Mode présentation
              </button>
              <button type="button" className={styles.secondaryButton} onClick={copyColors}>
                Copier couleurs
              </button>
            </div>
          </div>
        </div>
      )}

      {presentationMode && (
        <button
          type="button"
          className={styles.exitPresentation}
          onClick={() => setPresentationMode(false)}
        >
          Quitter la présentation
        </button>
      )}

      <main
        className={styles.logoGrid}
        style={
          presentationMode
            ? { paddingTop: "2rem" }
            : {}
        }
      >
        {shuffledStyles.map((style) => (
          <LogoCard
            key={style.id}
            style={style}
            segments={segmentsWithColors}
            backgroundColor={backgroundColor}
            isDarkBg={["#1a1a1a", "#64748b"].includes(backgroundColor)}
            onExportPNG={exportPNG}
            onExportSVG={exportSVG}
            showActions={!presentationMode}
          />
        ))}
      </main>
    </div>
  );
}

function LogoCard({
  style,
  segments,
  backgroundColor,
  isDarkBg,
  onExportPNG,
  onExportSVG,
  showActions,
}: {
  style: (typeof LOGO_STYLES)[0];
  segments: Segment[];
  backgroundColor: string;
  isDarkBg: boolean;
  onExportPNG: (ref: HTMLDivElement | null, label: string) => void;
  onExportSVG: (label: string) => void;
  showActions: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={cardRef}
      className={`${styles.logoCard} ${isDarkBg ? styles.logoCardDark : ""}`}
      style={{ background: backgroundColor }}
    >
      {showActions && (
        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.exportBtn}
            onClick={() => onExportPNG(cardRef.current, style.label)}
          >
            PNG
          </button>
          <button type="button" className={styles.exportBtn} onClick={() => onExportSVG(style.label)}>
            SVG
          </button>
        </div>
      )}
      <span className={styles.logoLabel}>{style.label}</span>
      {style.render(segments)}
    </section>
  );
}
