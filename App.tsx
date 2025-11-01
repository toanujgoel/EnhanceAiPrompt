import React, { useState } from 'react';
import { UserProvider } from './hooks/useUser';
import Header from './components/Header';
import PromptEnhancer from './components/PromptEnhancer';
import ContentHumanizer from './components/ContentHumanizer';
import ImageGenerator from './components/ImageGenerator';
import TextToSpeech from './components/TextToSpeech';
import AudioTranscriber from './components/AudioTranscriber';
import Blog from './components/Blog';
import Chatbot from './components/Chatbot';
import UpgradeModal from './components/UpgradeModal';
import { Tool } from './types';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.ENHANCER);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const renderTool = () => {
    switch (activeTool) {
      case Tool.ENHANCER:
        return <PromptEnhancer />;
      case Tool.HUMANIZER:
        return <ContentHumanizer />;
      case Tool.IMAGE_GENERATOR:
        return <ImageGenerator />;
      case Tool.TTS:
        return <TextToSpeech />;
      case Tool.TRANSCRIBER:
        return <AudioTranscriber />;
      case Tool.BLOG:
        return <Blog />;
      default:
        return <PromptEnhancer />;
    }
  };

  return (
    <UserProvider>
      <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 font-sans">
        <Header activeTool={activeTool} setActiveTool={setActiveTool} openUpgradeModal={() => setIsUpgradeModalOpen(true)} />
        <main className="p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderTool()}
          </div>
        </main>
        <Chatbot />
        <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
      </div>
    </UserProvider>
  );
};

export default App;