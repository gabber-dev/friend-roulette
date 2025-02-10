"use client";

import React, { useState, useEffect } from 'react';
import { useApi, RealtimeSessionEngineProvider } from 'gabber-client-react';
import { Bot, Loader2, AlertTriangle, Users } from 'lucide-react';
import { MinimalChat } from './MinimalChat';

interface Persona {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  voice?: string;
}

export const PersonaSelector = ({ usageToken, onCreateNew }: { 
  usageToken: string, 
  onCreateNew: () => void
}) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);
  const { api } = useApi();

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.persona.listPersonas();
        const personasData = response.data.values || [];
        setPersonas(personasData);
      } catch (err) {
        console.error('Error fetching personas:', err);
        setError('Failed to load personas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonas();
  }, [api]);

  const handlePersonaChange = async (newIndex: number) => {
    setCurrentPersonaIndex(newIndex);
    setSessionKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 text-green-500/70">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">INITIALIZING PERSONA DATABASE...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border-2 border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 text-red-500/80">
          <AlertTriangle className="w-5 h-5" />
          <p>System Malfunction</p>
        </div>
        <p className="mt-2 text-sm text-red-500/60">{error}</p>
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 border-2 border-dashed border-green-500/30">
        <Users className="w-12 h-12 text-green-500/50" />
        <div className="text-center space-y-2">
          <p className="text-green-500/70">NO PERSONAS DETECTED</p>
          <p className="text-sm text-green-500/50">Create your first AI companion to begin</p>
        </div>
        <button
          onClick={onCreateNew}
          className="mt-4 px-6 py-2 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-colors"
        >
          CREATE NEW PERSONA
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RealtimeSessionEngineProvider
        key={sessionKey}
        connectionOpts={{
          token: usageToken,
          config: {
            generative: {
              llm: "21892bb9-9809-4b6f-8c3e-e40093069f04",
              persona: personas[currentPersonaIndex]?.id,
              scenario: "43a9d484-dd12-4aad-9bbd-a8ad54a73fbb",
              voice_override: personas[currentPersonaIndex]?.voice,
              tool_definitions: ["27cd9fa6-4eec-404a-8c4d-0d98276f65d4"]
            },
            general: { save_messages: true },
            input: { interruptable: true, parallel_listening: true },
            output: {
              stream_transcript: true,
              speech_synthesis_enabled: true
            }
          },
        }}
      >
        <MinimalChat 
          personas={personas} 
          currentIndex={currentPersonaIndex}
          onPersonaChange={handlePersonaChange}
        />
      </RealtimeSessionEngineProvider>

      <div className="flex justify-center">
        <button
          onClick={onCreateNew}
          className="px-6 py-3 border-2 border-green-500 hover:bg-green-500/10 transition-colors"
        >
          CREATE NEW PERSONA
        </button>
      </div>
    </div>
  );
};