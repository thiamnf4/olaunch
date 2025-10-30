import express from "express";
import helmet from "helmet";
import cors from "cors";
import { router as flagRoutes } from "./routes/flags";
import { sseHandler } from "./sse";
import { GuardrailInputSchema } from "@openlaunch/shared";
import { analyzeGuardrail } from "./guardrails";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));

// Health check route
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/events", sseHandler);
app.use("/flags", flagRoutes);

app.post("/guardrails/analyze", (req, res) => {
  const input = GuardrailInputSchema.parse(req.body);
  const out = analyzeGuardrail(input);
  res.json(out);
});

// Start the API server
const port = Number(process.env.API_PORT) || 4000;
app.listen(port, () => {
  console.log(`api on http://localhost:${port}`);
});
