import React, { useState, useEffect } from 'react';
import { enhancePrompt } from '../services/geminiService';
import { useUser } from '../hooks/useUser';
import AdBanner from './AdBanner';
import EnhancedLoading from './EnhancedLoading';
import { UserPlan } from '../types';
import { ClipboardDocumentIcon, CheckIcon } from './icons/Icons';


const PromptEnhancer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState(0);
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

  const handleEnhance = async () => {
    if (!prompt) {
      alert('Please enter a prompt to enhance.');
      return;
    }

    // Server-side validation and usage increment
    const canProceed = await validateAndIncrementUsage('enhance');
    if (!canProceed) return;

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
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          Prompt Enhancement
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Transform your ideas into powerful, detailed prompts that get better AI results
        </p>
      </div>
      
      {user.plan === UserPlan.FREE && <AdBanner />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Input Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300">
          <label htmlFor="prompt-input" className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
            Your Prompt
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a digital artwork of a futuristic city..."
            className="w-full min-h-[14rem] md:min-h-[16rem] p-4 bg-gray-50/80 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none text-sm md:text-base placeholder:text-gray-400 dark:placeholder:text-gray-500"
            disabled={isLoading}
          />
        </div>
        
        {/* Output Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Enhanced Prompt</h2>
            <button 
              onClick={handleCopyToClipboard} 
              disabled={!enhancedPrompt || isLoading} 
              className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
              title={copied ? "Copied!" : "Copy to clipboard"}
            >
              {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
            </button>
          </div>
          <div className="w-full min-h-[14rem] md:min-h-[16rem] p-4 bg-gray-50/80 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-2xl overflow-y-auto">
            {isLoading ? (
              <EnhancedLoading 
                context="enhance" 
                timer={timer}
                message="Enhancing your prompt"
              />
            ) : (
              <p className="whitespace-pre-wrap text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {enhancedPrompt || "Your enhanced prompt will appear here with improved detail and clarity."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pt-4 md:pt-6">
        <button
          onClick={handleEnhance}
          disabled={isLoading || !prompt}
          className="px-8 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-base rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Enhancing... ({timer}s)
            </span>
          ) : (
            'Enhance Prompt'
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptEnhancer;