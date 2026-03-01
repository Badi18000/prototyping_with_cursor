"use client";

/**
 * Book Shelf — Notion-powered reading list gallery
 * Connects to a Notion database and displays books in a gallery.
 * Requires NOTION_TOKEN and NOTION_DATABASE_ID in .env.local
 */

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import styles from "./styles.module.css";

// ── Types ─────────────────────────────────────────────────────

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  genreColor: string;
  coverUrl: string | null;
  rating: number | null;
  review: string;
}

type SortKey = "title" | "author" | "rating";
type SortDir = "asc" | "desc";

// ── Notion select colors → CSS hex colors ──────────────────────
// These are the exact color names Notion uses for select properties
const NOTION_COLORS: Record<string, string> = {
  blue: "#3b82f6",
  green: "#10b981",
  purple: "#8b5cf6",
  yellow: "#d97706",
  red: "#ef4444",
  orange: "#f97316",
  pink: "#ec4899",
  gray: "#6b7280",
  brown: "#78716c",
  default: "#6b7280",
};

// ── Sub-components ────────────────────────────────────────────

function Stars({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className={styles.noRating}>No rating yet</span>;
  }
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(rating) ? styles.starOn : styles.starOff}>
          ★
        </span>
      ))}
      <span className={styles.ratingNum}>{rating}</span>
    </div>
  );
}

