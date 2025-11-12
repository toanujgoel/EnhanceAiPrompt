import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { User, UserPlan } from '../types';
import { USAGE_LIMITS, SIGNUP_BONUS } from '../constants';
import { supabaseService } from '../services/supabaseService';

interface UserContextType {
  user: User;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  upgradePlan: () => void;
  signupUser: (email: string, password: string) => Promise<void>;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  validateAndIncrementUsage: (tool: 'enhance' | 'humanize' | 'image' | 'speech') => Promise<boolean>;
  getRemainingUses: () => number;
  getTotalAvailableUses: () => number;
  getUsageUrgencyLevel: () => 'safe' | 'warning' | 'critical';
  refreshUsageFromServer: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const getTodayDateString = () => new Date().toISOString().split('T')[0];

// Helper to get client IP (fallback for anonymous users)
const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    // Fallback to a browser fingerprint
    return `fp_${navigator.userAgent.slice(0, 50)}`;
  }
};

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
  
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await supabaseService.getSession();
        if (session?.user) {
          setAuthUser(session.user);
          setIsAuthenticated(true);
          
          // Load user profile from Supabase
          const profile = await supabaseService.getUserProfile(session.user.id);
          if (profile) {
            setUser({
              plan: profile.plan,
              email: profile.email,
              lifetimeBonus: profile.bonusUses,
              usage: {
                enhance: 0,
                humanize: 0,
                image: 0,
                speech: 0,
                date: getTodayDateString(),
              },
              signupDate: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabaseService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthUser(session.user);
        setIsAuthenticated(true);
        
        const profile = await supabaseService.getUserProfile(session.user.id);
        if (profile) {
          setUser({
            plan: profile.plan,
            email: profile.email,
            lifetimeBonus: profile.bonusUses,
            usage: {
              enhance: 0,
              humanize: 0,
              image: 0,
              speech: 0,
              date: getTodayDateString(),
            },
            signupDate: new Date().toISOString(),
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setIsAuthenticated(false);
        setUser({
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
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh usage from appropriate source (Supabase or IP-based)
  const refreshUsageFromServer = useCallback(async () => {
    try {
      setIsLoading(true);

      if (isAuthenticated && authUser) {
        // Authenticated user: use Supabase
        const profile = await supabaseService.getUserProfile(authUser.id);
        if (profile) {
          const totalUsed = profile.dailyUses;
          const dailyLimit = USAGE_LIMITS[profile.plan];
          const bonusUses = profile.bonusUses;
          const totalAvailable = dailyLimit + bonusUses;
          
          setUser(prevUser => ({
            ...prevUser,
            plan: profile.plan,
            lifetimeBonus: bonusUses,
            usage: {
              ...prevUser.usage,
              enhance: Math.floor(totalUsed / 4),
              humanize: Math.floor(totalUsed / 4),
              image: Math.floor(totalUsed / 4),
              speech: Math.floor(totalUsed / 4),
              date: getTodayDateString(),
            }
          }));
        }
      } else {
        // Anonymous user: use IP-based tracking from Supabase
        const ip = await getClientIP();
        const anonymousUsage = await supabaseService.getAnonymousUsage(ip);
        
        setUser(prevUser => ({
          ...prevUser,
          plan: UserPlan.ANONYMOUS,
          lifetimeBonus: 0,
          usage: {
            enhance: Math.floor(anonymousUsage / 4),
            humanize: Math.floor(anonymousUsage / 4),
            image: Math.floor(anonymousUsage / 4),
            speech: Math.floor(anonymousUsage / 4),
            date: getTodayDateString(),
          }
        }));
      }
    } catch (error) {
      console.error('Error refreshing usage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authUser]);

  // Get remaining uses based on user type
  const getRemainingUses = useCallback(() => {
    if (isAuthenticated && authUser) {
      // Authenticated: daily limit + bonus - used
      const dailyLimit = USAGE_LIMITS[user.plan];
      const totalAvailable = dailyLimit + user.lifetimeBonus;
      const totalUsed = user.usage.enhance + user.usage.humanize + user.usage.image + user.usage.speech;
      return Math.max(0, totalAvailable - totalUsed);
    } else {
      // Anonymous: 5 per day from IP tracking
      const totalUsed = user.usage.enhance + user.usage.humanize + user.usage.image + user.usage.speech;
      return Math.max(0, USAGE_LIMITS[UserPlan.ANONYMOUS] - totalUsed);
    }
  }, [isAuthenticated, authUser, user]);

  const getTotalAvailableUses = useCallback(() => {
    if (isAuthenticated) {
      return USAGE_LIMITS[user.plan] + user.lifetimeBonus;
    }
    return USAGE_LIMITS[UserPlan.ANONYMOUS];
  }, [isAuthenticated, user.plan, user.lifetimeBonus]);

  const getUsageUrgencyLevel = useCallback((): 'safe' | 'warning' | 'critical' => {
    const remaining = getRemainingUses();
    const totalAvailable = getTotalAvailableUses();
    const usageRatio = 1 - (remaining / totalAvailable);
    
    if (usageRatio >= 0.9) return 'critical';
    if (usageRatio >= 0.6) return 'warning';
    return 'safe';
  }, [getRemainingUses, getTotalAvailableUses]);

  // Signup user with Supabase
  const signupUser = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: newUser, error } = await supabaseService.signUp(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (newUser) {
        alert('Signup successful! Please check your email to verify your account.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      alert(`Signup failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login user with Supabase
  const loginUser = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: loggedInUser, error } = await supabaseService.signIn(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (loggedInUser) {
        // Auth state will be updated by the listener
        await refreshUsageFromServer();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUsageFromServer]);

  // Logout user
  const logoutUser = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabaseService.signOut();
      // Auth state will be updated by the listener
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate and increment usage (hybrid approach)
  const validateAndIncrementUsage = useCallback(async (
    tool: 'enhance' | 'humanize' | 'image' | 'speech'
  ): Promise<boolean> => {
    try {
      if (isAuthenticated && authUser) {
        // Authenticated user: use Supabase tracking
        const canUse = await supabaseService.incrementDailyUsage(authUser.id);
        
        if (!canUse) {
          alert('Daily limit reached! Upgrade to Premium for unlimited access.');
          return false;
        }
        
        // Log the usage
        await supabaseService.logUsage(authUser.id, tool);
        
        // Update local state
        setUser(prevUser => ({
          ...prevUser,
          usage: {
            ...prevUser.usage,
            [tool]: prevUser.usage[tool] + 1,
          }
        }));
        
        return true;
      } else {
        // Anonymous user: use IP-based tracking via Supabase
        const ip = await getClientIP();
        const canUse = await supabaseService.incrementAnonymousUsage(ip, tool);
        
        if (!canUse) {
          alert('Daily limit of 5 uses reached! Sign up for free to get 5 more uses + 10 bonus uses.');
          return false;
        }
        
        // Update local state
        setUser(prevUser => ({
          ...prevUser,
          usage: {
            ...prevUser.usage,
            [tool]: prevUser.usage[tool] + 1,
          }
        }));
        
        return true;
      }
    } catch (error) {
      console.error('Error validating usage:', error);
      alert('Unable to verify usage limit. Please try again.');
      return false;
    }
  }, [isAuthenticated, authUser]);

  const upgradePlan = () => {
    // TODO: Implement Stripe integration
    alert('Premium upgrade coming soon!');
  };

  // Load initial usage on mount
  useEffect(() => {
    if (!isLoading) {
      refreshUsageFromServer();
    }
  }, [isLoading, refreshUsageFromServer]);

  return (
    <UserContext.Provider
      value={{
        user,
        authUser,
        isAuthenticated,
        isLoading,
        upgradePlan,
        signupUser,
        loginUser,
        logoutUser,
        validateAndIncrementUsage,
        getRemainingUses,
        getTotalAvailableUses,
        getUsageUrgencyLevel,
        refreshUsageFromServer,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
