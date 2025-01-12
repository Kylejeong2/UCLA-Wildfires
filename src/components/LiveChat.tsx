"use client"

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCallback } from 'react';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
}

export default function LiveChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001');
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (socket && inputMessage.trim()) {
      const message: Omit<Message, 'id'> = {
        text: inputMessage,
        sender: 'User', // Replace with actual user info when auth is added
        timestamp: new Date(),
      };

      socket.emit('message', message);
      setInputMessage('');
    }
  }, [socket, inputMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-2 mb-4 p-2"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg max-w-[80%] ${
              msg.sender === 'User' 
                ? 'ml-auto bg-blue-600 text-white' 
                : 'bg-gray-100'
            }`}
          >
            <p className="text-sm">{msg.text}</p>
            <span className="text-xs opacity-70">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
} 