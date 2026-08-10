import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Users, Search, ChevronRight, X, Zap, Sparkles, Radio, ShieldCheck, Flame } from 'lucide-react';
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-purple-50 pb-24 font-sans selection:bg-blue-200">
      <Navbar title="ChatApp" />

      <div className="max-w-3xl mx-auto px-4 pt-8">
        {/* Header Section */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900">
              Messages
            </h2>
            <div className="flex items-center space-x-2 mt-2">
              <Sparkles size={16} className="text-indigo-500" />
              <p className="text-slate-500 font-medium">Your active conversations</p>
            </div>
          </div>
        </div>

        {/* Live Status Banner Card */}
        <div className="mb-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
          {/* Background Ambient Glows */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold tracking-wider uppercase">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>System Online</span>
                </div>
                <div className="flex items-center space-x-1 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full text-blue-300 text-xs font-bold">
                  <Flame size={12} className="text-amber-400" />
                  <span>{rooms.length} Rooms Active</span>
                </div>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">Ready to connect?</h3>
              <p className="text-slate-300 text-sm mt-1 font-medium">
                Jump into any conversation below or spark a new one with your custom emoji avatar!
              </p>
            </div>

            <button
              onClick={() => navigate('/random')}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all duration-300 active:scale-95 flex items-center space-x-2 whitespace-nowrap"
            >
              <Zap size={16} className="text-amber-300" />
              <span>Try Random Chat</span>
            </button>
          </div>
        </div>

        {/* Search Bar - Glassmorphism */}
        <div className="relative mb-10 group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-transform group-focus-within:scale-110 group-focus-within:text-blue-500">
            <Search className="text-slate-400 transition-colors group-focus-within:text-blue-600" size={20} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms..."
            className="w-full bg-white/40 backdrop-blur-md border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-slate-900 rounded-full py-4 pl-14 pr-6 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white/80 focus:border-blue-300 placeholder-slate-400 font-medium transition-all duration-300"
          />
        </div>

        {/* Room List */}
        {loading ? (
          <RoomSkeleton />
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-sm">
            <div className="w-28 h-28 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-white">
              <MessageSquare size={48} className="text-blue-400 drop-shadow-sm" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
              {searchQuery ? 'No matches found' : 'It\'s awfully quiet'}
            </h3>
            <p className="text-slate-500 font-medium mb-6 text-base max-w-sm mx-auto">
              {searchQuery ? 'Try adjusting your search terms.' : 'Create your first chat room using the button below to get the conversation started!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <button
                key={room._id}
                onClick={() => handleJoinRoom(room._id)}
                className="w-full bg-white/60 backdrop-blur-xl rounded-[2rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/80 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/90 hover:border-blue-200/60 transition-all duration-300 active:scale-[0.98] flex items-center group"
              >
                {/* Premium Avatar Ring */}
                <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-shadow duration-300">
                  <div className="bg-white p-1 rounded-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center shadow-inner">
                      <MessageSquare className="text-slate-700" size={26} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Room Info */}
                <div className="ml-5 flex-1 text-left">
                  <h3 className="font-bold text-slate-800 text-xl mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                    {room.name}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 text-slate-500 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-sm font-semibold tracking-wide">{room.members?.length || 0}</span>
                    </div>
                    {room.isActive && (
                      <div className="flex items-center space-x-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Active</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Animated Arrow */}
                <div className="pr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-20px] group-hover:translate-x-0">
                  <div className="bg-blue-50 text-blue-600 p-2.5 rounded-full">
                    <ChevronRight size={24} strokeWidth={2.5} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-8 right-6 lg:right-[calc(50%-22rem)] z-40 group">
        <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="relative bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 flex items-center justify-center border border-white/20"
        >
          <Plus size={32} strokeWidth={2.5} />
        </button>
      </div>

      {/* Create Room Modal - Frosted Glass */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 sm:p-0 transition-opacity"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white/90 backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-white shadow-blue-900/10 transform transition-all animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-600 p-2.5 rounded-2xl">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">New Chat</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-700 transition-colors active:scale-90"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="mb-8 relative group">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                placeholder="Give your room a name..."
                className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent text-slate-800 font-bold rounded-3xl focus:bg-white focus:border-blue-500/30 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] outline-none transition-all duration-300 placeholder-slate-400 text-lg"
                autoFocus
              />
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!newRoomName.trim() || creating}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl font-bold text-lg tracking-wide hover:shadow-[0_8px_30px_rgb(59,130,246,0.4)] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {creating ? 'Sparking it up...' : 'Start Conversation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;