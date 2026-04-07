// api/index.js
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

import authRoutes from "../routes/auth.route.js"
import userRoutes from "../routes/user.route.js"
import taskRoutes from "../routes/task.route.js"
import reportRoutes from "../routes/report.route.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// ------------------------------
// Database connection
// ------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database is connected"))
  .catch((err) => console.error("DB connection error:", err))

// ------------------------------
// Middleware
// ------------------------------
const FRONTEND_URL = process.env.FRONT_END_URL || "http://localhost:5174"

// CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
)

// JSON body parser
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Dynamic Content-Security-Policy
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; img-src 'self' data: ${FRONTEND_URL}; script-src 'self'; connect-src 'self' ${FRONTEND_URL};`
  )
  next()
})

// Serve static files from "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ------------------------------
// Routes
// ------------------------------
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/tasks", taskRoutes)
app.use("/reports", reportRoutes)

// ------------------------------
// Global error handler
// ------------------------------
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  })
})

// ------------------------------
// Export for Vercel serverless
// ------------------------------
export default app
