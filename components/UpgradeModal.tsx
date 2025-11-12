import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { CheckIcon, XMarkIcon } from './icons/Icons';
import { USAGE_LIMITS, PRICING } from '../constants';
import { UserPlan } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { upgradePlan } = useUser();
  const [step, setStep] = useState<'plans' | 'signin' | 'payment' | 'success'>('plans');

  useEffect(() => {
    if (isOpen) {
      setStep('plans'); // Reset to first step when opened
    }
  }, [isOpen]);

  const handleSelectPremium = () => {
    setStep('signin');
  };

  const handleSignIn = () => {
    // Simulate API call for sign-in
    setTimeout(() => {
        setStep('payment');
    }, 1500);
  };
  
  // FIX: Replaced flawed handlePayment call with a useEffect to trigger payment simulation when the step changes to 'payment'.
  useEffect(() => {
    if (step === 'payment') {
      // Simulate payment processing
      const timerId = setTimeout(() => {
        upgradePlan();
        setStep('success');
      }, 2000);
      
      // Cleanup timer if the component unmounts or the step changes before the timer fires
      return () => clearTimeout(timerId);
    }
  }, [step, upgradePlan]);
  
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md transform transition-all border border-gray-200/50 dark:border-gray-700/50" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 relative">
          <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 rounded-xl transition-all duration-200">
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          {step === 'plans' && (
            <div>
              {/* Header with urgency */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Unlock Unlimited AI Power 🚀
                </h2>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  ⏰ Limited time: Save 60% vs competitors
                </p>
              </div>

              {/* Value Proposition */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                  Why 10,000+ creators choose Premium:
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Save 4+ hours weekly</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Unlimited daily uses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">4x faster processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Priority AI access</span>
                  </div>
                </div>
              </div>

              {/* Pricing Comparison */}
              <div className="bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600 p-4 mb-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Premium Plan
                  </h3>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <span className="text-3xl font-bold text-gray-800 dark:text-white">
                      ${PRICING.PREMIUM_MONTHLY_USD}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Only ${PRICING.PREMIUM_DAILY_COST}/day • Cancel anytime
                  </p>
                </div>

                {/* ROI Calculator */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">ChatGPT Plus:</span>
                    <span className="text-gray-800 dark:text-white font-medium">$20/month</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Claude Pro:</span>
                    <span className="text-gray-800 dark:text-white font-medium">$20/month</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Separate image tools:</span>
                    <span className="text-gray-800 dark:text-white font-medium">$15/month</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-red-600 dark:text-red-400">Competitors total:</span>
                      <span className="text-red-600 dark:text-red-400">$55/month</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-green-600 dark:text-green-400">
                      <span>EnhanceAI Premium:</span>
                      <span>${PRICING.PREMIUM_MONTHLY_USD}/month</span>
                    </div>
                    <p className="text-center text-green-600 dark:text-green-400 font-bold text-lg mt-1">
                      Save ${55 - PRICING.PREMIUM_MONTHLY_USD}/month (78% off!)
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                onClick={handleSelectPremium} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Start Unlimited Access Now 🚀
              </button>

              {/* Trust indicators */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ✅ Cancel anytime • ✅ 30-day money-back guarantee
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Join 10,000+ creators saving 4+ hours weekly
                </p>
              </div>

              {/* Social proof */}
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                <p className="text-sm text-center text-yellow-800 dark:text-yellow-200">
                  🔥 <strong>Popular:</strong> 89% of users upgrade within their first week
                </p>
              </div>
            </div>
          )}

          {step === 'signin' && (
             <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Almost there!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Sign in to complete your purchase.</p>
                <button onClick={handleSignIn} className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                    <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-6.627 0-12-5.373-12-12h-8c0 6.627 5.373 12 12 12z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.426 44 30.65 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                    Sign in with Google
                </button>
             </div>
          )}

          {step === 'payment' && (
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Redirecting...</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Please wait while we redirect you to our secure payment gateway.</p>
                   <div className="flex justify-center items-center">
                       <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                   </div>
                   {/* This is where you would redirect or embed Stripe/etc. */}
                   {/* For this demo, we'll just move to success state */}
              </div>
          )}
          
          {step === 'success' && (
              <div className="text-center p-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckIcon />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4 mb-2">Success!</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Welcome to Premium! You can now enjoy all the benefits.</p>
                  <button onClick={handleClose} className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition">
                      Start Enhancing
                  </button>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;