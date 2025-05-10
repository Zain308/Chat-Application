import Message from "../models/message.model.js"
import User from "../models/user.model.js"
import fs from "fs"
import cloudinary from "../lib/cloudinary.js" // Import the configured cloudinary instance

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id

    // Get the includeCurrentUser parameter from query string
    const includeCurrentUser = req.query.includeCurrentUser === "true"

    // Create the filter - by default exclude current user
    const filter = includeCurrentUser ? {} : { _id: { $ne: loggedInUserId } }

    const filteredUsers = await User.find(filter).select("-password")

    console.log(
      `Returning ${filteredUsers.length} users for sidebar. Current user ${includeCurrentUser ? "included" : "excluded"}.`,
    )

    res.status(200).json(filteredUsers)
  } catch (error) {
    console.log("Error in getUsersForSidebar:", error.message)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params
    const myId = req.user._id

    const message = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 })

    res.status(200).json(message)
  } catch (error) {
    console.log("Error in getMessages:", error.message)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const sendMessage = async (req, res) => {
  try {
    console.log("Request body:", req.body)
    console.log("Request file:", req.file)

    // With multer, text fields are in req.body and files are in req.file
    const text = req.body.text || ""
    const { id: receiverId } = req.params
    const senderId = req.user._id

    let imageUrl = null

    // Handle file upload to Cloudinary if a file was uploaded
    if (req.file) {
      try {
        // Make sure the file exists before uploading
        const filePath = req.file.path
        if (!fs.existsSync(filePath)) {
          return res.status(500).json({ error: `File not found at path: ${filePath}` })
        }

        console.log("Uploading file to Cloudinary:", filePath)

        // Use a direct approach with explicit error handling
        try {
          const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "image", // Explicitly set to image
            folder: "chat_app/messages",
          })

          imageUrl = uploadResult.secure_url
          console.log("Cloudinary upload successful:", imageUrl)
        } catch (uploadError) {
          console.error("Cloudinary upload error details:", uploadError)
          throw new Error(`Cloudinary upload failed: ${uploadError.message}`)
        }

        // Delete the local file after uploading to Cloudinary
        try {
          fs.unlinkSync(filePath)
          console.log("Local file deleted:", filePath)
        } catch (deleteError) {
          console.error("Error deleting local file:", deleteError)
          // Continue even if delete fails
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError)
        return res.status(500).json({ error: "Failed to upload image: " + cloudinaryError.message })
      }
    }

    // Create and save the new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    })

    await newMessage.save()
    console.log("Message saved successfully:", newMessage)

    res.status(201).json(newMessage)
  } catch (error) {
    console.log("Error in sendMessage:", error.message)
    res.status(500).json({ error: "Internal server error: " + error.message })
  }
}
