
import React, { useState, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import AdBanner from './AdBanner';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';
import { ArrowPathIcon, PlayIcon, SpeakerWaveIcon } from './icons/Icons';

// Helper function to decode base64 string to Uint8Array
const decode = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper function to decode raw PCM audio data into an AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { user } = useUser();

  const handleGenerateSpeech = async () => {
    if (!text) {
      alert('Please enter text to generate speech.');
      return;
    }
    
    setIsLoading(true);
    setAudioBuffer(null);

    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = audioContextRef.current;


    try {
      const base64Audio = await generateSpeech(text);
      const decodedAudio = decode(base64Audio);
      const buffer = await decodeAudioData(decodedAudio, audioContext, 24000, 1);
      setAudioBuffer(buffer);
    } catch (error) {
      console.error(error);
      alert('Failed to generate speech.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const playAudio = () => {
    if (audioBuffer && audioContextRef.current) {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
    }
  };


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Text-to-Speech Tool</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Convert text into high-quality, natural-sounding audio.</p>
      </div>

      {user.plan === UserPlan.FREE && <AdBanner />}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <label htmlFor="tts-input" className="block text-lg font-semibold mb-2">Your Text</label>
        <textarea
          id="tts-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
          disabled={isLoading}
        />
         <button
          onClick={handleGenerateSpeech}
          disabled={isLoading || !text}
          className="mt-4 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? 'Generating Audio...' : 'Generate Audio'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg min-h-[100px] flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <ArrowPathIcon className="animate-spin mx-auto" />
            <p className="mt-2">Generating audio...</p>
          </div>
        ) : audioBuffer ? (
            <button onClick={playAudio} className="flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors">
                <PlayIcon />
                <span className="ml-2">Play Audio</span>
            </button>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <SpeakerWaveIcon className="mx-auto" />
            <p className="mt-2">Your generated audio will be playable here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToSpeech;
