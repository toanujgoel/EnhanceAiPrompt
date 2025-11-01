import React, { useState, useEffect } from 'react';
import { enhancePrompt } from '../services/geminiService';
import { useUser } from '../hooks/useUser';
import AdBanner from './AdBanner';
import { UserPlan } from '../types';
import { ClipboardDocumentIcon, CheckIcon } from './icons/Icons';

const SkeletonLoader = () => (
    <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
);


const PromptEnhancer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState(0);
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

  const handleEnhance = async () => {
    if (!prompt) {
      alert('Please enter a prompt to enhance.');
      return;
    }

    if (!incrementUsage('enhance')) return;

    setIsLoading(true);
    setEnhancedPrompt('');
    setCopied(false);
    try {
      const result = await enhancePrompt(prompt);
      setEnhancedPrompt(result);
    } catch (error) {
      console.error(error);
      setEnhancedPrompt('Failed to enhance prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (enhancedPrompt) {
        navigator.clipboard.writeText(enhancedPrompt).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy.');
        });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Prompt Enhancement Tool</h1>
        <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-400">Refine your ideas into powerful, detailed prompts for any AI model.</p>
      </div>
      
      {user.plan === UserPlan.FREE && <AdBanner />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <label htmlFor="prompt-input" className="block text-md sm:text-lg font-semibold mb-3 text-gray-800 dark:text-white">Your Prompt</label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a cat wearing a hat"
            className="w-full min-h-[16rem] p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200"
            disabled={isLoading}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
              <h2 className="text-md sm:text-lg font-semibold text-gray-800 dark:text-white">Enhanced Prompt</h2>
              <button onClick={handleCopyToClipboard} disabled={!enhancedPrompt || isLoading} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  {copied ? <CheckIcon /> : <ClipboardDocumentIcon />}
              </button>
          </div>
          <div className="w-full min-h-[16rem] p-4 bg-gray-100 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-xl overflow-y-auto">
            {isLoading ? <SkeletonLoader /> : (
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{enhancedPrompt || "The enhanced prompt will appear here."}</p>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pt-2 md:pt-4">
        <button
          onClick={handleEnhance}
          disabled={isLoading || !prompt}
          className="px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all duration-300"
        >
          {isLoading ? `Enhancing... (${timer}s)` : 'Enhance Prompt'}
        </button>
      </div>
    </div>
  );
};

export default PromptEnhancer;