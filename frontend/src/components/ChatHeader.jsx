import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers = [] } = useAuthStore(); // Fixed the hook name from useAuthLayer to useAuthStore

  if (!selectedUser) return null;

  // Use consistent property names with fallbacks
  const username = selectedUser.username || selectedUser.fullName || "Unknown User";
  const avatar = selectedUser.avatar || selectedUser.profilePic || "/avatar.png";
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex items-center justify-between p-3 border-b border-base-300 bg-base-100">
      {/* Left side - User info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Avatar with online indicator */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={avatar}
              alt={username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/avatar.png";
              }}
            />
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100"></div>
          )}
        </div>

        {/* User name and status - will truncate if too long */}
        <div className="min-w-0">
          <h2 className="font-semibold truncate">{username}</h2>
          <p className={`text-xs truncate ${isOnline ? 'text-green-500' : 'text-base-content/50'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>

      {/* Right side - Close button */}
      <button
        onClick={() => setSelectedUser(null)}
        className="btn btn-ghost btn-circle hover:bg-base-200 ml-2"
        aria-label="Close chat"
      >
        <X className="w-5 h-5 text-base-content" />
      </button>
    </div>
  );
};

export default ChatHeader;