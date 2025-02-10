"use client";

import React, { useState, useEffect } from 'react';
import { Mic, Keyboard, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRealtimeSessionEngine } from 'gabber-client-react';
import { updateSessionPersona } from '@/app/actions';
import type { ContextMessageToolCall } from 'gabber-client-core';

interface Persona {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  voice?: string;
}

interface Message {
  id: string;
  content: string;
  isAgent: boolean;
  timestamp: Date;
}

export const MinimalChat = ({ 
  personas, 
  currentIndex, 
  onPersonaChange 
}: { 
  personas: Persona[], 
  currentIndex: number,
  onPersonaChange: (index: number) => void
}) => {
  const { 
    sendChatMessage, 
    setMicrophoneEnabled, 
    microphoneEnabled, 
    startAudio, 
    messages: sessionMessages,
    disconnect
  } = useRealtimeSessionEngine();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const handlePersonaChange = async (direction: 'next' | 'prev') => {
    if (personas.length <= 1) return;
    
    if (microphoneEnabled) {
      setMicrophoneEnabled(false);
    }
    
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting session:', error);
    }
    
    const newIndex = direction === 'next'
      ? (currentIndex + 1) % personas.length
      : (currentIndex - 1 + personas.length) % personas.length;
    
    onPersonaChange(newIndex);
  };

  const handleMicToggle = async () => {
    try {
      if (!microphoneEnabled) {
        await startAudio();
      }
      setMicrophoneEnabled(!microphoneEnabled);
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    try {
      await sendChatMessage({ text });
      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleToolCalls = (message: { tool_calls?: Array<ContextMessageToolCall> }) => {

    if (!message.tool_calls?.length) return;
    
    message.tool_calls.forEach(toolCall => {
      if (toolCall.type === 'gabber_tool') {
        switch (toolCall.function.name) {
          case 'next_persona':
            handlePersonaChange('next');
            break;
          case 'previous_persona':
            handlePersonaChange('prev');
            break;
          default:
            console.log('Unknown tool call:', toolCall);
        }
      }
    });
  };

  const displayMessages = sessionMessages || messages;

  useEffect(() => {
    if (!sessionMessages?.length) return;
    const lastMessage = sessionMessages[sessionMessages.length - 1];
    if (lastMessage.agent && lastMessage.tool_calls) {
      handleToolCalls(lastMessage);
    }
  }, [sessionMessages]);

  return (
    <div className="border-2 border-green-500 p-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-green-500">
        <button
          onClick={() => handlePersonaChange('prev')}
          className="p-2 text-green-500 hover:text-green-400"
          disabled={personas.length <= 1}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-4">
          {personas[currentIndex].image_url ? (
            <img 
              src={personas[currentIndex].image_url} 
              alt={personas[currentIndex].name}
              className="w-12 h-12 object-cover rounded-full border-2 border-green-500"
            />
          ) : (
            <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center">
              <span className="text-green-500">AI</span>
            </div>
          )}
          <span className="text-lg">{personas[currentIndex].name}</span>
        </div>

        <button
          onClick={() => handlePersonaChange('next')}
          className="p-2 text-green-500 hover:text-green-400"
          disabled={personas.length <= 1}
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
      
      <div className="h-[300px] mb-4 overflow-y-auto border-2 border-green-500 p-4 space-y-2">
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={`p-2 border-2 ${
              message.agent
                ? 'border-green-700 mr-auto'
                : 'border-green-500 ml-auto'
            } max-w-[80%]`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleMicToggle}
            className={`p-3 border-2 ${
              microphoneEnabled 
                ? 'border-red-500 text-red-500' 
                : 'border-green-500 text-green-500'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className="p-3 border-2 border-green-500 text-green-500"
          >
            <Keyboard className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showTextInput && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex gap-2 mt-4"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-black border-2 border-green-500 p-2 text-green-500"
            placeholder="Type your message..."
          />
        </form>
      )}
    </div>
  );
}; 