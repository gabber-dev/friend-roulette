"use client";

import { useState, useEffect } from 'react';
import { ApiProvider } from 'gabber-client-react';
import { PersonaSelector } from '@/components/PersonaSelector';
import { PersonaCreator } from '@/components/PersonaCreator';
import { Terminal } from 'lucide-react';
import { generateUserToken } from './actions';

export default function Home() {
  const [showCreator, setShowCreator] = useState(false);
  const [usageToken, setUsageToken] = useState('');

  useEffect(() => {
    const initialize = async () => {
      try {
        // Then get the usage token
        const { token } = await generateUserToken();
        setUsageToken(token);
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };

    initialize();
  }, []);

  return (
    <ApiProvider usageToken={usageToken}>
      <main className="min-h-screen bg-black text-green-500 p-8 font-mono">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-2 border-green-500 p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Terminal className="w-8 h-8" />
              <h1 className="text-4xl font-bold tracking-tight text-center">PERSONA.SYS</h1>
            </div>
            <div className="text-center text-sm">
              <p>GABBER INTERFACE v2.0</p>
              <p>© 2025 - ALL RIGHTS RESERVED</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="border-2 border-green-500 p-6">
            <div className="mb-4 text-center">
              <div className="inline-block border-b-2 border-green-500 pb-2">
                {showCreator ? 'CREATE NEW PERSONA' : 'SELECT PERSONA'}
              </div>
            </div>

            <div className="retro-terminal">
              {showCreator ? (
                <PersonaCreator usageToken={usageToken} onComplete={() => setShowCreator(false)} />
              ) : (
                <PersonaSelector 
                  usageToken={usageToken} 
                  onCreateNew={() => setShowCreator(true)}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </ApiProvider>
  );
}