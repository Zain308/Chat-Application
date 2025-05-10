"use client"

import { useState, useEffect } from "react"
import { Users, Loader, AlertTriangle, RefreshCw, Settings } from "lucide-react"
import { useChatStore } from "../store/useChatStore"
import { useAuthStore } from "../store/useAuthStore"
import toast from "react-hot-toast"

export default function Sidebar() {
  const {
    users = [],
    getUsers,
    isUsersLoading,
    selectedUser,
    setSelectedUser,
    error,
    showSelfInSidebar,
    toggleShowSelf,
  } = useChatStore()

  const { onlineUsers = [], authUser } = useAuthStore()
  const [imageErrors, setImageErrors] = useState({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch users when the component mounts or when auth user changes
  useEffect(() => {
    if (authUser?._id) {
      console.log("Auth user changed, refreshing users list")
      getUsers(true)
    }
  }, [authUser?._id, getUsers])

  // Debug users and online status
  useEffect(() => {
    console.log("Users data:", users)
    console.log("Online users:", onlineUsers)
    console.log("Current user:", authUser?._id)
    console.log("Show self in sidebar:", showSelfInSidebar)
  }, [users, onlineUsers, authUser, showSelfInSidebar])

  // Handle image loading errors
  const handleImageError = (userId) => {
    console.log(`Image failed to load for user: ${userId}`)
    setImageErrors((prev) => ({ ...prev, [userId]: true }))
  }

  // Refresh users list
  const handleRefresh = async () => {
    setIsRefreshing(true)
    setImageErrors({}) // Reset image errors
    try {
      await getUsers(true)
    } catch (error) {
      console.error("Failed to refresh users:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Update user online status using onlineUsers from useAuthStore
  const updatedUsers = users
    .filter((user) => {
      // If showSelfInSidebar is false, filter out the current user
      if (!showSelfInSidebar && user._id === authUser?._id) {
        return false
      }
      return true
    })
    .map((user) => ({
      ...user,
      online: onlineUsers.includes(user._id),
    }))

  // Create a user object for the current user if showSelfInSidebar is true
  const currentUserForSidebar =
    showSelfInSidebar && authUser
      ? {
          ...authUser,
          online: true, // Current user is always online
          isSelf: true, // Mark as self for special styling
        }
      : null

  // Combine current user with other users if needed
  const displayUsers = currentUserForSidebar ? [currentUserForSidebar, ...updatedUsers] : updatedUsers

  return (
    <div className="w-72 h-full border-r border-base-300 bg-base-100 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Contacts</h2>
          <span className="badge badge-neutral ml-auto">
            {displayUsers?.filter((u) => u?.online === true).length || 0}/{displayUsers?.length || 0} online
          </span>

          {/* Settings dropdown */}
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-xs" tabIndex={0}>
              <Settings size={16} />
            </button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <button onClick={toggleShowSelf}>
                  {showSelfInSidebar ? "Hide myself in sidebar" : "Show myself in sidebar"}
                </button>
              </li>
              <li>
                <button onClick={handleRefresh} disabled={isRefreshing}>
                  Refresh contacts
                </button>
              </li>
            </ul>
          </div>

          <button
            onClick={handleRefresh}
            className={`btn btn-ghost btn-xs ${isRefreshing ? "animate-spin" : ""}`}
            disabled={isRefreshing}
            title="Refresh contacts"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isUsersLoading || isRefreshing ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <Loader className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">{isRefreshing ? "Refreshing contacts..." : "Loading contacts..."}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-error">
            <AlertTriangle className="w-10 h-10 mb-2" />
            <p>Failed to load contacts</p>
            <p className="text-sm opacity-70 mt-1">{error}</p>
            <button onClick={handleRefresh} className="mt-2 btn btn-sm btn-primary">
              Retry
            </button>
          </div>
        ) : !displayUsers || displayUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Users className="w-10 h-10 mb-2 opacity-30" />
            <p>No contacts available</p>
            <p className="text-sm opacity-70 mt-1">When contacts appear, they'll show up here</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {displayUsers
              .filter((user) => user && user._id && (user.username || user.fullName))
              .map((user) => {
                const username = user.username || user.fullName // Support both username and fullName
                const firstLetter = username.charAt(0).toUpperCase()
                const hasProfilePic = (user.profilePic || user.avatar) && !imageErrors[user._id]
                const isSelf = user.isSelf || user._id === authUser?._id

                return (
                  <button
                    key={user._id}
                    onClick={() => {
                      // Don't allow selecting yourself
                      if (isSelf) {
                        toast.info("You can't chat with yourself")
                        return
                      }

                      console.log("Selecting user:", user)
                      setSelectedUser(user)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-btn transition-all ${
                      isSelf
                        ? "bg-base-200 cursor-default"
                        : selectedUser?._id === user._id
                          ? "bg-primary/10 text-primary-content"
                          : "hover:bg-base-200"
                    }`}
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative">
                      <div className="avatar placeholder">
                        <div
                          className={`w-10 h-10 rounded-full ${isSelf ? "ring-2 ring-primary" : ""} bg-neutral text-neutral-content overflow-hidden`}
                        >
                          {hasProfilePic ? (
                            <img
                              src={user.profilePic || user.avatar}
                              alt={username}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(user._id)}
                            />
                          ) : (
                            <span>{firstLetter}</span>
                          )}
                        </div>
                      </div>

                      {/* Online indicator */}
                      {user.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
                      )}
                    </div>

                    {/* User info */}
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium truncate flex items-center gap-1">
                        {username}
                        {isSelf && <span className="text-xs text-primary">(You)</span>}
                      </p>
                      <p className={`text-xs truncate ${user.online ? "text-success" : "text-base-content/50"}`}>
                        {isSelf ? "Online (current user)" : user.online ? "Online" : "Offline"}
                      </p>
                    </div>

                    {/* Active indicator */}
                    {selectedUser?._id === user._id && <div className="w-2 h-2 rounded-full bg-primary ml-auto"></div>}
                  </button>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
