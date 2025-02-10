"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "gabber-client-react";
import { Loader2, Upload } from "lucide-react";

interface PersonaFormData {
  name: string;
  description: string;
  gender: "male" | "female";
  voiceId: string;
  imageUrl: string;
}

interface Voice {
  id: string;
  name: string;
}

export const PersonaCreator = ({ onComplete }: { onComplete: () => void }) => {
  const { api } = useApi();
  const [formData, setFormData] = useState<PersonaFormData>({
    name: "",
    description: "",
    gender: "male",
    voiceId: "",
    imageUrl: ""
  });

  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        setIsLoadingVoices(true);
        const response = await api.voice.listVoices();
        setVoices(response.data.values || []);
      } catch (err) {
        console.error("Error fetching voices:", err);
      } finally {
        setIsLoadingVoices(false);
      }
    };

    fetchVoices();
  }, [api]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "voice") {
      const foundVoice = voices.find((voice) => voice.id === value);
      if (foundVoice) {
        setSelectedVoice(foundVoice);
        setFormData((prev) => ({ ...prev, voiceId: foundVoice.id }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.persona.createPersona({
        name: formData.name,
        description: formData.description,
        voice: formData.voiceId,
        image_url: formData.imageUrl,
      });
      onComplete();
    } catch (error) {
      console.error('Error creating persona:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">NAME:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-500 p-2 text-green-500 focus:outline-none focus:border-green-400"
            required
          />
        </div>

        <div>
          <label className="block mb-2">DESCRIPTION:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full bg-black border-2 border-green-500 p-2 text-green-500 focus:outline-none focus:border-green-400"
            placeholder="You are a... (e.g. a t-rex named Steve, a venture capitalist, a silly dinosaur, etc.)"
            required
          />
        </div>

        <div>
          <label className="block mb-2">GENDER:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-500 p-2 text-green-500 focus:outline-none focus:border-green-400"
          >
            <option value="male">MALE</option>
            <option value="female">FEMALE</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">VOICE:</label>
          {isLoadingVoices ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>LOADING VOICES...</span>
            </div>
          ) : (
            <select
              name="voice"
              value={formData.voiceId}
              onChange={handleChange}
              className="w-full bg-black border-2 border-green-500 p-2 text-green-500 focus:outline-none focus:border-green-400"
              required
            >
              <option value="">SELECT VOICE</option>
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block mb-2">IMAGE URL:</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full bg-black border-2 border-green-500 p-2 text-green-500 focus:outline-none focus:border-green-400"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {formData.imageUrl && (
          <div className="border-2 border-green-500 p-2">
            <img 
              src={formData.imageUrl} 
              alt="Persona preview" 
              className="max-h-48 mx-auto object-contain"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 border-2 border-green-500 hover:bg-green-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              CREATING...
            </div>
          ) : (
            'CREATE PERSONA'
          )}
        </button>
      </form>
    </div>
  );
};