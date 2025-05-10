import express from "express"
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

// Public routes
router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

// Protected routes - require authentication
router.get("/auth-status", protectRoute, checkAuth)
router.put("/update-profile", protectRoute, updateProfile) // This route should NOT have userId parameter

export default router
