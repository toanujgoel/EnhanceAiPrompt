import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import AdBanner from './AdBanner';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';
import { PhotoIcon } from './icons/Icons';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const { user } = useUser();

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

  const handleGenerate = async () => {
    if (!prompt) {
      alert('Please enter a prompt to generate an image.');
      return;
    }
    setIsLoading(true);
    setImageUrl(null);
    try {
      const resultUrl = await generateImage(prompt);
      setImageUrl(resultUrl);
    } catch (error) {
      console.error(error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
       <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Image Generation Tool</h1>
        <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-400">Turn your imagination into stunning visuals with AI.</p>
      </div>

      {user.plan === UserPlan.FREE && <AdBanner />}

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A futuristic city skyline at sunset"
            className="flex-grow p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-md hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all"
          >
            {isLoading ? `Generating... (${timer}s)` : 'Generate'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg min-h-[400px] flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="w-full max-w-md text-center p-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
                <div className="bg-primary-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%', animation: 'loading-progress 2s ease-in-out infinite' }}></div>
            </div>
            <p className="mt-2 font-semibold">Generating your masterpiece... ({timer}s)</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This can take a moment.</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={prompt} className="max-w-full max-h-[512px] rounded-xl shadow-md" />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            <PhotoIcon className="mx-auto w-16 h-16 sm:w-24 sm:h-24 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-md sm:text-lg">Your generated image will appear here.</p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes loading-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ImageGenerator;