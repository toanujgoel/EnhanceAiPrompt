import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import AdBanner from './AdBanner';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';
import { PlayIcon, SpeakerWaveIcon } from './icons/Icons';

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
  const [voice, setVoice] = useState<'Kore' | 'Puck'>('Kore'); // Kore=Female, Puck=Male
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { user, incrementUsage } = useUser();

  useEffect(() => {
    let intervalId: number | undefined;
    if (isLoading) {
      setTimer(0);
      intervalId = window.setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  const handleGenerateSpeech = async () => {
    if (!text) {
      alert('Please enter text to generate speech.');
      return;
    }

    // Check usage limits for free users
    if (user.plan === UserPlan.FREE) {
      if (!incrementUsage('speech')) {
        return; // Usage limit reached, incrementUsage already shows alert
      }
    }
    
    setIsLoading(true);
    setAudioBuffer(null);

    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = audioContextRef.current;


    try {
      const base64Audio = await generateSpeech(text, voice);
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
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Text-to-Speech Tool</h1>
        <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-400">Convert text into high-quality, natural-sounding audio.</p>
      </div>

      {user.plan === UserPlan.FREE && <AdBanner />}

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <label htmlFor="tts-input" className="block text-md sm:text-lg font-semibold mb-3">Your Text</label>
        <textarea
          id="tts-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to convert to speech..."
          className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
          disabled={isLoading}
        />
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div role="radiogroup" className="flex items-center justify-center space-x-2 sm:space-x-4">
                <label className="cursor-pointer">
                    <input type="radio" name="voice" value="Kore" checked={voice === 'Kore'} onChange={() => setVoice('Kore')} className="sr-only peer" />
                    <div className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 peer-checked:bg-pink-500 peer-checked:text-white transition-colors duration-200">
                    Female
                    </div>
                </label>
                <label className="cursor-pointer">
                    <input type="radio" name="voice" value="Puck" checked={voice === 'Puck'} onChange={() => setVoice('Puck')} className="sr-only peer" />
                    <div className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 peer-checked:bg-blue-500 peer-checked:text-white transition-colors duration-200">
                    Male
                    </div>
                </label>
            </div>
            <button
            onClick={handleGenerateSpeech}
            disabled={isLoading || !text}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-md hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all"
            >
            {isLoading ? `Generating... (${timer}s)` : 'Generate Audio'}
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg min-h-[120px] flex items-center justify-center border border-gray-200 dark:border-gray-700">
        {isLoading ? (
            <div className="flex items-center space-x-3">
                <SpeakerWaveIcon className="w-8 h-8 text-primary-500 animate-pulse" />
                <span className="font-semibold">Generating audio... ({timer}s)</span>
            </div>
        ) : audioBuffer ? (
            <button onClick={playAudio} className="flex items-center px-8 py-3 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transform hover:scale-105 active:scale-95 transition-all">
                <PlayIcon />
                <span className="ml-2">Play Audio</span>
            </button>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <SpeakerWaveIcon className="mx-auto w-12 h-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-2">Your generated audio will be playable here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextToSpeech;