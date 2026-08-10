import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Mail, User as UserIcon, Calendar, Edit2, Save, X, MessageSquare, Users2, Sparkles } from 'lucide-react';
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
    bio: user?.bio || ''
  });

  const avatarGradient = gradientFor(user?.username);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      setError('Username and email are required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put('/auth/profile', formData);
      updateUser(response.data);
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
      bio: user?.bio || ''
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
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Profile" />

      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 mb-6 transition text-sm"
        >
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header with Gradient + subtle pattern */}
          <div className={`h-28 bg-gradient-to-r ${avatarGradient} relative overflow-hidden`}>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-10 -left-6 w-28 h-28 bg-white/10 rounded-full" />
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            <div className="flex items-start justify-between">
              {/* Avatar */}
              <div className="relative -mt-14 mb-4">
                <div className={`w-28 h-28 bg-gradient-to-br ${avatarGradient} rounded-full border-4 border-white shadow-lg flex items-center justify-center`}>
                  <span className="text-4xl font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute bottom-1 right-1 w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-md border border-gray-100 hover:bg-gray-50 transition active:scale-95">
                  <Camera size={15} />
                </button>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 flex items-center space-x-1.5 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition active:scale-95 shadow-sm"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {/* Success/Error Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                <Sparkles size={14} className="text-emerald-600" />
                <p className="text-emerald-700 text-sm">{success}</p>
              </div>
            )}

            {!isEditing && (
              <div className="mb-4">
                <h1 className="text-xl font-bold text-gray-900">{user?.username}</h1>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            )}

            {/* Profile Information */}
            <div className="space-y-4 mt-2">
              {isEditing && (
                <div>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    <UserIcon size={13} />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                  />
                </div>
              )}

              {isEditing && (
                <div>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    <Mail size={13} />
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                  />
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  <Edit2 size={13} />
                  <span>Bio</span>
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition text-gray-900"
                  />
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {user?.bio || 'No bio added yet'}
                  </p>
                )}
              </div>

              {/* Member Since */}
              <div className="flex items-center space-x-2 text-sm text-gray-500 pt-1">
                <Calendar size={14} />
                <span>Member since {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition active:scale-95"
                  disabled={loading}
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Card */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Activity</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-blue-50">
              <MessageSquare size={18} className="text-blue-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-0.5">Rooms Joined</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-purple-50">
              <Sparkles size={18} className="text-purple-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-0.5">Messages Sent</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-emerald-50">
              <Users2 size={18} className="text-emerald-500 mx-auto mb-1.5" />
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500 mt-0.5">Friends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;