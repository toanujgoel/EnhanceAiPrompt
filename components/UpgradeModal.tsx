import React, { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { CheckIcon, XMarkIcon } from './icons/Icons';
import { USAGE_LIMITS } from '../constants';
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 relative">
          <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          {step === 'plans' && (
            <div>
              <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">Upgrade to Premium</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                  {/* Free Plan */}
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Free</h3>
                      <p className="text-2xl font-bold my-2">_</p>
                      <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                          <li>{USAGE_LIMITS[UserPlan.FREE]} daily uses</li>
                          <li>Ad-supported</li>
                          <li>Basic access</li>
                      </ul>
                  </div>
                  {/* Premium Plan */}
                  <div className="border-2 border-primary-500 rounded-lg p-4 bg-primary-50 dark:bg-primary-900/20">
                      <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">Premium</h3>
                      <p className="text-2xl font-bold my-2">$10/mo</p>
                      <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                          <li>{USAGE_LIMITS[UserPlan.PREMIUM]} daily uses</li>
                          <li>Ad-free experience</li>
                          <li>Priority access</li>
                      </ul>
                  </div>
              </div>
              <button onClick={handleSelectPremium} className="mt-6 w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-lg font-semibold shadow-md hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition">
                Choose Premium
              </button>
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
                       <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
