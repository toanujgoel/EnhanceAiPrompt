import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import AdBanner from './AdBanner';
import EnhancedLoading from './EnhancedLoading';
import SignupModal from './SignupModal';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';
import { PhotoIcon, LockClosedIcon } from './icons/Icons';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, validateAndIncrementUsage } = useUser();

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

    // Check if user is signed up (not anonymous)
    if (user.plan === UserPlan.ANONYMOUS) {
      alert('Image generation requires a free account. Please sign up to continue!');
      return;
    }

    // Server-side validation and usage increment
    const canProceed = await validateAndIncrementUsage('image');
    if (!canProceed) return;

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
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          AI Image Generator
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Transform your ideas into stunning visuals with advanced AI technology
        </p>
      </div>

      {user.plan === UserPlan.FREE && <AdBanner />}

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="flex-grow p-3 md:p-4 bg-gray-50/80 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm md:text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="px-6 md:px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                <span className="hidden sm:inline">Generating... ({timer}s)</span>
                <span className="sm:hidden">Gen... ({timer}s)</span>
              </span>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 min-h-[350px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
        {user.plan === UserPlan.ANONYMOUS ? (
          <div className="text-center p-6 md:p-8 max-w-md">
            <LockClosedIcon className="mx-auto w-12 h-12 md:w-16 md:h-16 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Unlock AI Image Generation
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Create stunning images with AI. Sign up now to get <span className="font-semibold text-primary-600">15 total daily uses</span> and access all premium features!
            </p>
            <button
              onClick={() => setShowSignupModal(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Get Started Free
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              No credit card required • Instant access
            </p>
          </div>
        ) : isLoading ? (
          <EnhancedLoading 
            message="Creating your masterpiece..." 
            context="image-generation"
            showTimer={true}
            timer={timer}
          />
        ) : imageUrl ? (
          <img src={imageUrl} alt={prompt} className="max-w-full max-h-[512px] rounded-xl shadow-md" />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            <PhotoIcon className="mx-auto w-16 h-16 sm:w-24 sm:h-24 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-md sm:text-lg">Your generated image will appear here.</p>
          </div>
        )}
      </div>

      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
      />
    </div>
  );
};

export default ImageGenerator;