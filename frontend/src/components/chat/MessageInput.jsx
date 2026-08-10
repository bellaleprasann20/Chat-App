import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border-t border-gray-200 px-4 py-3">
      <div
        className={`flex items-end space-x-2 bg-gray-50 rounded-3xl px-2 py-1.5 border-2 transition-colors ${
          isFocused ? 'border-blue-400 bg-white' : 'border-transparent'
        }`}
      >
        <button
          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition active:scale-95 mb-0.5 flex-shrink-0"
          onClick={() => console.log('Emoji picker')}
        >
          <Smile size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent px-1 py-2 text-gray-900 placeholder-gray-400 outline-none resize-none text-sm"
          rows="1"
          style={{ minHeight: '38px', maxHeight: '120px' }}
          disabled={isSending}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className={`p-2.5 rounded-full transition-all active:scale-90 mb-0.5 flex-shrink-0 ${
            message.trim() && !isSending
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </div>

      <p className="text-[11px] text-gray-400 mt-1.5 text-center">
        Enter to send · Shift + Enter for new line
      </p>
    </div>
  );
};

export default MessageInput;