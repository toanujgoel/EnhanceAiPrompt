
import React, { useState } from 'react';
import { UserProvider } from './hooks/useUser';
import Header from './components/Header';
import PromptEnhancer from './components/PromptEnhancer';
import ContentHumanizer from './components/ContentHumanizer';
import ImageGenerator from './components/ImageGenerator';
import TextToSpeech from './components/TextToSpeech';
import AudioTranscriber from './components/AudioTranscriber';
import Chatbot from './components/Chatbot';
import { Tool } from './types';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.ENHANCER);

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
      default:
        return <PromptEnhancer />;
    }
  };

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <Header activeTool={activeTool} setActiveTool={setActiveTool} />
        <main className="p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderTool()}
          </div>
        </main>
        <Chatbot />
      </div>
    </UserProvider>
  );
};

export default App;
