import { useChatStore } from '../store/useChatStore';

export default function Sidebar() {
  const { users, getUsers, isUsersLoading, selectedUser, setSelectedUser } = useChatStore();

  // Call getUsers when component mounts
  React.useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div className="w-64 border-r border-gray-200 p-4">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      {isUsersLoading ? (
        <div>Loading users...</div>
      ) : (
        <div className="space-y-2">
          {users.map(user => (
            <div 
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`p-2 rounded cursor-pointer ${selectedUser?._id === user._id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              {user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}