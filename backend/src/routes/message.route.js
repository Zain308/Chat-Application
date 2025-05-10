import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js"

const router = express.Router()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("Created uploads directory at:", uploadsDir)
}

// Configure multer for file uploads with absolute path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir) // Use absolute path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  },
})

// Update the route to support the includeCurrentUser parameter
router.get("/users", protectRoute, getUsersForSidebar)
router.get("/:id", protectRoute, getMessages)

// Add multer middleware to handle multipart/form-data
router.post("/send/:id", protectRoute, upload.single("image"), sendMessage)

export default router
