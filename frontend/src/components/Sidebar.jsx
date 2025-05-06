import React from 'react';
import { Users, Loader } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';

export default function Sidebar() {
  const { users, getUsers, isUsersLoading, selectedUser, setSelectedUser } = useChatStore();

  React.useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <aside className="h-full w-64 border-r border-base-300 flex flex-col">
      {/* Header */}
      <div className="border-b border-base-300 p-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Contacts</h2>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isUsersLoading ? (
          <div className="flex flex-col gap-3 p-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton rounded-full h-10 w-10" />
                <div className="hidden md:block flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Users className="w-8 h-8 mb-2" />
            <p>No contacts available</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {users.map(user => (
              <li
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
                  ${selectedUser?._id === user._id 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-base-200'
                  }
                `}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white 
                    ${user.online ? 'bg-green-500' : 'bg-gray-400'}`}
                  />
                </div>
                <div className="hidden md:block overflow-hidden">
                  <h3 className="font-medium truncate">{user.username}</h3>
                  <p className="text-sm text-gray-500 truncate">
                    {user.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}