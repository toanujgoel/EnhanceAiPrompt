
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, UserPlan } from '../types';
import { USAGE_LIMITS, SIGNUP_BONUS } from '../constants';
import { rateLimitService, RateLimitExceededError } from '../services/rateLimitService';

interface UserContextType {
  user: User;
  upgradePlan: () => void;
  signupUser: (email: string) => void;
  validateAndIncrementUsage: (tool: 'enhance' | 'humanize' | 'image' | 'speech') => Promise<boolean>;
  getRemainingUses: () => number;
  getTotalAvailableUses: () => number;
  getUsageUrgencyLevel: () => 'safe' | 'warning' | 'critical';
  refreshUsageFromServer: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    plan: UserPlan.ANONYMOUS,
    lifetimeBonus: 0,
    usage: {
      enhance: 0,
      humanize: 0,
      image: 0,
      speech: 0,
      date: getTodayDateString(),
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [serverUsage, setServerUsage] = useState({
    usage: 0,
    limit: USAGE_LIMITS[UserPlan.FREE],
    remaining: USAGE_LIMITS[UserPlan.FREE],
  });

  // Fetch current usage from server
  const refreshUsageFromServer = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // For localhost development, use local storage
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const localUsage = localStorage.getItem('dev_usage');
        const usage = localUsage ? JSON.parse(localUsage) : { count: 0, date: getTodayDateString() };
        
        // Reset if new day
        if (usage.date !== getTodayDateString()) {
          usage.count = 0;
          usage.date = getTodayDateString();
          localStorage.setItem('dev_usage', JSON.stringify(usage));
        }
        
        const limit = USAGE_LIMITS[user.plan] + user.lifetimeBonus;
        setServerUsage({
          usage: usage.count,
          limit: limit,
          remaining: Math.max(0, limit - usage.count),
        });
        
        console.log('Development mode: Using local storage for usage tracking');
        return;
      }
      
      // For production, use server API
      const status = await rateLimitService.getUsageStatus(user.plan);
      setServerUsage({
        usage: status.usage,
        limit: status.limit,
        remaining: status.remaining,
      });
      
      // Update local state to match server (for display purposes)
      setUser(prevUser => ({
        ...prevUser,
        usage: {
          ...prevUser.usage,
          // We can't map server usage back to individual tools,
          // so we'll use server total as a general indicator
          enhance: Math.floor(status.usage / 4), // Rough distribution
          humanize: Math.floor(status.usage / 4),
          image: Math.floor(status.usage / 4),
          speech: Math.floor(status.usage / 4),
          date: status.date,
        }
      }));
    } catch (error) {
      console.warn('Failed to fetch server usage, using local fallback:', error);
      // Set default values for development
      const limit = USAGE_LIMITS[user.plan] + user.lifetimeBonus;
      setServerUsage({
        usage: 0,
        limit: limit,
        remaining: limit,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user.plan]);
  

  const getRemainingUses = useCallback(() => {
    // Use server-side remaining count as the source of truth
    return serverUsage.remaining;
  }, [serverUsage.remaining]);

  const getTotalAvailableUses = useCallback(() => {
    const dailyLimit = USAGE_LIMITS[user.plan];
    const bonusUses = user.lifetimeBonus;
    return dailyLimit + bonusUses;
  }, [user.plan, user.lifetimeBonus]);

  const getUsageUrgencyLevel = useCallback((): 'safe' | 'warning' | 'critical' => {
    const remaining = getRemainingUses();
    const totalAvailable = getTotalAvailableUses();
    const usageRatio = 1 - (remaining / totalAvailable);
    
    if (usageRatio >= 0.9) return 'critical'; // 90%+ used
    if (usageRatio >= 0.6) return 'warning';  // 60%+ used
    return 'safe';
  }, [getRemainingUses, getTotalAvailableUses]);

  const signupUser = useCallback((email: string) => {
    setUser(prevUser => ({
      ...prevUser,
      plan: UserPlan.FREE,
      email,
      signupDate: new Date().toISOString(),
      lifetimeBonus: SIGNUP_BONUS,
    }));
    
    // Refresh usage with new plan and bonus
    refreshUsageFromServer();
  }, [refreshUsageFromServer]);


  const validateAndIncrementUsage = useCallback(async (tool: 'enhance' | 'humanize' | 'image' | 'speech'): Promise<boolean> => {
    try {
      // Validate and increment usage on server
      const response = await rateLimitService.checkAndIncrementUsage(tool, user.plan);
      
      // Update local state with server response immediately
      setServerUsage({
        usage: response.usage,
        limit: response.limit,
        remaining: response.remaining,
      });
      
      // Update local user state for display
      setUser(prevUser => ({
        ...prevUser,
        usage: {
          ...prevUser.usage,
          [tool]: prevUser.usage[tool] + 1,
          date: getTodayDateString(),
        }
      }));
      
      // Force a re-render of usage indicators
      return true;
    } catch (error) {
      if (error instanceof RateLimitExceededError) {
        // Show upgrade modal or limit exceeded message
        const timeUntilReset = error.getTimeUntilReset();
        const message = error.upgradeRequired 
          ? `Daily limit reached! Upgrade to Premium for unlimited access, or wait ${timeUntilReset} for reset.`
          : `Rate limit exceeded. Try again in ${timeUntilReset}.`;
        
        alert(message);
        
        // Update server usage state
        setServerUsage({
          usage: error.usage,
          limit: error.limit,
          remaining: 0,
        });
        
        return false;
      }
      
      console.error('Unexpected error validating usage:', error);
      
      // For development/localhost, allow the request to proceed with local fallback
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn('Rate limiting service unavailable in development, using local fallback');
        
        // Use local storage fallback for development
        const localUsage = localStorage.getItem('dev_usage');
        const usage = localUsage ? JSON.parse(localUsage) : { count: 0, date: getTodayDateString() };
        
        // Reset if new day
        if (usage.date !== getTodayDateString()) {
          usage.count = 0;
          usage.date = getTodayDateString();
        }
        
        // Check limit (including lifetime bonus)
        const limit = USAGE_LIMITS[user.plan] + user.lifetimeBonus;
        if (usage.count >= limit) {
          alert(`Development mode: Daily limit of ${limit} uses reached. This will be enforced server-side in production.`);
          return false;
        }
        
        // Increment usage
        usage.count++;
        localStorage.setItem('dev_usage', JSON.stringify(usage));
        
        // Update server usage state immediately
        setServerUsage({
          usage: usage.count,
          limit: USAGE_LIMITS[user.plan] + user.lifetimeBonus,
          remaining: Math.max(0, (USAGE_LIMITS[user.plan] + user.lifetimeBonus) - usage.count),
        });
        
        // Update local state
        setUser(prevUser => ({
          ...prevUser,
          usage: {
            ...prevUser.usage,
            [tool]: prevUser.usage[tool] + 1,
            date: getTodayDateString(),
          }
        }));
        
        return true;
      }
      
      // For production, show error and block request
      alert('Unable to verify usage limit. Please try again or contact support.');
      return false;
    }
  }, [user.plan]);


  const upgradePlan = () => {
    setUser(prevUser => ({
      ...prevUser,
      plan: UserPlan.PREMIUM,
    }));
    // Refresh usage with new plan
    refreshUsageFromServer();
  };

  // Load initial usage from server on mount
  useEffect(() => {
    refreshUsageFromServer();
  }, [refreshUsageFromServer]);

  // FIX: Replaced JSX with React.createElement because JSX syntax is not allowed in .ts files.
  return React.createElement(
    UserContext.Provider,
    { 
      value: { 
        user, 
        upgradePlan, 
        signupUser,
        validateAndIncrementUsage, 
        getRemainingUses, 
        getTotalAvailableUses,
        getUsageUrgencyLevel,
        refreshUsageFromServer, 
        isLoading 
      } 
    },
    children
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};