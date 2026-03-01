# Book Shelf — Notion-powered reading list

Displays your Notion book database as a beautiful gallery with filtering, sorting, and search.

## Setup

### 1. Create a Notion Integration
1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Name it (e.g. "Book Shelf") and click Submit
4. Copy the **Internal Integration Secret** (starts with `secret_`)

### 2. Share your database with the integration
1. Open your Notion database
2. Click the `···` menu (top right)
3. Go to **Add connections** → search for your integration → select it

### 3. Get your Database ID
Your database ID is in the URL:
```
https://www.notion.so/myworkspace/[DATABASE-ID]?v=...
```
Copy the long string between your workspace name and `?v=`.

### 4. Create `.env.local`
Create a file called `.env.local` in the **project root** (same level as `package.json`):

```
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Restart the dev server
```bash
npm run dev
```

## Database Schema
Your Notion database must have these exact property names:

| Property | Type |
|---|---|
| Title | Title |
| Author | Text |
| Genre | Select |
| Cover Image | Files & media |
| Rating | Number |
| Review | Text |
