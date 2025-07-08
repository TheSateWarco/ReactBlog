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
    const userResult = await db.query(
      "SELECT * FROM users WHERE user_id = $1 AND password = $2",
      [user_id, password]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];

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
  try {
    const result = await db.query("SELECT * FROM blogs ORDER BY date_created DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
