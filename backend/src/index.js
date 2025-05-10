import express from "express"
import authRoutes from "./routes/auth.route.js"
import messagRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { app, server } from "./lib/socket.js"

dotenv.config()

const PORT = process.env.PORT || 5001

// Middleware - Updated with larger payload limits and proper CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Important for cookies and auth
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
)

// Increase payload size limit (50MB for JSON and urlencoded)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(cookieParser())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/message", messagRoutes)

// Error handling middleware for payload too large
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "File size too large. Maximum 50MB allowed",
    })
  }
  next(err)
})

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB()
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Socket.IO server is ready for connections`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
