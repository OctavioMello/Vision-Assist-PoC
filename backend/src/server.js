import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/index.routes.js";
import analyzeRoutes from "./routes/analyze.routes.js";
import askRoutes from "./routes/ask.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.use("/", router);
app.use("/analyze", analyzeRoutes);
app.use("/ask", askRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});