import { GoogleGenAI, GenerateContentResponse, Modality, Chat } from "@google/genai";
import { MODEL_NAMES } from '../constants';
import { ChatMessage } from "../types";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
let chatInstance: Chat | null = null;

const getChatInstance = () => {
  if(!chatInstance) {
     chatInstance = ai.chats.create({
        model: MODEL_NAMES.CHAT,
        config: {
            systemInstruction: `You are a helpful and friendly AI Assistant for EnhanceAiPrompt.com. Your purpose is to guide users and answer questions about our suite of tools. The tools include: 
- A 'Prompt Enhancer' to improve AI prompts.
- A 'Content Humanizer' to make text sound more natural.
- An 'Image Generator' to create visuals from text.
- A 'Text-to-Speech' tool to convert text to audio.
- A 'Record Your Thoughts' tool for voice-to-text transcription.
- A 'Blog' with articles on AI and technology.
Answer user questions about these tools clearly and concisely.`,
        }
     });
  }
  return chatInstance;
}


export const enhancePrompt = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: MODEL_NAMES.ENHANCER,
        contents: `Enhance this prompt to be more descriptive, effective, and detailed for an AI model. Return only the enhanced prompt, without any introductory text. Original prompt: "${prompt}"`,
        config: {
            systemInstruction: "You are an AI prompt engineering expert. Your task is to rewrite user prompts to maximize clarity and effectiveness for generative AI models."
        }
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return "Error: Could not enhance the prompt.";
  }
};

export const humanizeContent = async (content: string): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
        model: MODEL_NAMES.HUMANIZER,
        contents: `Rewrite the following AI-generated text to sound more human, natural, and engaging. Avoid jargon and robotic phrasing. Original text: "${content}"`,
        config: {
            systemInstruction: "You are a skilled editor specializing in making AI-generated text sound like it was written by a human. Focus on flow, tone, and natural language."
        }
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error humanizing content:', error);
    return "Error: Could not humanize the content.";
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: MODEL_NAMES.IMAGE_GENERATION,
            prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '1:1',
                outputMimeType: 'image/png'
            }
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64Image = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64Image}`;
        }
        return "";
    } catch (error) {
        console.error('Error generating image:', error);
        throw new Error("Failed to generate image.");
    }
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<{ text: string; sources: any[] }> => {
    try {
        const needsGrounding = /latest|current|recent|who won|news about/.test(newMessage.toLowerCase());

        if (needsGrounding) {
             const response: GenerateContentResponse = await ai.models.generateContent({
                model: MODEL_NAMES.CHAT_GROUNDED,
                contents: newMessage,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            });
            const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            return { text: response.text, sources };

        } else {
            const chat = getChatInstance();
            const response: GenerateContentResponse = await chat.sendMessage({ message: newMessage });
            return { text: response.text, sources: [] };
        }
    } catch (error) {
        console.error('Error in chat:', error);
        return { text: "Sorry, I encountered an error. Please try again.", sources: [] };
    }
};


export const generateSpeech = async (text: string, voice: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAMES.TTS,
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error('Error generating speech:', error);
        throw new Error("Failed to generate speech.");
    }
};