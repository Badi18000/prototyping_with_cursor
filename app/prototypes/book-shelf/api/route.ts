// Notion API route — server-side handler
// Reads NOTION_TOKEN and NOTION_DATABASE_ID from .env.local
// and returns a list of books from the Notion database.

import { NextResponse } from "next/server";

// ── Notion API types ──────────────────────────────────────────

interface NotionFile {
  type: "file" | "external";
  name?: string;
  file?: { url: string; expiry_time: string };
  external?: { url: string };
}

interface NotionRichText {
  plain_text: string;
}

interface NotionPage {
  id: string;
  properties: {
    Title?: { title: NotionRichText[] };
    Author?: { rich_text: NotionRichText[] };
    Genre?: { select: { name: string; color: string } | null };
    "Cover Image"?: { files: NotionFile[] };
    Rating?: { number: number | null };
    Review?: { rich_text: NotionRichText[] };
  };
}

// ── GET handler ───────────────────────────────────────────────

export async function GET() {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  // Check env variables are set
  if (!token || !databaseId) {
    return NextResponse.json(
      {
        error: "Missing environment variables",
        details:
          "Please create a .env.local file with NOTION_TOKEN and NOTION_DATABASE_ID. See the README for instructions.",
      },
      { status: 500 }
    );
  }

  try {
    // Query the Notion database using the stable 2022-06-28 API version
    const response = await fetch(
      `https://api.notion.com/v1/databases/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({ page_size: 100 }),
        cache: "no-store", // Always fetch fresh data
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        {
          error: "Notion API error",
          details: err.message ?? `HTTP ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Notion pages into a clean book format
    const books = (data.results as NotionPage[]).map((page) => {
      const p = page.properties;

      // Extract cover image URL (can be uploaded file or external link)
      const files = p["Cover Image"]?.files ?? [];
      const firstFile = files[0];
      let coverUrl: string | null = null;
      if (firstFile) {
        if (firstFile.type === "file" && firstFile.file) {
          coverUrl = firstFile.file.url;
        } else if (firstFile.type === "external" && firstFile.external) {
          coverUrl = firstFile.external.url;
        }
      }

      return {
        id: page.id,
        title: p.Title?.title?.[0]?.plain_text ?? "Untitled",
        author: p.Author?.rich_text?.[0]?.plain_text ?? "",
        genre: p.Genre?.select?.name ?? "",
        genreColor: p.Genre?.select?.color ?? "default",
        coverUrl,
        rating: p.Rating?.number ?? null,
        review: p.Review?.rich_text?.map((t) => t.plain_text).join("") ?? "",
      };
    });

    return NextResponse.json({ books });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to connect to Notion", details: String(err) },
      { status: 500 }
    );
  }
}
