
import React from 'react';
import { Tool, UserPlan } from '../types';
import { useUser } from '../hooks/useUser';
import { USAGE_LIMITS } from '../constants';
// FIX: Removed unused 'Squares2X2Icon' import, which is not exported from './icons/Icons'.
import { BoltIcon, CpuChipIcon, PhotoIcon, SparklesIcon, SpeakerWaveIcon, WaveformIcon } from './icons/Icons';

interface HeaderProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const toolIcons: Record<Tool, React.ReactNode> = {
    [Tool.ENHANCER]: <BoltIcon />,
    [Tool.HUMANIZER]: <SparklesIcon />,
    [Tool.IMAGE_GENERATOR]: <PhotoIcon />,
    [Tool.TTS]: <SpeakerWaveIcon />,
    [Tool.TRANSCRIBER]: <WaveformIcon />,
};

const Header: React.FC<HeaderProps> = ({ activeTool, setActiveTool }) => {
  const { user, upgradePlan, getRemainingUses } = useUser();
  const remainingUses = getRemainingUses();
  const usageLimit = USAGE_LIMITS[user.plan];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <CpuChipIcon />
            <span className="ml-2 text-xl font-bold text-primary-600 dark:text-primary-400">Enhance AI Prompt</span>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-4">
             {Object.values(Tool).map(tool => (
                <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeTool === tool
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    >
                    <span className="mr-2">{toolIcons[tool]}</span>
                    {tool}
                </button>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span>Uses: {usageLimit - remainingUses} / {usageLimit}</span>
            </div>
            {user.plan === UserPlan.FREE && (
              <button onClick={upgradePlan} className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors duration-200">
                Upgrade
              </button>
            )}
          </div>
        </div>
        <div className="md:hidden p-2 flex flex-wrap justify-center gap-2">
            {Object.values(Tool).map(tool => (
                <button
                    key={tool}
                    onClick={() => setActiveTool(tool)}
                    className={`flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors duration-200 ${
                        activeTool === tool
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
