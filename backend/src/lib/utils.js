import jwt from "jsonwebtoken"

export const generateToken = (userId, res, sessionId = "") => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  })

  // Create a session-specific cookie name if sessionId is provided
  const cookieName = sessionId ? `jwt_${sessionId}` : "jwt"

  res.cookie(cookieName, token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true, // prevent XSS attacks
    sameSite: "strict", // CSRF protection
    secure: process.env.NODE_ENV === "production", // Only use HTTPS in production
  })
}

// Helper to extract the session ID from a cookie name
export const extractSessionId = (cookieName) => {
  if (cookieName.startsWith("jwt_")) {
    return cookieName.substring(4) // Remove "jwt_" prefix
  }
  return ""
}
