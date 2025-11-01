import React from 'react';
import { Tool, UserPlan } from '../types';
import { useUser } from '../hooks/useUser';
import { USAGE_LIMITS } from '../constants';
import { BoltIcon, EnhanceAiLogo, MicrophoneIcon, NewspaperIcon, PhotoIcon, SparklesIcon, SpeakerWaveIcon } from './icons/Icons';

interface HeaderProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  openUpgradeModal: () => void;
}

const toolIcons: Record<Tool, React.ReactNode> = {
    [Tool.ENHANCER]: <BoltIcon />,
    [Tool.HUMANIZER]: <SparklesIcon />,
    [Tool.IMAGE_GENERATOR]: <PhotoIcon />,
    [Tool.TTS]: <SpeakerWaveIcon />,
    [Tool.TRANSCRIBER]: <MicrophoneIcon className="w-5 h-5" />,
    [Tool.BLOG]: <NewspaperIcon className="w-5 h-5" />,
};

const Header: React.FC<HeaderProps> = ({ activeTool, setActiveTool, openUpgradeModal }) => {
  const { user, getRemainingUses } = useUser();
  const remainingUses = getRemainingUses();
  const usageLimit = USAGE_LIMITS[user.plan];

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center flex-shrink-0">
            <EnhanceAiLogo />
            <div className="ml-3">
                <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white leading-tight">EnhanceAiPrompt</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight hidden sm:block">Refine Prompts. Humanize Content.</p>
            </div>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
             {Object.values(Tool).map(tool => (
                <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 ${
                        activeTool === tool
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    >
                    <span className="mr-2">{toolIcons[tool]}</span>
                    {tool}
                </button>
            ))}
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 text-center">
              <span>{usageLimit - remainingUses} / {usageLimit}</span>
              <span className="hidden sm:inline"> Uses</span>
            </div>
            {user.plan === UserPlan.FREE && (
              <button onClick={openUpgradeModal} className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 active:scale-95 transition-all duration-200">
                Upgrade
              </button>
            )}
          </div>
        </div>
        <div className="md:hidden pb-3 flex flex-wrap justify-start gap-2">
            {Object.values(Tool).map(tool => (
                <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                        activeTool === tool
                        ? 'bg-primary-600 text-white shadow'
                        : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800'
                    }`}
                    >
                    <span className="mr-1.5">{toolIcons[tool]}</span>
                    {tool}
                </button>
            ))}
        </div>
      </div>
    </header>
  );
};

export default Header;