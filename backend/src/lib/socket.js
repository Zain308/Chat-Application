import { Server } from "socket.io"
import express from "express"
import http from "http"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true, // This is crucial for CORS with credentials
  },
})

// Used to store the online users with their session IDs
// Format: { userId: { sessionId1: socketId1, sessionId2: socketId2, ... } }
const userSocketMap = {}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id)

  const userId = socket.handshake.query.userId
  const sessionId = socket.handshake.query.sessionId || "default"

  if (userId) {
    // Initialize user entry if it doesn't exist
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = {}
    }

    // Store this socket with its session ID
    userSocketMap[userId][sessionId] = socket.id

    console.log(`User ${userId} (session ${sessionId}) is now online.`)
    console.log(`Total online users: ${Object.keys(userSocketMap).length}`)
    console.log(`User ${userId} has ${Object.keys(userSocketMap[userId]).length} active sessions`)
  }

  // Emit the updated online users list to all clients
  // We consider a user online if they have at least one active session
  io.emit("getOnlineUsers", Object.keys(userSocketMap))

  // Handle new message
  socket.on("sendMessage", (message) => {
    console.log("New message received from socket:", message)

    // Find all sockets for the recipient
    const recipientSockets = userSocketMap[message.receiverId]

    if (recipientSockets) {
      // Send to all sessions of the recipient
      Object.values(recipientSockets).forEach((socketId) => {
        io.to(socketId).emit("newMessage", message)
      })
    }

    // Also send to all other sessions of the sender (except this one)
    const senderSockets = userSocketMap[message.senderId]
    if (senderSockets) {
      Object.entries(senderSockets).forEach(([sid, socketId]) => {
        if (sid !== sessionId) {
          io.to(socketId).emit("newMessage", message)
        }
      })
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id)

    // Find and remove the disconnected session
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId][sessionId]

      console.log(`User ${userId} (session ${sessionId}) disconnected.`)

      // If this user has no more active sessions, remove them completely
      if (Object.keys(userSocketMap[userId]).length === 0) {
        delete userSocketMap[userId]
        console.log(`User ${userId} is now completely offline.`)
      } else {
        console.log(`User ${userId} still has ${Object.keys(userSocketMap[userId]).length} active sessions`)
      }
    }

    // Emit the updated online users list
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
  })
})

export { io, app, server }
