import React, { useState } from 'react';
import UserSearch from './SearchUser';
import ConversationList from './SelectUser';
import Chat from './Chats';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const ChatsApp = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { user } = useSelector((state:RootState) => state.auth);

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setSelectedConversation(null); // Clear conversation selection when a user is selected
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setSelectedUser(null); // Clear user selection when a conversation is selected
  };

  const closeChat = () => {
    setSelectedConversation(null);
    setSelectedUser(null); // Optionally clear user selection as well
  };

  const getReceiverId = () => {
    if (selectedConversation) {
      return selectedConversation.participants.find(id => id !== user._id);
    }
  
    return selectedUser;
  };

  return (
    <div className="flex h-screen">
      <div className="w-screen border-r p-4">
        <UserSearch onUserSelect={handleUserSelect} />
        <ConversationList onConversationSelect={handleConversationSelect} onUserSelect={handleUserSelect} />
      </div>
      <div className=" p-4">
        {getReceiverId() && (
          <Chat receiverId={getReceiverId()} onClose={closeChat} idReciever={selectedUser}  />
        )}
      </div>
    </div>
  );
};

export default ChatsApp;
