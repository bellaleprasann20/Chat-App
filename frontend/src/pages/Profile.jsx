import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mail, User as UserIcon, Calendar, Edit2, Save, X, MessageSquare, Users2, Sparkles, Smile } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const GRADIENTS = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-indigo-500 to-blue-400',
];

// A fun list of emojis for users to choose from
const AVATAR_EMOJIS = ['😎', '👻', '🤖', '👾', '🐶', '🦊', '🐯', '🐸', '🦄', '🐼', '🦖', '🚀'];

const gradientFor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  // Keep form data synced if the global user state changes or reloads
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const avatarGradient = gradientFor(user?.username);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleAvatarSelect = (emoji) => {
    setFormData({ ...formData, avatar: emoji });
  };

  const handleSave = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      setError('Username and email are required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put('/auth/profile', formData);
      
      // Fixed: extract .user from response to match backend structure
      updateUser(response.data.user); 
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <Navbar title="Profile" />

      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors text-sm font-medium w-max px-3 py-1.5 rounded-lg hover:bg-slate-200/50"
        >
          <ArrowLeft size={18} />
          <span>Back to Chats</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
          {/* Header with Gradient + subtle pattern */}
          <div className={`h-32 bg-gradient-to-r ${avatarGradient} relative overflow-hidden`}>
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
          </div>

          {/* Profile Content */}
          <div className="relative px-8 pb-8">
            <div className="flex items-start justify-between">
              {/* Avatar */}
              <div className="relative -mt-16 mb-6">
                <div className={`w-32 h-32 bg-gradient-to-br ${avatarGradient} rounded-full border-[6px] border-white shadow-xl flex items-center justify-center transition-all duration-300`}>
                  {formData.avatar ? (
                    <span className="text-6xl drop-shadow-md">{formData.avatar}</span>
                  ) : (
                    <span className="text-5xl font-black text-white drop-shadow-md">
                      {formData.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-1 right-1 w-10 h-10 bg-white text-slate-700 rounded-full flex items-center justify-center shadow-lg border border-slate-100 hover:bg-slate-50 hover:scale-105 transition-all active:scale-95"
                  >
                    <Camera size={18} />
                  </button>
                )}
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-5 flex items-center space-x-2 px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all active:scale-95"
                >
                  <Edit2 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Success/Error Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
                <Sparkles size={18} className="text-emerald-600" />
                <p className="text-emerald-700 text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Profile Info (View Mode) */}
            {!isEditing && (
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user?.username}</h1>
                <p className="text-slate-500 font-medium">{user?.email}</p>
              </div>
            )}

            {/* Profile Form (Edit Mode) */}
            <div className="space-y-5 mt-2">
              
              {/* Emoji Selector */}
              {isEditing && (
                <div className="animate-in fade-in duration-300 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    <Smile size={14} />
                    <span>Choose an Avatar</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {/* Default Letter Avatar Option */}
                    <button
                      type="button"
                      onClick={() => handleAvatarSelect('')}
                      className={`w-12 h-12 flex items-center justify-center rounded-full text-xl font-black transition-all ${
                        !formData.avatar
                          ? `bg-gradient-to-br ${avatarGradient} text-white shadow-md scale-110 ring-4 ring-blue-500/20`
                          : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100 hover:scale-105'
                      }`}
                    >
                      {formData.username?.charAt(0).toUpperCase() || 'A'}
                    </button>
                    
                    {/* Emoji Options */}
                    {AVATAR_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleAvatarSelect(emoji)}
                        className={`w-12 h-12 text-2xl flex items-center justify-center rounded-full transition-all ${
                          formData.avatar === emoji
                            ? 'bg-white shadow-md scale-110 ring-4 ring-blue-500/20'
                            : 'bg-white border border-slate-200 hover:bg-slate-100 hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Inputs */}
              {isEditing && (
                <div className="animate-in fade-in duration-300">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <UserIcon size={14} />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-0 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
              )}

              {isEditing && (
                <div className="animate-in fade-in duration-300">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Mail size={14} />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-0 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium"
                  />
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Edit2 size={14} />
                  <span>Bio</span>
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tell everyone a little about yourself..."
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:bg-white focus:ring-0 focus:border-blue-500 outline-none resize-none transition-all text-slate-900 font-medium"
                  />
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-slate-600 text-[15px] leading-relaxed font-medium">
                      {user?.bio || 'No bio added yet. Click edit to add one!'}
                    </p>
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="flex items-center space-x-2 text-sm font-medium text-slate-400 pt-2">
                <Calendar size={16} />
                <span>Joined {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-4 mt-8 animate-in fade-in slide-in-from-bottom-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                  disabled={loading}
                >
                  <X size={20} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Card */}
        <div className="mt-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-5">Your Activity</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-2xl bg-blue-50 border border-blue-100/50 transition-transform hover:-translate-y-1">
              <MessageSquare size={22} className="text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-slate-800">0</p>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Rooms</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-purple-50 border border-purple-100/50 transition-transform hover:-translate-y-1">
              <Sparkles size={22} className="text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-slate-800">0</p>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Messages</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 transition-transform hover:-translate-y-1">
              <Users2 size={22} className="text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-slate-800">0</p>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Friends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;