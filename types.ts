export enum UserPlan {
  ANONYMOUS = 'ANONYMOUS',    // No signup - 5 uses/day
  FREE = 'FREE',              // Signed up - 10 lifetime bonus + 5 uses/day
  PREMIUM = 'PREMIUM',        // $12/month - 100 uses/day
}

export interface User {
  plan: UserPlan;
  email?: string;
  signupDate?: string;
  lifetimeBonus: number; // Bonus uses for signed up users
  usage: {
    enhance: number;
    humanize: number;
    image: number;
    speech: number;
    date: string; // YYYY-MM-DD
  };
}

export enum Tool {
  ENHANCER = 'Prompt Enhancer',
  HUMANIZER = 'Content Humanizer',
  IMAGE_GENERATOR = 'Image Generator',
  TTS = 'Text-to-Speech',
  BLOG = 'Blog',
  ABOUT = 'About',
  CONTACT = 'Contact',
  PRIVACY = 'Privacy Policy',
  TERMS = 'Terms of Service',
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  sources?: { web: { uri: string; title: string; } }[];
}