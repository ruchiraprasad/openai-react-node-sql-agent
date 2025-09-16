import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000; // your chosen port

// Serve static frontend
app.use(express.static(path.join(__dirname, "frontend")));

// Send index.html when visiting "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Example API
app.post("/api/chat", express.json(), async (req, res) => {
  res.json({ msg: "API is working" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
