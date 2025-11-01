
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, UserPlan } from '../types';
import { USAGE_LIMITS } from '../constants';

interface UserContextType {
  user: User;
  upgradePlan: () => void;
  incrementUsage: (tool: 'enhance' | 'humanize') => boolean;
  getRemainingUses: () => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    plan: UserPlan.FREE,
    usage: {
      enhance: 0,
      humanize: 0,
      date: getTodayDateString(),
    },
  });

  const checkAndResetUsage = useCallback(() => {
    const today = getTodayDateString();
    if (user.usage.date !== today) {
      setUser(prevUser => ({
        ...prevUser,
        usage: { enhance: 0, humanize: 0, date: today },
      }));
      return { enhance: 0, humanize: 0 };
    }
    return user.usage;
  }, [user.usage]);
  

  const getRemainingUses = useCallback(() => {
    const currentUsage = checkAndResetUsage();
    const limit = USAGE_LIMITS[user.plan];
    const totalUsed = currentUsage.enhance + currentUsage.humanize;
    return Math.max(0, limit - totalUsed);
  }, [user.plan, checkAndResetUsage]);


  const incrementUsage = useCallback((tool: 'enhance' | 'humanize'): boolean => {
    const remaining = getRemainingUses();
    if (remaining <= 0) {
      alert(`You have reached your daily limit of ${USAGE_LIMITS[user.plan]} uses.`);
      return false;
    }

    setUser(prevUser => {
        const today = getTodayDateString();
        // Double check for date reset inside the setter to handle state updates
        const usage = prevUser.usage.date === today ? prevUser.usage : { enhance: 0, humanize: 0, date: today };
        return {
            ...prevUser,
            usage: {
                ...usage,
                [tool]: usage[tool] + 1,
            }
        };
    });
    return true;
  }, [getRemainingUses, user.plan]);


  const upgradePlan = () => {
    setUser(prevUser => ({
      ...prevUser,
      plan: UserPlan.PREMIUM,
    }));
  };

  // FIX: Replaced JSX with React.createElement because JSX syntax is not allowed in .ts files.
  return React.createElement(
    UserContext.Provider,
    { value: { user, upgradePlan, incrementUsage, getRemainingUses } },
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