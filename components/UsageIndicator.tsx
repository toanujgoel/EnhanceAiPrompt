import React from 'react';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';
import { PRICING, SIGNUP_BONUS } from '../constants';

interface UsageIndicatorProps {
  onUpgradeClick: () => void;
  onSignupClick?: () => void;
}

const UsageIndicator: React.FC<UsageIndicatorProps> = ({ onUpgradeClick, onSignupClick }) => {
  const { user, getRemainingUses, getTotalAvailableUses, getUsageUrgencyLevel } = useUser();
  
  const remaining = getRemainingUses();
  const total = getTotalAvailableUses();
  const used = total - remaining;
  const urgencyLevel = getUsageUrgencyLevel();
  const percentage = total > 0 ? (used / total) * 100 : 0;

  // Color schemes based on urgency
  const getColorScheme = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200',
          bar: 'bg-red-500',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-700',
          text: 'text-amber-800 dark:text-amber-200',
          bar: 'bg-amber-500',
          button: 'bg-amber-600 hover:bg-amber-700'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-200',
          bar: 'bg-blue-500',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const colors = getColorScheme();

  // Get appropriate message based on user type and usage
  const getMessage = () => {
    if (user.plan === UserPlan.PREMIUM) {
      return {
        title: `${remaining} of ${total} uses remaining today`,
        subtitle: 'Premium - Unlimited daily access',
        cta: null
      };
    }

    if (user.plan === UserPlan.ANONYMOUS) {
      if (urgencyLevel === 'critical') {
        return {
          title: remaining === 0 ? 'Daily limit reached!' : `Last use today!`,
          subtitle: `Sign up free for ${SIGNUP_BONUS} bonus uses + daily reset`,
          cta: { text: 'Get 10 Free Bonus Uses', action: onSignupClick, primary: true }
        };
      } else if (urgencyLevel === 'warning') {
        return {
          title: `${remaining} uses remaining today`,
          subtitle: `Sign up free for ${SIGNUP_BONUS} bonus uses instantly`,
          cta: { text: 'Get Free Bonus Uses', action: onSignupClick, primary: false }
        };
      } else {
        return {
          title: `${remaining} of ${total} uses remaining today`,
          subtitle: 'Sign up free for bonus uses',
          cta: { text: 'Sign Up Free', action: onSignupClick, primary: false }
        };
      }
    }

    // FREE user with signup
    if (urgencyLevel === 'critical') {
      return {
        title: remaining === 0 ? 'Daily limit reached!' : `Last use today!`,
        subtitle: `Upgrade for unlimited access - only $${PRICING.PREMIUM_DAILY_COST}/day`,
        cta: { text: 'Upgrade to Premium', action: onUpgradeClick, primary: true }
      };
    } else if (urgencyLevel === 'warning') {
      return {
        title: `${remaining} uses remaining today`,
        subtitle: `Save 4+ hours weekly with unlimited AI tools`,
        cta: { text: 'Try Premium Free', action: onUpgradeClick, primary: false }
      };
    } else {
      return {
        title: `${remaining} of ${total} uses remaining`,
        subtitle: user.lifetimeBonus > 0 ? 'Including your signup bonus!' : 'Upgrade for unlimited access',
        cta: { text: 'See Premium Benefits', action: onUpgradeClick, primary: false }
      };
    }
  };

  const message = getMessage();

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 md:p-5 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-all duration-300">
      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Daily Usage
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100/60 dark:bg-gray-700/60 px-2 py-1 rounded-full">
              {used}/{total}
            </span>
          </div>
        </div>
        
        {/* Modern Progress Bar */}
        <div className="relative w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bar} relative`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
          </div>
        </div>
        
        {/* Usage Percentage */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {percentage.toFixed(0)}% used
          </span>
          {remaining > 0 && (
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {remaining} remaining
            </span>
          )}
        </div>
      </div>

      {/* Status Message */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            {message.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
            {message.subtitle}
          </p>
        </div>

        {/* Call-to-Action Button */}
        {message.cta && message.cta.action && (
          <button
            onClick={message.cta.action}
            className={`
              w-full px-4 py-2.5 rounded-xl font-semibold text-sm
              transition-all duration-200 transform hover:scale-105 active:scale-95
              ${message.cta.primary 
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40' 
                : 'bg-gray-600 hover:bg-gray-700 text-white shadow-md'
              }
              ${urgencyLevel === 'critical' ? 'animate-pulse' : ''}
            `}
          >
            {message.cta.text}
            {urgencyLevel === 'critical' && remaining === 0 && ' 🚀'}
          </button>
        )}
      </div>

      {/* Premium Value Props */}
      {user.plan !== UserPlan.PREMIUM && urgencyLevel === 'critical' && (
        <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">✨ Unlimited daily uses</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">$12/month</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">⚡ 4x faster processing</span>
              <span className="font-semibold text-green-600 dark:text-green-400">60% cheaper</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">🎯 Priority support</span>
              <span className="text-gray-500 dark:text-gray-400">Only $0.40/day</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageIndicator;