import express from "express";
import { login, logout, signup, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/profile", protectRoute, updateProfile);
router.get("/auth-status", protectRoute, checkAuth);

// Error handler
router.use((err, req, res, next) => {
  console.error("Route error:", err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

export default router;
