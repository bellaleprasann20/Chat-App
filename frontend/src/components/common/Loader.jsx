import React from 'react';
import { MessageCircle } from 'lucide-react';

const Loader = ({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center z-50">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-pulse">
              <MessageCircle className="text-blue-500" size={40} />
            </div>
            {/* Spinning Border */}
            <div className="absolute inset-0 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Loading Text */}
          <p className="text-white text-lg font-semibold">{message}</p>
          
          {/* Animated Dots */}
          <div className="flex items-center justify-center space-x-1 mt-3">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Inline Loader
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        {/* Spinner */}
        <div className="relative w-12 h-12 mx-auto mb-3">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

// Skeleton Loader for Chat Messages
export const MessageSkeleton = () => {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className="flex items-end space-x-2 max-w-[70%]">
            {i % 2 !== 0 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            )}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-64'} bg-gray-200 rounded-2xl animate-pulse`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Skeleton Loader for Room List
export const RoomSkeleton = () => {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple Spinner Component
export const Spinner = ({ size = 'md', color = 'blue' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const colorClasses = {
    blue: 'border-t-blue-500',
    purple: 'border-t-purple-500',
    white: 'border-t-white',
    gray: 'border-t-gray-500'
  };

  return (
    <div className={`${sizeClasses[size]} border-gray-200 ${colorClasses[color]} border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}></div>
  );
};

export default Loader;