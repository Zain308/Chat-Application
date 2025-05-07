import React from 'react';
import { Users, Loader, AlertTriangle } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

export default function Sidebar() {
  const { users = null, getUsers, isUsersLoading, selectedUser, setSelectedUser, error } = useChatStore();

  // Fetch users when the component mounts
  React.useEffect(() => {
    if (!users && !isUsersLoading && !error) {
      console.log('Fetching users...');
      getUsers(); // Call getUsers to fetch users from the database
    }
  }, [users, isUsersLoading, error, getUsers]);

  // Debug users and error
  React.useEffect(() => {
    console.log('Raw users:', users);
    console.log('Error:', error);
    console.log('Loading state:', isUsersLoading);
  }, [users, error, isUsersLoading]);

  return (
    <div className="w-72 h-full border-r border-base-300 bg-base-100 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Contacts</h2>
          <span className="badge badge-neutral ml-auto">
            {users?.filter((u) => u?.online === true).length || 0}/{users?.length || 0} online
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isUsersLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <Loader className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Loading contacts...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-error">
            <AlertTriangle className="w-10 h-10 mb-2" />
            <p>Failed to load contacts</p>
            <p className="text-sm opacity-70 mt-1">{error}</p>
            <button
              onClick={() => getUsers()}
              className="mt-2 btn btn-sm btn-primary"
            >
              Retry
            </button>
          </div>
        ) : !users || users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Users className="w-10 h-10 mb-2 opacity-30" />
            <p>No contacts available</p>
            <p className="text-sm opacity-70 mt-1">When contacts appear, they'll show up here</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {users
              .filter((user) => user && user._id && user.username)
              .map((user) => {
                const username = user.username;
                const firstLetter = username.charAt(0).toUpperCase();

                return (
                  <button
                    key={user._id}
                    onClick={() => {
                      console.log('Selecting user:', user);
                      setSelectedUser(user);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-btn transition-all ${
                      selectedUser?._id === user._id
                        ? 'bg-primary/10 text-primary-content'
                        : 'hover:bg-base-200'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="avatar placeholder">
                      <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={username}
                            onError={(e) => {
                              e.currentTarget.src = '';
                              e.currentTarget.parentElement.classList.add('bg-neutral', 'text-neutral-content');
                            }}
                          />
                        ) : (
                          <span>{firstLetter}</span>
                        )}
                      </div>
                    </div>

                    {/* User info */}
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium truncate">{username}</p>
                      <p
                        className={`text-xs truncate ${
                          user.online ? 'text-success' : 'text-base-content/50'
                        }`}
                      >
                        {user.online ? 'Online' : 'Offline'}
                      </p>
                    </div>

                    {/* Active indicator */}
                    {selectedUser?._id === user._id && (
                      <div className="w-2 h-2 rounded-full bg-primary ml-auto"></div>
                    )}
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}