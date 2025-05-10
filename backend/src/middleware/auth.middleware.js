import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { extractSessionId } from "../lib/utils.js"

export const protectRoute = async (req, res, next) => {
  try {
    // Get all cookies
    const cookies = req.cookies

    // Find a JWT cookie (either the default "jwt" or any "jwt_[sessionId]")
    let token = null
    let sessionId = ""

    // First check if a specific session cookie was requested
    if (req.query.sessionId) {
      const specificCookie = `jwt_${req.query.sessionId}`
      if (cookies[specificCookie]) {
        token = cookies[specificCookie]
        sessionId = req.query.sessionId
      }
    }

    // If no specific cookie was found, look for any JWT cookie
    if (!token) {
      for (const cookieName in cookies) {
        if (cookieName === "jwt" || cookieName.startsWith("jwt_")) {
          token = cookies[cookieName]
          sessionId = extractSessionId(cookieName)
          break
        }
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" })
    }

    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    req.user = user
    req.sessionId = sessionId // Store the session ID in the request
    next()
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message)
    res.status(401).json({ message: "Unauthorized - Invalid Token" })
  }
}
