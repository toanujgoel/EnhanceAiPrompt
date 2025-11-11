export enum UserPlan {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export interface User {
  plan: UserPlan;
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