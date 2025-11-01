import { UserPlan } from './types';

export const USAGE_LIMITS = {
  [UserPlan.FREE]: 5,
  [UserPlan.PREMIUM]: 100,
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
