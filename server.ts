import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("games.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail TEXT,
    category TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM games").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO games (title, url, thumbnail, category, description) VALUES (?, ?, ?, ?, ?)");
  insert.run("Slope", "https://kdata1.com/2020/05/slope/", "https://picsum.photos/seed/slope/400/300", "Action", "A fast-paced 3D running game.");
  insert.run("Tunnel Rush", "https://kdata1.com/2020/05/tunnel-rush/", "https://picsum.photos/seed/tunnel/400/300", "Action", "Avoid obstacles in a high-speed tunnel.");
  insert.run("Retro Bowl", "https://kdata1.com/2021/01/retro-bowl/", "https://picsum.photos/seed/football/400/300", "Sports", "The perfect game for the armchair quarterback.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/games", (req, res) => {
    const games = db.prepare("SELECT * FROM games ORDER BY created_at DESC").all();
    res.json(games);
  });

  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    if (password === "2014") {
      res.json({ success: true, token: "admin-session-token-2014" });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  app.post("/api/games", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== "admin-session-token-2014") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { title, url, thumbnail, category, description } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }

    try {
      const insert = db.prepare("INSERT INTO games (title, url, thumbnail, category, description) VALUES (?, ?, ?, ?, ?)");
      const result = insert.run(title, url, thumbnail || `https://picsum.photos/seed/${encodeURIComponent(title)}/400/300`, category || "General", description || "");
      res.json({ id: result.lastInsertRowid, title, url });
    } catch (err) {
      res.status(500).json({ error: "Failed to add game" });
    }
  });

  app.delete("/api/games/:id", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== "admin-session-token-2014") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    db.prepare("DELETE FROM games WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
