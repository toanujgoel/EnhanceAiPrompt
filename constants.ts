import { UserPlan } from './types';

export const USAGE_LIMITS = {
  [UserPlan.ANONYMOUS]: 5,    // Anonymous users: 5 uses per day
  [UserPlan.FREE]: 5,         // Signed up users: 5 uses per day + 10 lifetime bonus
  [UserPlan.PREMIUM]: 100,    // Premium users: 100 uses per day
};

export const SIGNUP_BONUS = 10; // Lifetime bonus uses for signing up

export const PRICING = {
  PREMIUM_MONTHLY_USD: 12,
  PREMIUM_DAILY_COST: 0.40, // $12/30 days
  FREE_TRIAL_HOURS: 24,
  VALUE_PROPS: {
    HOURLY_SAVING: 4,
    COST_VS_ALTERNATIVES: 60, // % savings vs competitors
  }
};

export const MODEL_NAMES = {
  // Use Pro for high-quality, complex tasks
  ENHANCER: 'gemini-2.5-pro',
  HUMANIZER: 'gemini-2.5-pro',
  // Use Flash for fast, general tasks
  CHAT: 'gemini-2.5-flash',
  CHAT_GROUNDED: 'gemini-2.5-flash',
  // Specific models for their modalities
  IMAGE_GENERATION: 'imagen-4.0-generate-001',
  TTS: 'gemini-2.5-flash-preview-tts',
  // FIX: Add AUDIO_TRANSCRIPTION model name for Live API.
  AUDIO_TRANSCRIPTION: 'gemini-2.5-flash-native-audio-preview-09-2025',
};
