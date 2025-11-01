
import React, { useState } from 'react';
import { enhancePrompt } from '../services/geminiService';
import { useUser } from '../hooks/useUser';
import AdBanner from './AdBanner';
import { UserPlan } from '../types';
import { ArrowPathIcon, ClipboardDocumentIcon } from './icons/Icons';

const PromptEnhancer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, incrementUsage } = useUser();

  const handleEnhance = async () => {
    if (!prompt) {
      alert('Please enter a prompt to enhance.');
      return;
    }

    if (!incrementUsage('enhance')) return;

    setIsLoading(true);
    setEnhancedPrompt('');
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
            alert('Copied to clipboard!');
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy.');
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Prompt Enhancement Tool</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Refine your ideas into powerful, detailed prompts for any AI model.</p>
      </div>
      
      {user.plan === UserPlan.FREE && <AdBanner />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <label htmlFor="prompt-input" className="block text-lg font-semibold mb-2">Your Prompt</label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., a cat wearing a hat"
            className="w-full h-48 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            disabled={isLoading}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Enhanced Prompt</h2>
              <button onClick={handleCopyToClipboard} disabled={!enhancedPrompt || isLoading} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  <ClipboardDocumentIcon />
              </button>
          </div>
          <div className="w-full h-48 p-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <ArrowPathIcon className="animate-spin" />
                <span className="ml-2">Enhancing...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{enhancedPrompt || "The enhanced prompt will appear here."}</p>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleEnhance}
          disabled={isLoading || !prompt}
          className="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isLoading ? 'Enhancing...' : 'Enhance Prompt'}
        </button>
      </div>
    </div>
  );
};

export default PromptEnhancer;
