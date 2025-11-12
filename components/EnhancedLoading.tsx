import React, { useState, useEffect } from 'react';
import { getQuoteForContext } from '../utils/quotes';

interface EnhancedLoadingProps {
  context?: 'enhance' | 'humanize' | 'image' | 'speech' | 'general';
  timer?: number;
  message?: string;
}

const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({ 
  context = 'general', 
  timer = 0, 
  message 
}) => {
  const [quote, setQuote] = useState('');
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Set initial quote
    setQuote(getQuoteForContext(context as any));
    
    // Change quote every 3 seconds for longer operations
    const quoteInterval = setInterval(() => {
      setQuote(getQuoteForContext(context as any));
    }, 3000);

    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(dotsInterval);
    };
  }, [context]);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Spinner */}
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
      </div>

      {/* Main message */}
      {message && (
        <div className="text-lg font-medium text-gray-800 dark:text-gray-200 text-center">
          {message}{dots}
        </div>
      )}

      {/* Timer */}
      {timer > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {timer}s
        </div>
      )}

      {/* Productivity Quote */}
      <div className="max-w-md text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
          {quote}
        </p>
      </div>

      {/* Progress indication */}
      <div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default EnhancedLoading;