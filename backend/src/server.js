import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/index.routes.js";
import analyzeRoutes from "./routes/analyze.routes.js";
import askRoutes from "./routes/ask.routes.js";
import speechRoutes from "./routes/speech.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb" }));

app.use("/", router);
app.use("/analyze", analyzeRoutes);
app.use("/ask", askRoutes);
app.use("/speech", speechRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
