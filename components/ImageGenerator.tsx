
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import AdBanner from './AdBanner';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';
import { ArrowPathIcon, PhotoIcon } from './icons/Icons';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Image Generation Tool</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Turn your imagination into stunning visuals with AI.</p>
      </div>

      {user.plan === UserPlan.FREE && <AdBanner />}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A futuristic city skyline at sunset, cyberpunk style"
            className="flex-grow p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg min-h-[400px] flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <ArrowPathIcon className="animate-spin mx-auto" />
            <p className="mt-2">Generating your masterpiece...</p>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={prompt} className="max-w-full max-h-[512px] rounded-lg shadow-md" />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <PhotoIcon className="mx-auto" />
            <p className="mt-2">Your generated image will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
