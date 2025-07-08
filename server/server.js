/// server.js

import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import pg from "pg";

// App setup
const app = express();
const PORT = 5000;

// ========================
// Middleware Configuration
// ========================

// Allow credentials and requests from React frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(cookieParser());

// Session management
app.use(session({
  secret: "someSecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,    // Use true in production with HTTPS
    httpOnly: true,
    sameSite: "lax",  // Lax is okay for most cases
  },
}));

// Debug incoming session and cookies
app.use((req, res, next) => {
  console.log("Incoming cookies:", req.cookies);
  console.log("Session object:", req.session);
  next();
});

// ========================
// PostgreSQL Setup
// ========================
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "users",       // Ensure this database exists
  password: "WebProgramming",
  port: 5432,
});
db.connect();

// ========================
// Routes
// ========================

/**
 * POST /signin
 * Authenticates user and initializes session
 */
app.post("/signin", async (req, res) => {
  const { user_id, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE user_id = $1 AND password = $2",
      [user_id, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Store user session
      req.session.user = { user_id: user.user_id, name: user.name };
      console.log("User set in session:", req.session.user);

      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Error during signin:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/blogs
 * Return all blogs (no auth check currently)
 */
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await db.query("SELECT * FROM blogs");
    res.json(blogs.rows);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * GET /api/blogs/:id
 * Get blog by ID — must be owned by logged in user
 */
app.get("/api/blogs/:id", async (req, res) => {
  const currentUser = req.session.user;
  const blog_id = req.params.id;

  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [blog_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const blog = result.rows[0];

    // Only allow access if current user owns the blog
    if (currentUser.user_id !== blog.creator_user_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, blog });
  } catch (err) {
    console.error("Error retrieving blog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * PUT /api/blogs/:id
 * Update blog post if user owns it
 */
app.put("/api/blogs/:id", async (req, res) => {
  const currentUser = req.session.user;
  const blog_id = req.params.id;
  const { title, body } = req.body;

  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [blog_id]);
    const blog = result.rows[0];

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    if (currentUser.user_id !== blog.creator_user_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await db.query(
      "UPDATE blogs SET title = $1, body = $2, date_created = NOW() WHERE blog_id = $3",
      [title, body, blog_id]
    );

    res.json({ success: true, message: "Blog updated" });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/blogs
 * Create new blog post
 */
app.post("/api/blogs", async (req, res) => {
  const currentUser = req.session.user;
  const { title, body } = req.body;

  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await db.query(
      "INSERT INTO blogs (title, body, creator_name, creator_user_id, date_created) VALUES ($1, $2, $3, $4, NOW())",
      [title, body, currentUser.name, currentUser.user_id]
    );

    res.status(201).json({ success: true, message: "Blog created" });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ success: false, message: "Error saving blog" });
  }
});

/**
 * DELETE /api/blogs/:id
 * Delete blog post if user owns it
 */
app.delete("/api/blogs/:id", async (req, res) => {
  const currentUser = req.session.user;
  const blog_id = req.params.id;
  const blog_id_num = parseInt(blog_id, 10);

  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (isNaN(blog_id_num)) {
    return res.status(400).json({ success: false, message: "Invalid blog ID" });
  }

  try {
    console.log(`User ${currentUser.user_id} is trying to delete blog ${blog_id}`);

    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [blog_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const blog = result.rows[0];

    if (currentUser.user_id !== blog.creator_user_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await db.query("DELETE FROM blogs WHERE blog_id = $1", [blog_id]);

    console.log(`Blog ${blog_id} deleted successfully`);
    res.json({ success: true, message: "Blog deleted" });

  } catch (err) {
    console.error("Error during blog deletion:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ========================
// Start Server
// ========================
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
