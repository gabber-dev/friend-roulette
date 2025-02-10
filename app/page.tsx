"use client";

import { useState, useEffect } from 'react';
import { ApiProvider } from 'gabber-client-react';
import { PersonaSelector } from '@/components/PersonaSelector';
import { PersonaCreator } from '@/components/PersonaCreator';
import { Terminal, Phone } from 'lucide-react';
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
              <h1 className="text-4xl font-bold tracking-tight text-center">FRIEND ROULETTE</h1>
            </div>
            <div className="text-center text-sm">
              <p>BUILT WITH GABBER.DEV</p>
              <p>STEAL THE CODE FOR THIS:</p>
              <p><a href="https://github.com/gabber-dev/friend-roulette" target="_blank" rel="noopener noreferrer">github.com/gabber-dev/friend-roulette</a></p>
              <p>© 2025 - ALL RIGHTS RESERVED</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                <p>CALL ME: +1 213-577-2355</p>
              </div>
              <p className="mt-2 text-xs text-green-500/70">
                [SAY &quot;CAN I TALK TO SOMEONE ELSE?&quot; (or hit the arrows)]
              </p>
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