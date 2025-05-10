"use client"

import { useRef, useState } from "react"
import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore"
import { X, ImageIcon, Send } from "lucide-react"
import toast from "react-hot-toast"

const MessageInput = () => {
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const fileInputRef = useRef(null)
  const { selectedUser, sendMessage } = useChatStore()
  const { authUser, socket } = useAuthStore()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB")
      return
    }

    // Store the actual file for later upload
    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!text.trim() && !imageFile) || !selectedUser) return

    setIsSending(true)
    try {
      // Create FormData object
      const formData = new FormData()

      // Always append text, even if empty
      formData.append("text", text.trim())

      // Append image file if exists
      if (imageFile) {
        formData.append("image", imageFile)

        // Debug what's being sent
        console.log("Sending image:", imageFile.name, "Size:", imageFile.size, "Type:", imageFile.type)
      }

      // Debug the FormData
      for (const pair of formData.entries()) {
        console.log(pair[0] + ": " + (pair[0] === "image" ? "File object" : pair[1]))
      }

      // Send the message
      const sentMessage = await sendMessage(selectedUser._id, formData)

      // Emit the message through socket for real-time updates
      if (socket && sentMessage) {
        socket.emit("sendMessage", sentMessage)
      }

      // Clear form
      setText("")
      setImagePreview(null)
      setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message: " + (error.response?.data?.error || error.message))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="p-4 w-full border-t border-base-300">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                            flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {/* User avatar */}
        <div className="avatar hidden sm:flex">
          <div className="w-8 h-8 rounded-full">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="Your avatar"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/avatar.png"
              }}
            />
          </div>
        </div>

        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                                ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle btn-primary"
          disabled={(!text.trim() && !imagePreview) || isSending}
        >
          {isSending ? <span className="loading loading-spinner"></span> : <Send size={22} />}
        </button>
      </form>
    </div>
  )
}

export default MessageInput