function CoverPlaceholder({ title, genre, color }: { title: string; genre: string; color: string }) {
  return (
    <div
      className={styles.placeholder}
      style={{ background: color + "14", borderBottom: `3px solid ${color}33` }}
    >
      <span className={styles.placeholderLetter} style={{ color }}>
        {title.charAt(0).toUpperCase()}
      </span>
      {genre && (
        <span className={styles.placeholderGenre} style={{ color }}>
          {genre}
        </span>
      )}
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const color = NOTION_COLORS[book.genreColor] ?? NOTION_COLORS.default;

  return (
    <article className={styles.card}>
      {/* Cover */}
      <div className={styles.coverWrap}>
        {book.coverUrl ? (
          // Using regular img tag since Notion S3 URLs aren't pre-configured for next/image
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt={`Cover of ${book.title}`} className={styles.cover} />
        ) : (
          <CoverPlaceholder title={book.title} genre={book.genre} color={color} />
        )}
      </div>

      {/* Info */}
      <div className={styles.cardBody}>
        {book.genre && (
          <span
            className={styles.genreBadge}
            style={{ background: color + "14", color }}
          >
            {book.genre}
          </span>
        )}

        <h3 className={styles.bookTitle}>{book.title}</h3>

        {book.author && (
          <p className={styles.bookAuthor}>by {book.author}</p>
        )}

        <Stars rating={book.rating} />

        {book.review && (
          <div className={styles.reviewWrap}>
            <p
              className={`${styles.review} ${reviewOpen ? styles.reviewOpen : ""}`}
            >
              {book.review}
            </p>
            {book.review.length > 90 && (
              <button
                className={styles.reviewToggle}
                onClick={() => setReviewOpen((v) => !v)}
              >
                {reviewOpen ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ── Setup guide shown when .env.local is not configured ────────

function SetupGuide() {
  return (
    <div className={styles.setupWrap}>
      <div className={styles.setupCard}>
        <div className={styles.setupEmoji}>📚</div>
        <h2 className={styles.setupTitle}>Connect your Notion database</h2>
        <p className={styles.setupSub}>
          Follow these 4 steps to display your reading list.
        </p>

        <ol className={styles.setupSteps}>
          <li>
            <strong>Create a Notion integration</strong>
            <br />
            Go to{" "}
            <a
              href="https://www.notion.so/my-integrations"
              target="_blank"
              rel="noopener noreferrer"
            >
              notion.so/my-integrations
            </a>{" "}
            → New integration → copy the <em>Internal Integration Secret</em>.
          </li>
          <li>
            <strong>Share your database with the integration</strong>
            <br />
            Open your Notion database → <code>···</code> menu → <em>Add connections</em> → select
            your integration.
          </li>
          <li>
            <strong>Create a .env.local file</strong> in the project root:
            <pre className={styles.codeBlock}>{`NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}</pre>
            The database ID is in the URL:{" "}
            <code>notion.so/workspace/<strong>[database-id]</strong>?v=...</code>
          </li>
          <li>
            <strong>Restart the dev server</strong>
            <br />
            Stop and re-run <code>npm run dev</code> to load the new env variables.
          </li>
        </ol>

        <p className={styles.setupNote}>
          Your database must have these properties: <strong>Title</strong> (title),{" "}
          <strong>Author</strong> (text), <strong>Genre</strong> (select),{" "}
          <strong>Cover Image</strong> (files), <strong>Rating</strong> (number),{" "}
          <strong>Review</strong> (text).
        </p>
      </div>
    </div>
  );
}

// ── Main page component ───────────────────────────────────────

export default function BookShelf() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; needsSetup?: boolean } | null>(null);
  const [activeGenre, setActiveGenre] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");

  // Fetch books from the API route (which calls Notion server-side)
  useEffect(() => {
    fetch("/prototypes/book-shelf/api")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError({
            message: data.details ?? data.error,
            needsSetup: data.error === "Missing environment variables",
          });
        } else {
          setBooks(data.books);
        }
      })
      .catch((err) => setError({ message: String(err) }))
      .finally(() => setLoading(false));
  }, []);

  // Unique genres for filter tabs
  const genres = useMemo(() => {
    const set = new Set(books.map((b) => b.genre).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [books]);

  // Stats
  const stats = useMemo(() => {
    const rated = books.filter((b) => b.rating !== null);
    const avg = rated.length
      ? (rated.reduce((s, b) => s + b.rating!, 0) / rated.length).toFixed(1)
      : null;
    return { total: books.length, avg, genres: genres.length - 1 };
  }, [books, genres]);

  // Filtered + sorted books
  const visible = useMemo(() => {
    let result = [...books];

    if (activeGenre !== "All") {
      result = result.filter((b) => b.genre === activeGenre);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.genre.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aVal = sortKey === "rating" ? (a.rating ?? -1) : a[sortKey].toLowerCase();
      const bVal = sortKey === "rating" ? (b.rating ?? -1) : b[sortKey].toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [books, activeGenre, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ── Render states ───────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <span className={styles.spinner} />
          <p>Loading your books from Notion…</p>
        </div>
      </div>
    );
  }

  if (error?.needsSetup) {
    return (
      <div className={styles.page}>
        <Link href="/" className={styles.back}>← Back</Link>
        <SetupGuide />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Link href="/" className={styles.back}>← Back</Link>
        <div className={styles.errorState}>
          <p className={styles.errorTitle}>⚠️ Could not load books</p>
          <p className={styles.errorMsg}>{error.message}</p>
        </div>
      </div>
    );
  }

  // ── Main gallery ────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.back}>← Back</Link>

      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>My Reading List</h1>
          <p className={styles.pageStats}>
            {stats.total} book{stats.total !== 1 ? "s" : ""}
            {stats.avg && <> · ★ {stats.avg} avg</>}
            {stats.genres > 0 && <> · {stats.genres} genre{stats.genres !== 1 ? "s" : ""}</>}
          </p>
        </div>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by title, author, genre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {/* Toolbar: genre filters + sort */}
      <div className={styles.toolbar}>
        <div className={styles.genreRow}>
          {genres.map((g) => (
            <button
              key={g}
              className={`${styles.genreBtn} ${activeGenre === g ? styles.genreBtnOn : ""}`}
              onClick={() => setActiveGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div className={styles.sortRow}>
          <span className={styles.sortLabel}>Sort by</span>
          {(["title", "author", "rating"] as SortKey[]).map((k) => (
            <button
              key={k}
              className={`${styles.sortBtn} ${sortKey === k ? styles.sortBtnOn : ""}`}
              onClick={() => toggleSort(k)}
            >
              {k}
              {sortKey === k && (
                <span className={styles.sortArrow}>
                  {sortDir === "asc" ? " ↑" : " ↓"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Book grid */}
      {visible.length === 0 ? (
        <p className={styles.emptyMsg}>
          {search
            ? `No books matching "${search}"`
            : `No books in the "${activeGenre}" genre yet.`}
        </p>
      ) : (
        <div className={styles.grid}>
          {visible.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
