import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { SIGNUP_BONUS } from '../constants';
import { XMarkIcon, CheckIcon } from './icons/Icons';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const { signupUser } = useUser();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      signupUser(email);
      setShowSuccess(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
        setEmail('');
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            Get {SIGNUP_BONUS} Free Bonus Uses! 🎉
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Welcome aboard! 🚀
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              You now have {SIGNUP_BONUS} bonus uses + 5 daily uses!
            </p>
          </div>
        ) : (
          <div className="px-6 pb-6">
            {/* Benefits */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
                Free Account Benefits:
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-900/20 border border-blue-200/30 dark:border-blue-700/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">+{SIGNUP_BONUS}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {SIGNUP_BONUS} Lifetime Bonus Uses
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Never expires, use anytime
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-3 rounded-2xl bg-green-50/60 dark:bg-green-900/20 border border-green-200/30 dark:border-green-700/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">5</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      5 Daily Uses (Refreshes Daily)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Consistent daily access
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-900/20 border border-purple-200/30 dark:border-purple-700/30">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">✨</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      Access to All AI Tools
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Prompts, humanizer, images, speech
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700/50 dark:text-white bg-gray-50/50 transition-all duration-200 text-sm"
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={!email || isLoading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  `Get My ${SIGNUP_BONUS} Free Uses! 🚀`
                )}
              </button>
            </form>

            {/* Trust Indicators */}
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  ✅ No credit card required • ✅ Cancel anytime • ✅ Email updates only
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Join 10,000+ creators using AI tools daily
                </p>
              </div>
            </div>

            {/* Premium Teaser */}
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-2xl border border-yellow-200/50 dark:border-yellow-700/30">
              <p className="text-sm text-center text-yellow-800 dark:text-yellow-200 leading-relaxed">
                💡 <strong>Pro Tip:</strong> Need unlimited uses? Premium is only $0.40/day
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupModal;