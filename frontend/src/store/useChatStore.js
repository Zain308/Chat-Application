import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios"

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  error: null,
  showSelfInSidebar: false, // State to control showing self in sidebar

  // Toggle showing self in sidebar
  toggleShowSelf: () => {
    set((state) => ({ showSelfInSidebar: !state.showSelfInSidebar }))
  },

  // Clear all chat data (used when logging out)
  clearChatData: () => {
    set({
      messages: [],
      users: [],
      selectedUser: null,
      error: null,
    })
  },

  // Add a new message to the messages array (for real-time updates)
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  getUsers: async (forceRefresh = false) => {
    // Skip if already loading and not forced
    if (get().isUsersLoading && !forceRefresh) return

    set({ isUsersLoading: true, error: null })
    try {
      // Include the showSelfInSidebar parameter in the request
      const showSelf = get().showSelfInSidebar
      const res = await axiosInstance.get(`/message/users?includeCurrentUser=${showSelf}`)

      // Log the response for debugging
      console.log("Users fetched:", res.data)

      set({ users: res.data })
      return res.data
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to load users"
      set({ error: errorMessage })
      toast.error(errorMessage)
    } finally {
      set({ isUsersLoading: false })
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user })
    if (user && user._id) {
      get().getMessages(user._id)
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true })
    try {
      const res = await axiosInstance.get(`/message/${userId}`)
      set({ messages: res.data })

      // Debug message data
      console.log("Messages loaded:", res.data.length)
      if (res.data.length > 0) {
        console.log("Sample message:", {
          id: res.data[0]._id,
          senderId: res.data[0].senderId,
          receiverId: res.data[0].receiverId,
          text: res.data[0].text,
          hasImage: !!res.data[0].image,
        })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages")
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  sendMessage: async (receiverId, formData) => {
    set({ isSendingMessage: true })
    try {
      console.log("Sending message to:", receiverId)

      // Send the FormData directly
      const res = await axiosInstance.post(`/message/send/${receiverId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Update messages state with the new message
      set((state) => ({
        messages: [...state.messages, res.data],
      }))

      return res.data
    } catch (error) {
      console.error("Failed to send message:", error)
      throw error
    } finally {
      set({ isSendingMessage: false })
    }
  },
}))
