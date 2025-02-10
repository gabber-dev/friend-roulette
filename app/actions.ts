"use server"
import axios from "axios";

export const generateUserToken = async () => {
    const response = await axios.post('https://api.gabber.dev/v1/usage/token', {
        human_id: crypto.randomUUID(),
        limits: [
            { type: 'conversational_seconds', value: 500 },
            { type: 'voice_synthesis_seconds', value: 1000 }
        ]
    }, {
        headers: {
            'X-api-key': `${process.env.GABBER_API_KEY}`
        }
    });

    return response.data;
};


export const updateSessionPersona = async (
  sessionId: string, 
  personaId: string, 
  voiceId: string, 
  toolId: string
) => {
    // Log input parameters
    console.log('updateSessionPersona called with:', {
        sessionId,
        personaId,
        voiceId,
        toolId
    });

    // Validate all UUIDs
    if (!sessionId?.trim() || !personaId?.trim()) {
      throw new Error('Session ID and Persona ID are required');
    }

    // Ensure we have default values for optional UUIDs
    const defaultVoiceId = "21892bb9-9809-4b6f-8c3e-e40093069f04";
    const defaultToolId = "43a9d484-dd12-4aad-9bbd-a8ad54a73fbb";
    const personaSwitchingToolId = "27cd9fa6-4eec-404a-8c4d-0d98276f65d4";

    const updateData = {
        general: {
            save_messages: true
        },
        input: {
            interruptable: true,
            parallel_listening: false
        },
        generative: {
            llm: "21892bb9-9809-4b6f-8c3e-e40093069f04",
            persona: personaId.trim(),
            voice_override: voiceId?.trim() || defaultVoiceId,
            scenario: toolId?.trim() || defaultToolId,
            tool_definitions: [
                toolId?.trim() || defaultToolId,
                personaSwitchingToolId
            ]
        },
        output: {
            stream_transcript: true,
            speech_synthesis_enabled: true
        }
    };

    try {
        // Log request details
        console.log('Making request to Gabber API:', {
            url: `https://api.gabber.dev/v1/realtime/${sessionId.trim()}/update`,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-api-key': process.env.GABBER_API_KEY ? '[PRESENT]' : '[MISSING]'
            },
            data: updateData
        });

        const response = await axios.post(
            `https://api.gabber.dev/v1/realtime/${sessionId.trim()}/update`,
            updateData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'x-api-key': `${process.env.GABBER_API_KEY}`
                }
            }
        );

        // Log successful response
        console.log('Gabber API response:', {
            status: response.status,
            data: response.data
        });

        return response.data;
    } catch (error) {
        // Enhanced error logging
        if (axios.isAxiosError(error)) {
            console.error('Axios error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                responseData: error.response?.data,
                requestURL: error.config?.url,
                requestHeaders: error.config?.headers
            });
        } else {
            console.error('Non-Axios error:', error);
        }
        throw error;
    }
};