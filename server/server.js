// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "users",    // your DB name
  password: "WebProgramming",
  port: 5432,
});
db.connect();

// Sign-in route: verify user and return user + blogs
app.post("/signin", async (req, res) => {
  const { user_id, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE user_id = $1 AND password = $2",
      [user_id, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const blogResult = await db.query("SELECT * FROM blogs ORDER BY date_created DESC");

      res.json({
        success: true,
        user: { user_id: user.user_id, name: user.name },
        blogs: blogResult.rows,
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Optional: endpoint to get blogs only (for later)
app.get("/api/blogs", async (req, res) => {
  const blogs = await db.query("SELECT * FROM blogs");
  res.json(blogs.rows);
});

app.get("/api/blogs/:id", async (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const blog_id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [blog_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    const blog = result.rows[0];

    if (currentUser.user_id !== blog.creator_user_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

app.put("/api/blogs/:id", async (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const blog_id = req.params.id;
  const { title, body } = req.body;

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
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post("/api/blogs", async (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { title, body } = req.body;

  try {
    await db.query(
      "INSERT INTO blogs (title, body, creator_name, creator_user_id, date_created) VALUES ($1, $2, $3, $4, NOW())",
      [title, body, currentUser.name, currentUser.user_id]
    );

    res.status(201).json({ success: true, message: "Blog created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving blog" });
  }
});
app.delete("/api/blogs/:id", async (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const blog_id = req.params.id;

  try {
    const result = await db.query("SELECT * FROM blogs WHERE blog_id = $1", [blog_id]);
    const blog = result.rows[0];

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }
    if (currentUser.user_id !== blog.creator_user_id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    await db.query("DELETE FROM blogs WHERE blog_id = $1", [blog_id]);

    res.json({ success: true, message: "Blog deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
