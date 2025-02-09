"use client";

import React, { useState } from 'react';
import { RealtimeSessionEngineProvider } from 'gabber-client-react';

export function Chat({ personaName }: { personaName: string }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const { session } = RealtimeSessionEngineProvider();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    
    try {
      // Send message to Gabber
      const response = await session.sendMessage(message);
      
      // Add bot response to chat
      setMessages(prev => [...prev, { text: response.text, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { text: 'ERROR: Failed to process message', sender: 'bot' }]);
    }

    setMessage('');
  };

  return (
    <div className="border-2 border-green-500 p-4 h-[600px] flex flex-col">
      <div className="text-center mb-4 pb-2 border-b-2 border-green-500">
        CHAT SESSION WITH {personaName}
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 border-2 ${
              msg.sender === 'user'
                ? 'border-green-500 ml-auto'
                : 'border-green-700 mr-auto'
            } max-w-[80%]`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-black border-2 border-green-500 p-2 text-green-500 focus:outline-none focus:border-green-400"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          className="px-4 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-colors"
        >
          SEND
        </button>
      </form>
    </div>
  );
}