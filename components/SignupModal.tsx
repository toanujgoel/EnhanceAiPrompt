import React, { useState } from 'react';
import { useUser } from '../hooks/useUser.tsx';
import { SIGNUP_BONUS } from '../constants';
import { XMarkIcon, CheckIcon } from './icons/Icons';
import { supabaseService } from '../services/supabaseService';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const { signupUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setError('');
    
    try {
      await signupUser(email, password);
      setShowSuccess(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
        setEmail('');
        setPassword('');
      }, 3000);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError('');
      const { error } = await supabaseService.signInWithGoogle();
      if (error) {
        setError(error.message || 'Google sign-up failed');
      }
      // Google OAuth will redirect, so we don't need to close modal here
    } catch (error: any) {
      setError(error.message || 'Google sign-up failed');
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
              Check Your Email! �
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We've sent you a confirmation link. Click it to activate your account and get {SIGNUP_BONUS} bonus uses + 5 daily uses!
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
              {error && (
                <div className="mb-4 p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-700/30 rounded-2xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              
              <div className="mb-4">
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

              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700/50 dark:text-white bg-gray-50/50 transition-all duration-200 text-sm"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={!email || !password || isLoading}
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

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Sign up with Google
              </span>
            </button>

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