// Productivity and efficiency quotes for loading states
export const PRODUCTIVITY_QUOTES = [
  "⚡ Time is the scarcest resource, and unless it is managed nothing else can be managed.",
  "🎯 Focus on being productive instead of busy.",
  "🚀 Efficiency is doing things right; effectiveness is doing the right things.",
  "💡 The way to get started is to quit talking and begin doing.",
  "⏰ Lost time is never found again.",
  "🎨 Creativity is intelligence having fun.",
  "📈 Progress, not perfection.",
  "🔥 Work smarter, not harder.",
  "✨ AI is your productivity superpower.",
  "🎪 Automation is the key to scaling your creativity.",
  "🌟 Every expert was once a beginner.",
  "🏆 Success is the sum of small efforts repeated day in and day out.",
  "🎭 Innovation distinguishes between a leader and a follower.",
  "🎯 The future belongs to those who learn more skills and combine them in creative ways.",
  "⚙️ Technology is best when it brings people together.",
  "🚀 Don't wait for opportunity. Create it.",
  "💪 Your limitation—it's only your imagination.",
  "🎨 AI doesn't replace creativity, it amplifies it.",
  "⭐ Small progress is still progress.",
  "🎪 The best time to plant a tree was 20 years ago. The second best time is now."
];

export const getRandomQuote = (): string => {
  const randomIndex = Math.floor(Math.random() * PRODUCTIVITY_QUOTES.length);
  return PRODUCTIVITY_QUOTES[randomIndex];
};

export const getQuoteForContext = (context: 'enhance' | 'humanize' | 'image' | 'speech' | 'general'): string => {
  const contextQuotes = {
    enhance: [
      "⚡ Crafting the perfect prompt is an art and science combined...",
      "🎯 Great prompts unlock AI's true potential...",
      "💡 The better the input, the better the output...",
      "🚀 Precision in prompting leads to excellence in results..."
    ],
    humanize: [
      "🎭 Adding the human touch to AI-generated content...",
      "✨ Making AI sound more natural and engaging...", 
      "🎨 Bridging the gap between artificial and authentic...",
      "💫 Every great writer started with editing..."
    ],
    image: [
      "🎨 Turning imagination into visual reality...",
      "🖼️ Creating art that speaks a thousand words...",
      "🌟 Every masterpiece starts with a vision...",
      "🎪 AI is democratizing creativity for everyone..."
    ],
    speech: [
      "🎙️ Giving voice to your words...",
      "🗣️ The power of spoken communication...",
      "🎵 Making text come alive through sound...",
      "🚀 Voice is the new interface..."
    ],
    general: PRODUCTIVITY_QUOTES
  };

  const quotes = contextQuotes[context];
  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};