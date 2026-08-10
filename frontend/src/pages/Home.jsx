import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Users, Search, ChevronRight, X, Zap } from 'lucide-react';
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
      
      const roomsData = response.data.data || response.data || [];
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || creating) return;

    try {
      setCreating(true);
      const response = await api.post('/chat/rooms', { name: newRoomName });
      
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

  const filteredRooms = Array.isArray(rooms) 
    ? rooms.filter(room => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <Navbar title="ChatApp" />

      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chats</h2>
            <p className="text-slate-500 font-medium mt-1">Join the conversation</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms..."
            className="w-full bg-slate-200/60 text-slate-900 rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white placeholder-slate-500 font-medium transition-all"
          />
        </div>

        {/* Room List */}
        {loading ? (
          <RoomSkeleton />
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={48} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {searchQuery ? 'No matches found' : 'It\'s quiet here'}
            </h3>
            <p className="text-slate-500 font-medium mb-8">
              {searchQuery ? 'Try searching for something else.' : 'Be the first to start a conversation!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRooms.map((room) => (
              <button
                key={room._id}
                onClick={() => handleJoinRoom(room._id)}
                className="w-full bg-white rounded-3xl p-3 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all active:scale-[0.98] flex items-center group"
              >
                {/* Snapchat-style Story Ring Avatar */}
                <div className="p-[2px] rounded-full bg-gradient-to-tr from-blue-400 via-indigo-500 to-purple-500">
                  <div className="bg-white p-1 rounded-full">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="text-slate-600" size={24} />
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                <div className="ml-4 flex-1 text-left">
                  <h3 className="font-bold text-slate-800 text-lg mb-0.5 group-hover:text-blue-600 transition-colors">
                    {room.name}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Users size={14} />
                      <span className="text-sm font-medium">{room.members?.length || 0}</span>
                    </div>
                    {room.isActive && (
                      <div className="flex items-center space-x-1 text-blue-500">
                        <Zap size={14} className="fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wider">Active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                  <ChevronRight className="text-blue-500" size={24} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-6 lg:right-[calc(50%-20rem)] bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-xl shadow-blue-500/30 hover:scale-105 hover:shadow-blue-500/40 transition-all active:scale-95 flex items-center justify-center z-40"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 sm:p-0 transition-opacity"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-t-[2rem] sm:rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800">New Chat</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-8">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                placeholder="Name your room..."
                className="w-full px-5 py-4 bg-slate-100 border-none text-slate-800 font-bold rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition placeholder-slate-400 text-lg"
                autoFocus
              />
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim() || creating}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
            >
              {creating ? 'Creating...' : 'Start Chatting'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;