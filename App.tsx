import React, { useState } from 'react';
import { UserProvider } from './hooks/useUser';
import Header from './components/Header';
import PromptEnhancer from './components/PromptEnhancer';
import ContentHumanizer from './components/ContentHumanizer';
import ImageGenerator from './components/ImageGenerator';
import TextToSpeech from './components/TextToSpeech';
import Blog from './components/Blog';
import Chatbot from './components/Chatbot';
import UpgradeModal from './components/UpgradeModal';
import SignupModal from './components/SignupModal';
import UsageIndicator from './components/UsageIndicator';
import { Tool } from './types';
import Footer from './components/Footer';
import About from './components/About';
import Contact from './components/Contact';
import Privacy from './components/Privacy';
import Terms from './components/Terms';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool>(Tool.ENHANCER);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

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
      case Tool.BLOG:
        return <Blog />;
      case Tool.ABOUT:
        return <About />;
      case Tool.CONTACT:
        return <Contact />;
      case Tool.PRIVACY:
        return <Privacy />;
      case Tool.TERMS:
        return <Terms />;
      default:
        return <PromptEnhancer />;
    }
  };

  return (
    <UserProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white font-sans flex flex-col">
        <Header activeTool={activeTool} setActiveTool={setActiveTool} openUpgradeModal={() => setIsUpgradeModalOpen(true)} />
        
        <main className="flex-grow px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Usage Indicator - Show on tool pages */}
            {[Tool.ENHANCER, Tool.HUMANIZER, Tool.IMAGE_GENERATOR, Tool.TTS].includes(activeTool) && (
              <div className="mb-4 md:mb-8">
                <UsageIndicator 
                  onUpgradeClick={() => setIsUpgradeModalOpen(true)}
                  onSignupClick={() => setIsSignupModalOpen(true)}
                />
              </div>
            )}
            
            <div className="animate-in fade-in-50 duration-300">
              {renderTool()}
            </div>
          </div>
        </main>
        
        <Chatbot />
        <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        <SignupModal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)} />
        <Footer setActivePage={setActiveTool} />
      </div>
    </UserProvider>
  );
};

export default App;