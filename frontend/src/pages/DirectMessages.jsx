import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Search, Plus, Circle } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import api from '../services/api';

const DirectMessages = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDM, setShowNewDM] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dm');
      const dms = response.data.data || response.data || [];
      setConversations(Array.isArray(dms) ? dms : []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const response = await api.get(`/dm/users?search=${query}`);
      const userData = response.data.data || response.data || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      console.error('Failed to search users:', error);
      setUsers([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleUserSelect = async (userId) => {
    try {
      const response = await api.post(`/dm/${userId}`);
      const dm = response.data.data || response.data;
      navigate(`/dm/${dm._id}`);
    } catch (error) {
      console.error('Failed to create DM:', error);
      alert('Failed to start conversation');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setUsers([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Messages" />

      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Direct Messages</h2>
          <button
            onClick={() => setShowNewDM(true)}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition active:scale-95 shadow-md"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Conversations List */}
        {loading ? (
          <Loader message="Loading conversations..." />
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No messages yet</h3>
            <p className="text-gray-600 mb-4">Start a conversation with someone</p>
            <button
              onClick={() => setShowNewDM(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              New Message
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => navigate(`/dm/${conv._id}`)}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition active:scale-98"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {conv.otherUser?.username?.charAt(0).toUpperCase()}
                    </div>
                    {conv.otherUser?.isOnline && (
                      <Circle className="absolute bottom-0 right-0 w-4 h-4 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {conv.otherUser?.username}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conv.lastMessage && formatTime(conv.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New DM Modal */}
      {showNewDM && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewDM(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b">
              <h3 className="text-xl font-bold text-gray-800 mb-3">New Message</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchingUsers ? (
                <Loader message="Searching..." />
              ) : users.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {searchQuery ? 'No users found' : 'Start typing to search users'}
                </p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleUserSelect(user._id)}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        {user.isOnline && (
                          <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-800">{user.username}</p>
                        <p className="text-sm text-gray-500">
                          {user.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectMessages;