import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import customerRoutes from "./routes/customerRoutes";
import chatbotRoutes from "./routes/chatbotRoutes";
import orderRoutes from "./routes/orderRoutes";

dotenv.config();

const app = express();

// Render precisa do trust proxy pra cookies secure funcionarem atrás do proxy
app.set("trust proxy", 1);

const PORT = Number(process.env.PORT) || 3333;

// CORS (lista de origens)
const origins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // permite requests sem Origin (health check, curl, etc.)
      if (!origin) return cb(null, true);
      if (origins.length === 0) return cb(null, true); // fallback se você esqueceu de setar
      if (origins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// Health
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, version: "1.0.0" });
});

// Rotas
app.use("/auth", authRoutes);
app.use("/customers", customerRoutes);
app.use("/orders", orderRoutes);
app.use("/chatbot", chatbotRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});