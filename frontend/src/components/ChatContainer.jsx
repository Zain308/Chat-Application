"use client"

import { useEffect, useRef } from "react"
import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore"
import ChatHeader from "./ChatHeader"
import MessageSkeleton from "./skeletons/MessageSkeleton"
import MessageInput from "./MessageInput.jsx"

export default function ChatContainer() {
  const { selectedUser, messages, isMessagesLoading } = useChatStore()
  const { authUser } = useAuthStore()
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Format timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      {selectedUser && <ChatHeader />}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {selectedUser ? (
          <>
            {isMessagesLoading ? (
              <MessageSkeleton />
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-base-content/30"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                <p className="text-base-content/60 max-w-md">Start the conversation by sending your first message</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {messages.map((message) => {
                  // Check if the message is from the current user
                  const isMyMessage = message.senderId === authUser?._id

                  return (
                    <div key={message._id} className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}>
                      <div className="chat-image avatar">
                        <div className="w-10 h-10 rounded-full">
                          <img
                            src={
                              isMyMessage
                                ? authUser?.profilePic || "/avatar.png"
                                : selectedUser?.profilePic || "/avatar.png"
                            }
                            alt={isMyMessage ? "You" : selectedUser?.fullName}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/avatar.png"
                            }}
                          />
                        </div>
                      </div>
                      <div className={`chat-bubble ${isMyMessage ? "bg-primary text-primary-content" : "bg-base-200"}`}>
                        {message.text && <p>{message.text}</p>}
                        {message.image && (
                          <div className="mt-2">
                            <img
                              src={message.image || "/placeholder.svg"}
                              alt="Message content"
                              className="rounded-lg max-w-xs object-contain"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.style.display = "none"
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="chat-footer opacity-50 text-xs">{formatMessageTime(message.createdAt)}</div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-base-content/30"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">No chat selected</h3>
            <p className="text-base-content/60 max-w-md">Select a user from the sidebar to start chatting</p>
          </div>
        )}
      </div>

      {/* Message Input - Added at the bottom */}
      {selectedUser && <MessageInput />}
    </div>
  )
}
