import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Users, Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { RoomSkeleton } from '../components/common/Loader';
import api from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/rooms');
      
      // Handle different response structures
      const roomsData = response.data.data || response.data || [];
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setRooms([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || creating) return;

    try {
      setCreating(true);
      const response = await api.post('/chat/rooms', { name: newRoomName });
      
      // Handle response structure
      const newRoom = response.data.data || response.data;
      setRooms([newRoom, ...rooms]);
      setNewRoomName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert(error.response?.data?.message || 'Failed to create room');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };

  // Safely filter rooms
  const filteredRooms = Array.isArray(rooms) 
    ? rooms.filter(room => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="ChatApp" />

      <div className="max-w-4xl mx-auto p-4">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Chat Rooms</h2>
          <p className="text-gray-600">Join a room and start chatting with others</p>
        </div>

        {/* Search and Create Section */}
        <div className="mb-6 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Create Room Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition active:scale-95 shadow-md"
          >
            <Plus size={20} />
            <span>Create New Room</span>
          </button>
        </div>

        {/* Room List */}
        {loading ? (
          <RoomSkeleton />
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {searchQuery ? 'No rooms found' : 'No rooms available'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try a different search term' : 'Create your first room to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRooms.map((room) => (
              <button
                key={room._id}
                onClick={() => handleJoinRoom(room._id)}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
                      <MessageCircle className="text-white" size={28} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 text-lg">{room.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Users size={14} />
                          <span className="text-sm">{room.members?.length || 0} members</span>
                        </div>
                        {room.isActive && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <TrendingUp size={14} />
                            <span className="text-xs">Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Room</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                placeholder="Enter room name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition active:scale-95"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim() || creating}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;