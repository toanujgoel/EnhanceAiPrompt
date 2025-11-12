import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserPlan } from '../types';

export interface AppUser {
  id: string;
  email: string;
  plan: UserPlan;
  bonusUses: number;
  dailyUses: number;
  lastResetDate: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface UsageLog {
  id: string;
  userId: string;
  toolType: 'enhance' | 'humanize' | 'image' | 'speech';
  createdAt: string;
}

class SupabaseService {
  // ==================== AUTH METHODS ====================
  
  async signUp(email: string, password: string): Promise<{ user: SupabaseUser | null; error: any }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data.user && !error) {
      // Create user record in users table
      await this.createUserRecord(data.user.id, email);
    }

    return { user: data.user, error };
  }

  async signIn(email: string, password: string): Promise<{ user: SupabaseUser | null; error: any }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { user: data.user, error };
  }

  async signInWithGoogle(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    return { error };
  }

  async signOut(): Promise<{ error: any }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  }

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // ==================== USER METHODS ====================

  async createUserRecord(userId: string, email: string): Promise<{ error: any }> {
    const { error } = await supabase.from('users').insert({
      id: userId,
      email,
      plan: 'FREE',
      bonus_uses: 10, // Signup bonus
      daily_uses: 0,
      last_reset_date: new Date().toISOString().split('T')[0],
    });

    return { error };
  }

  async getUserProfile(userId: string): Promise<AppUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    const user: AppUser = {
      id: data.id,
      email: data.email,
      plan: data.plan as UserPlan,
      bonusUses: data.bonus_uses,
      dailyUses: data.daily_uses,
      lastResetDate: data.last_reset_date,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
    };

    return user;
  }

  async updateUserPlan(userId: string, plan: UserPlan): Promise<{ error: any }> {
    const { error } = await supabase
      .from('users')
      .update({ plan })
      .eq('id', userId);

    return { error };
  }

  async incrementDailyUsage(userId: string): Promise<boolean> {
    // First check if we need to reset daily usage
    await this.checkAndResetDailyUsage(userId);

    // Get current user data
    const user = await this.getUserProfile(userId);
    if (!user) return false;

    // Check if user has reached their limit
    const dailyLimit = user.plan === 'FREE' ? 5 : user.plan === 'PREMIUM' ? 999999 : 5;
    const totalAvailable = dailyLimit + user.bonusUses;

    if (user.dailyUses >= totalAvailable) {
      return false; // Limit reached
    }

    // Try to use bonus first if available
    if (user.dailyUses >= dailyLimit && user.bonusUses > 0) {
      await this.decrementBonusUses(userId);
    }

    // Increment daily usage
    const { error } = await supabase
      .from('users')
      .update({ daily_uses: user.dailyUses + 1 })
      .eq('id', userId);

    return !error;
  }

  async decrementBonusUses(userId: string): Promise<{ error: any }> {
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('bonus_uses')
      .eq('id', userId)
      .single();

    if (fetchError) return { error: fetchError };

    if ((user?.bonus_uses || 0) <= 0) {
      return { error: new Error('No bonus uses remaining') };
    }

    const { error } = await supabase
      .from('users')
      .update({ bonus_uses: (user?.bonus_uses || 0) - 1 })
      .eq('id', userId);

    return { error };
  }

  async checkAndResetDailyUsage(userId: string): Promise<{ reset: boolean; error: any }> {
    const { data: user, error } = await supabase
      .from('users')
      .select('last_reset_date, daily_uses')
      .eq('id', userId)
      .single();

    if (error) return { reset: false, error };

    const today = new Date().toISOString().split('T')[0];
    const lastReset = user?.last_reset_date;

    if (lastReset !== today) {
      // Reset daily usage
      const { error: updateError } = await supabase
        .from('users')
        .update({
          daily_uses: 0,
          last_reset_date: today,
        })
        .eq('id', userId);

      return { reset: true, error: updateError };
    }

    return { reset: false, error: null };
  }

  // ==================== USAGE LOG METHODS ====================

  async logUsage(
    userId: string,
    toolType: 'enhance' | 'humanize' | 'image' | 'speech'
  ): Promise<{ error: any }> {
    const { error } = await supabase.from('usage_logs').insert({
      user_id: userId,
      tool_type: toolType,
    });

    return { error };
  }

  async getUserUsageLogs(
    userId: string,
    limit: number = 50
  ): Promise<{ logs: UsageLog[]; error: any }> {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { logs: [], error };

    const logs: UsageLog[] = (data || []).map((log) => ({
      id: log.id,
      userId: log.user_id,
      toolType: log.tool_type as 'enhance' | 'humanize' | 'image' | 'speech',
      createdAt: log.created_at,
    }));

    return { logs, error: null };
  }

  async getTodayUsageCount(userId: string): Promise<{ count: number; error: any }> {
    const today = new Date().toISOString().split('T')[0];

    const { count, error } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`);

    return { count: count || 0, error };
  }

  // ==================== SUBSCRIPTION METHODS ====================

  async createSubscription(
    userId: string,
    stripeSubscriptionId: string,
    currentPeriodStart: string,
    currentPeriodEnd: string
  ): Promise<{ error: any }> {
    const { error } = await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: stripeSubscriptionId,
      status: 'active',
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
    });

    return { error };
  }

  async updateSubscriptionStatus(
    stripeSubscriptionId: string,
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    return { error };
  }

  async getUserSubscription(userId: string): Promise<{ subscription: any; error: any }> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { subscription: data, error };
  }

  // ==================== ANONYMOUS USAGE METHODS ====================

  async getAnonymousUsage(ipAddress: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('anonymous_usage')
      .select('usage_count')
      .eq('ip_address', ipAddress)
      .eq('usage_date', today)
      .single();

    if (error || !data) return 0;

    return data.usage_count || 0;
  }

  async incrementAnonymousUsage(
    ipAddress: string,
    toolType: 'enhance' | 'humanize' | 'image' | 'speech'
  ): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const ANONYMOUS_LIMIT = 5;

    // Get current usage
    const currentUsage = await this.getAnonymousUsage(ipAddress);

    if (currentUsage >= ANONYMOUS_LIMIT) {
      return false; // Limit reached
    }

    // Try to increment existing record
    const { data: existing } = await supabase
      .from('anonymous_usage')
      .select('id, usage_count')
      .eq('ip_address', ipAddress)
      .eq('usage_date', today)
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('anonymous_usage')
        .update({ usage_count: existing.usage_count + 1 })
        .eq('id', existing.id);

      return !error;
    } else {
      // Create new record
      const { error } = await supabase
        .from('anonymous_usage')
        .insert({
          ip_address: ipAddress,
          tool_type: toolType,
          usage_date: today,
          usage_count: 1,
        });

      return !error;
    }
  }
}

export const supabaseService = new SupabaseService();
