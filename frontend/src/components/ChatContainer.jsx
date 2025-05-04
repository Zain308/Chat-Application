import { useChatStore } from '../store/useChatStore';

export default function ChatContainer() {
  const { selectedUser, messages, isMessagesLoading } = useChatStore();

  return (
    <div className="flex-1 p-4">
      {selectedUser ? (
        <>
          <h2 className="text-xl font-bold mb-4">Chat with {selectedUser.username}</h2>
          {isMessagesLoading ? (
            <div>Loading messages...</div>
          ) : (
            <div className="space-y-2">
              {messages.map(message => (
                <div key={message._id} className="p-2 bg-gray-100 rounded">
                  {message.text}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>Select a user to start chatting</div>
      )}
    </div>
  );
}