import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBox from '../components/chat/ChatBox';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import socket from '../services/socket';

const Chat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    fetchRoomData();
    setupSocketListeners();

    return () => {
      // Cleanup socket listeners
      socket.off('message');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('onlineUsers');
      socket.emit('leaveRoom', roomId);
    };
  }, [roomId]);

  const fetchRoomData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get room details
      const roomResponse = await api.get(`/chat/rooms/${roomId}`);
      const roomData = roomResponse.data.data || roomResponse.data;
      setRoom(roomData);

      // Check if user is a member, if not, join the room
      const isMember = roomData.members?.some(
        member => (member._id || member.id || member) === (user._id || user.id)
      );

      if (!isMember) {
        console.log('User not a member, joining room...');
        await api.post(`/chat/rooms/${roomId}/join`);
        
        // Refresh room data after joining
        const updatedRoomResponse = await api.get(`/chat/rooms/${roomId}`);
        setRoom(updatedRoomResponse.data.data || updatedRoomResponse.data);
      }

      // Fetch messages
      const messagesResponse = await api.get(`/messages/${roomId}`);
      const messagesData = messagesResponse.data.data || messagesResponse.data || [];
      setMessages(Array.isArray(messagesData) ? messagesData : []);

      // Join room via socket
      socket.emit('joinRoom', { roomId, userId: user._id || user.id });

    } catch (err) {
      console.error('Failed to fetch room data:', err);
      setError(err.response?.data?.message || 'Failed to load chat room');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for new messages
    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for user joined
    socket.on('userJoined', (data) => {
      console.log('User joined:', data);
      // Optionally show a notification
    });

    // Listen for user left
    socket.on('userLeft', (data) => {
      console.log('User left:', data);
      // Optionally show a notification
    });

    // Listen for online users update
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });
  };

  const handleSendMessage = async (content) => {
    try {
      const messageData = {
        roomId,
        content,
        sender: user._id || user.id
      };

      // Send via socket for real-time update
      socket.emit('sendMessage', messageData);

      // Also save to database via API
      await api.post('/messages', {
        chat: roomId,
        content
      });

    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return <Loader fullScreen message="Loading chat room..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-4xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition active:scale-95"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatBox
      room={room}
      messages={messages}
      onSendMessage={handleSendMessage}
      onlineUsers={onlineUsers}
      onBack={handleBack}
    />
  );
};

export default Chat;