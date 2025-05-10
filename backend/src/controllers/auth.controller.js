import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../lib/utils.js"
import cloudinary from "../lib/cloudinary.js"

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    })

    await newUser.save()

    // Generate a unique session ID for this login
    const sessionId = Math.random().toString(36).substring(2, 15)

    // Pass the session ID to the token generator
    generateToken(newUser._id, res, sessionId)

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      sessionId: sessionId, // Include the session ID in the response
    })
  } catch (error) {
    console.log("Error in signup controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate a unique session ID for this login
    const sessionId = Math.random().toString(36).substring(2, 15)

    // Pass the session ID to the token generator
    generateToken(user._id, res, sessionId)

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      sessionId: sessionId, // Include the session ID in the response
    })
  } catch (error) {
    console.log("Error in login controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export const logout = (req, res) => {
  try {
    // Get the session ID from the request
    const sessionId = req.query.sessionId || ""

    // Create a specific cookie name for this session
    const cookieName = sessionId ? `jwt_${sessionId}` : "jwt"

    // Clear only this specific session cookie
    res.cookie(cookieName, "", { maxAge: 0 })

    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.log("Error in logout controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export const updateProfile = async (req, res) => {
  try {
    console.log("Update profile request received")
    const { profilePic } = req.body
    const userId = req.user._id // Get userId from the authenticated user

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" })
    }

    // Verify it's a base64 image string
    if (!profilePic.startsWith("data:image")) {
      return res.status(400).json({ message: "Invalid image format" })
    }

    console.log("Uploading profile picture to Cloudinary...")

    // Get current user to check if they already have a profile pic
    const currentUser = await User.findById(userId)
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" })
    }

    // If user already has a profile pic in Cloudinary, delete it
    if (currentUser.profilePic && currentUser.profilePic.includes("cloudinary")) {
      try {
        // Extract public_id from the URL
        const urlParts = currentUser.profilePic.split("/")
        const fileNameWithExtension = urlParts[urlParts.length - 1] // Get the filename with extension
        const fileName = fileNameWithExtension.split(".")[0] // Remove extension

        // Get the folder path
        const folderPath = urlParts[urlParts.length - 2]
        const fullPublicId = `chat_app_profiles/${fileName}`

        console.log("Attempting to delete old profile pic:", fullPublicId)

        await cloudinary.uploader.destroy(fullPublicId)
        console.log("Successfully deleted old profile pic")
      } catch (deleteError) {
        console.error("Error deleting old profile pic (continuing anyway):", deleteError)
        // Continue even if delete fails
      }
    }

    // Upload to Cloudinary with error handling
    let uploadResponse
    try {
      // Add a unique identifier to prevent caching issues
      const uniqueIdentifier = Date.now()

      uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "chat_app_profiles",
        public_id: `user_${userId}_${uniqueIdentifier}`, // Add unique ID to prevent caching
        resource_type: "image",
        transformation: [{ width: 200, height: 200, crop: "fill" }, { quality: "auto:good" }],
      })
      console.log("Cloudinary upload success:", uploadResponse.secure_url)
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed:", cloudinaryError)
      return res.status(500).json({
        message: "Image upload failed",
        error: cloudinaryError.message,
      })
    }

    // Update database with cache-busting URL
    const profilePicUrl = `${uploadResponse.secure_url}?v=${Date.now()}`

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: profilePicUrl },
      { new: true, select: "-password" },
    )

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    console.log("Database update success:", updatedUser)
    res.status(200).json(updatedUser)
  } catch (error) {
    console.error("Error in update profile:", error)
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    })
  }
}

export const checkAuth = (req, res) => {
  try {
    // Include the session ID in the response
    const user = { ...req.user.toObject() }
    if (req.sessionId) {
      user.sessionId = req.sessionId
    }

    res.status(200).json(user)
  } catch (error) {
    console.log("Error in checkAuth controller", error.message)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

// Add this function to your auth controller to check profile pictures

export const checkProfilePics = async (req, res) => {
  try {
    // Get all users with profile pictures
    const users = await User.find({ profilePic: { $ne: "" } }).select("fullName email profilePic")

    console.log(`Found ${users.length} users with profile pictures`)

    // Log each user's profile picture
    users.forEach((user) => {
      console.log(`User: ${user.fullName} (${user._id})`)
      console.log(`  ProfilePic: ${user.profilePic || "Not set"}`)
    })

    res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((user) => ({
        id: user._id,
        name: user.fullName,
        profilePic: user.profilePic,
      })),
    })
  } catch (error) {
    console.error("Error checking profile pictures:", error)
    res.status(500).json({ success: false, error: error.message })
  }
}
