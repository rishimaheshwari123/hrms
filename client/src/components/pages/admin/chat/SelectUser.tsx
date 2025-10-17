import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { RootState } from '@/redux/store';

const ConversationList = ({ onConversationSelect, onUserSelect }) => {
  const [conversations, setConversations] = useState([]);
  const { user, token } = useSelector((state:RootState) => state.auth);
  const [socket, setSocket] = useState(null);
  const BASE_URL = import.meta.env.VITE_SOCKET_BASE_URL;
  const[first,setFirst] = useState(true)
  const [loading, setLoading] = useState(false);


  const fetchConversations = async () => {
    if(first){
      setLoading(true)

    }
    try {
      const { data } = await axios.get(`${BASE_URL}/api/v1/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(data)
      // console.log(data)
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setFirst(false)
    setLoading(false)
  };

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io(BASE_URL, {
      query: { token }, // Pass the auth token if required
    });
    setSocket(newSocket);

    // Clean up on component unmount
    return () => newSocket.close();
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (socket) {
      // Listen for message read events
      socket.on('message_read', () => {
        fetchConversations(); // Update conversations when messages are read
      });

      // Listen for new message events
      socket.on('new_message', () => {
        fetchConversations(); // Update conversations when new messages are received
      });
    }
  }, [socket]);

  const onClickUser = async (id) => {
    onUserSelect(id);
    fetchConversations(); // Refresh the conversations after a user is selected
  };


  if (loading && conversations.length === 0) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
     Conversations

      </h1>
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Conversations</h2>
      {conversations.map(conversation => (
        <div
          key={conversation._id}
          className="flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 rounded-lg"
        >
          {conversation.participants
            .filter(p => p._id !== user._id) // Exclude current user
            .map(participant => (
              <div
                key={participant._id}
                className={`flex items-center space-x-3 ${conversation.unreadCount > 0 ? 'font-bold' : ''}`}
                onClick={() => onClickUser(participant._id)}
              >
               <div className="flex items-center space-x-2">
  {participant?.photoUrl ? (
    <img
      src={participant.photoUrl}
      alt={participant.name}
      className="w-10 h-10 rounded-full object-cover"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-semibold text-lg">
      {participant?.name ? participant.name.charAt(0).toUpperCase() : "U"}
    </div>
  )}

</div>

                <div className="flex-1">
                  <div className="text-lg font-medium">{participant.name}</div>
                  <div className="text-sm text-gray-600">
                    {conversation.unreadCount > 1 ? (
                      <span className="text-red-500">2+ Unread Messages</span>
                    ) : conversation.unreadCount === 1 ? (
                      <span className="text-red-500">1 Unread Message</span>
                    ) : (
                      <span>No Unread Messages</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
