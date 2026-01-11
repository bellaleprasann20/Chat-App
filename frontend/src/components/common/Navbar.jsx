import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Menu, X, LogOut, User, Settings, MessageSquare, Home as HomeIcon, Shuffle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ title = 'ChatApp' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <MessageCircle className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                {user && (
                  <p className="text-xs text-gray-500">Welcome, {user.username}</p>
                )}
              </div>
            </div>

            {/* Navigation Icons */}
            {user && (
              <div className="flex items-center space-x-2">
                {/* Home Button */}
                <button
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                  title="Home"
                >
                  <HomeIcon size={22} className="text-gray-600" />
                </button>

                {/* Messages Button */}
                <button
                  onClick={() => navigate('/messages')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                  title="Direct Messages"
                >
                  <MessageSquare size={22} className="text-gray-600" />
                </button>

                {/* Random Chat Button */}
                <button
                  onClick={() => navigate('/random')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                  title="Random Chat"
                >
                  <Shuffle size={22} className="text-gray-600" />
                </button>

                {/* Menu Button */}
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition active:scale-95"
                  title="Menu"
                >
                  <Menu size={24} className="text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Slide-in Menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">Menu</h2>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>

              {/* User Profile Section */}
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-3xl font-bold text-blue-500">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-white font-semibold text-lg">{user?.username}</p>
                <p className="text-blue-100 text-sm">{user?.email}</p>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-100 text-xs">Online</span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {/* Home */}
              <button
                onClick={() => {
                  navigate('/');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition active:scale-95"
              >
                <HomeIcon size={20} />
                <span className="font-medium">Home</span>
              </button>

              {/* Messages */}
              <button
                onClick={() => {
                  navigate('/messages');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition active:scale-95"
              >
                <MessageSquare size={20} />
                <span className="font-medium">Messages</span>
              </button>

              {/* Random Chat */}
              <button
                onClick={() => {
                  navigate('/random');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition active:scale-95"
              >
                <Shuffle size={20} />
                <span className="font-medium">Random Chat</span>
              </button>

              {/* Profile */}
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition active:scale-95"
              >
                <User size={20} />
                <span className="font-medium">My Profile</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  // Navigate to settings page when created
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition active:scale-95"
              >
                <Settings size={20} />
                <span className="font-medium">Settings</span>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition active:scale-95"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                ChatApp v1.0.0
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                © 2024 All rights reserved
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;