import { create } from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"
import { io } from "socket.io-client"
import { useChatStore } from "./useChatStore"

const BASE_URL = "http://localhost:5001"

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  sessionId: "", // Store the session ID

  checkAuth: async () => {
    try {
      // Include the session ID in the request if available
      const sessionId = get().sessionId
      const url = sessionId ? `/auth/auth-status?sessionId=${sessionId}` : "/auth/auth-status"

      const res = await axiosInstance.get(url)

      // If user changed, disconnect previous socket
      if (get().authUser?._id !== res.data?._id) {
        get().disconnectSocket()
      }

      // Store the session ID from the response
      if (res.data?.sessionId) {
        set({ sessionId: res.data.sessionId })
      }

      set({ authUser: res.data })

      // Connect socket with new user
      get().connectSocket()
    } catch (error) {
      console.log("Error in checkAuth:", error)
      set({ authUser: null })
      get().disconnectSocket()
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true })
    try {
      // Disconnect any existing socket
      get().disconnectSocket()

      // Clear previous chat data
      useChatStore.getState().clearChatData()

      const res = await axiosInstance.post("/auth/signup", data)

      // Store the session ID
      if (res.data?.sessionId) {
        set({ sessionId: res.data.sessionId })
      }

      set({ authUser: res.data, isSigningUp: false })
      toast.success("Account created successfully")

      // Connect socket with new user
      get().connectSocket()
    } catch (error) {
      set({ isSigningUp: false })
      toast.error(error.response?.data?.message || "Signup failed")
      throw error
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true })
    try {
      // Disconnect any existing socket
      get().disconnectSocket()

      // Clear previous chat data
      useChatStore.getState().clearChatData()

      const res = await axiosInstance.post("/auth/login", data)

      // Store the session ID
      if (res.data?.sessionId) {
        set({ sessionId: res.data.sessionId })
      }

      set({ authUser: res.data, isLoggingIn: false })
      toast.success("Logged in successfully")

      // Connect socket with new user
      get().connectSocket()

      return res.data
    } catch (error) {
      set({ isLoggingIn: false })
      toast.error(error.response?.data?.message || "Login failed")
      throw error
    }
  },

  logout: async () => {
    try {
      // Disconnect socket before clearing auth user
      get().disconnectSocket()

      // Include the session ID in the logout request
      const sessionId = get().sessionId
      const url = sessionId ? `/auth/logout?sessionId=${sessionId}` : "/auth/logout"

      await axiosInstance.post(url)

      // Clear chat data
      useChatStore.getState().clearChatData()

      // Clear auth user and session ID
      set({ authUser: null, onlineUsers: [], sessionId: "" })

      toast.success("Logged out successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed")
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true })
    try {
      console.log("Sending profile update request to:", "/auth/update-profile")
      console.log("Request data:", { ...data, profilePic: data.profilePic ? "Base64 image data (truncated)" : null })

      // Include the session ID in the request
      const sessionId = get().sessionId
      const url = sessionId ? `/auth/update-profile?sessionId=${sessionId}` : "/auth/update-profile"

      const res = await axiosInstance.put(url, data)

      // Update authUser with the response data
      set({ authUser: res.data })

      console.log("Profile updated successfully:", {
        ...res.data,
        profilePic: res.data.profilePic ? `${res.data.profilePic.substring(0, 50)}...` : null,
      })

      // Return the updated user data
      return res.data
    } catch (error) {
      console.error("Error in update profile:", error)
      console.error("Error details:", error.response?.data || error.message)
      toast.error(error.response?.data?.message || "Failed to update profile")
      throw error
    } finally {
      set({ isUpdatingProfile: false })
    }
  },

  connectSocket: () => {
    const { authUser, sessionId } = get()
    if (!authUser) return

    // If already connected with the same user and session, don't reconnect
    if (
      get().socket?.connected &&
      get().socket._query?.userId === authUser._id &&
      get().socket._query?.sessionId === sessionId
    ) {
      console.log("Socket already connected with the same user and session")
      return
    }

    // Disconnect existing socket if any
    get().disconnectSocket()

    console.log("Connecting to socket.io server with user:", authUser._id, "session:", sessionId)

    try {
      // Create socket connection with withCredentials option and session ID
      const socket = io(BASE_URL, {
        query: {
          userId: authUser._id,
          sessionId: sessionId, // Include session ID in socket connection
        },
        withCredentials: true,
        transports: ["websocket", "polling"], // Try websocket first, fallback to polling
      })

      // Set up event listeners
      socket.on("connect", () => {
        console.log("Socket connected successfully!", socket.id)

        // Refresh users list when socket connects
        useChatStore.getState().getUsers(true)
      })

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message)
        toast.error("Failed to connect to real-time server")
      })

      socket.on("getOnlineUsers", (userIds) => {
        console.log("Online users updated:", userIds)
        set({ onlineUsers: userIds })
      })

      socket.on("newMessage", (message) => {
        console.log("New message received:", message)

        // If this message is for the currently selected user, add it to the messages
        const selectedUser = useChatStore.getState().selectedUser
        if (
          selectedUser &&
          ((message.senderId === selectedUser._id && message.receiverId === authUser._id) ||
            (message.receiverId === selectedUser._id && message.senderId === authUser._id))
        ) {
          useChatStore.getState().addMessage(message)
        }
      })

      // Store socket in state
      set({ socket: socket })
    } catch (error) {
      console.error("Socket connection failed:", error)
    }
  },

  disconnectSocket: () => {
    const socket = get().socket
    if (socket) {
      console.log("Disconnecting socket...")
      socket.disconnect()
      set({ socket: null })
    }
  },
}))
