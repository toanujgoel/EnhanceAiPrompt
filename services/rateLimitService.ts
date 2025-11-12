// Server-side rate limiting service
export interface UsageStatus {
  ip: string;
  plan: 'FREE' | 'PREMIUM';
  usage: number;
  limit: number;
  remaining: number;
  date: string;
  canUse: boolean;
}

export interface UsageResponse {
  success: boolean;
  tool: string;
  usage: number;
  limit: number;
  remaining: number;
  canContinue: boolean;
}

export interface RateLimitError {
  error: string;
  usage: number;
  limit: number;
  resetTime: string;
  upgradeRequired: boolean;
}

class RateLimitService {
  private baseUrl: string;

  constructor() {
    // Use production URL in production, local for development
    this.baseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5173' 
      : 'https://enhanceaiprompt.com';
  }

  /**
   * Get current usage status from server
   */
  async getUsageStatus(userPlan: 'FREE' | 'PREMIUM' = 'FREE'): Promise<UsageStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rate-limit.php`, {
        method: 'GET',
        headers: {
          'X-User-Plan': userPlan,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching usage status:', error);
      throw new Error('Failed to fetch usage status');
    }
  }

  /**
   * Check if user can use a tool and increment usage if allowed
   */
  async checkAndIncrementUsage(
    tool: string, 
    userPlan: 'FREE' | 'PREMIUM' = 'FREE'
  ): Promise<UsageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rate-limit.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Plan': userPlan,
        },
        body: JSON.stringify({ tool }),
      });

      const data = await response.json();

      if (response.status === 429) {
        // Rate limit exceeded
        const errorData = data as RateLimitError;
        throw new RateLimitExceededError(errorData);
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof RateLimitExceededError) {
        throw error;
      }
      console.error('Error checking rate limit:', error);
      throw new Error('Failed to verify usage limit');
    }
  }

  /**
   * Validate usage before making API calls
   */
  async validateUsage(tool: string, userPlan: 'FREE' | 'PREMIUM' = 'FREE'): Promise<boolean> {
    try {
      await this.checkAndIncrementUsage(tool, userPlan);
      return true;
    } catch (error) {
      if (error instanceof RateLimitExceededError) {
        return false;
      }
      // For other errors, we might want to allow the request to proceed
      // to avoid blocking users due to temporary server issues
      console.warn('Rate limit validation failed, allowing request:', error);
      return true;
    }
  }
}

export class RateLimitExceededError extends Error {
  public readonly usage: number;
  public readonly limit: number;
  public readonly resetTime: string;
  public readonly upgradeRequired: boolean;

  constructor(data: RateLimitError) {
    super(data.error);
    this.name = 'RateLimitExceededError';
    this.usage = data.usage;
    this.limit = data.limit;
    this.resetTime = data.resetTime;
    this.upgradeRequired = data.upgradeRequired;
  }

  getTimeUntilReset(): string {
    const now = new Date();
    const resetTime = new Date(this.resetTime);
    const diff = resetTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Available now';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

// Export singleton instance
export const rateLimitService = new RateLimitService();