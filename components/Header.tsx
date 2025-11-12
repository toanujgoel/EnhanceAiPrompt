import React, { useState, useRef, useEffect } from 'react';
import { Tool, UserPlan } from '../types';
import { useUser } from '../hooks/useUser.tsx';
import { USAGE_LIMITS } from '../constants';
import { BoltIcon, EnhanceAiLogo, MicrophoneIcon, NewspaperIcon, PhotoIcon, SparklesIcon, SpeakerWaveIcon, InformationCircleIcon, EnvelopeIcon, ShieldCheckIcon, DocumentTextIcon, ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from './icons/Icons';
import LoginModal from './LoginModal';

interface HeaderProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  openUpgradeModal: () => void;
  openSignupModal: () => void;
}

const toolIcons: Record<Tool, React.ReactNode> = {
    [Tool.ENHANCER]: <BoltIcon />,
    [Tool.HUMANIZER]: <SparklesIcon />,
    [Tool.IMAGE_GENERATOR]: <PhotoIcon />,
    [Tool.TTS]: <SpeakerWaveIcon />,
    [Tool.BLOG]: <NewspaperIcon className="w-5 h-5" />,
    [Tool.ABOUT]: <InformationCircleIcon />,
    [Tool.CONTACT]: <EnvelopeIcon />,
    [Tool.PRIVACY]: <ShieldCheckIcon />,
    [Tool.TERMS]: <DocumentTextIcon />,
};

const MAIN_TOOLS = [Tool.ENHANCER, Tool.HUMANIZER, Tool.IMAGE_GENERATOR, Tool.TTS, Tool.BLOG];
const MORE_PAGES = [Tool.ABOUT, Tool.CONTACT, Tool.PRIVACY, Tool.TERMS];


const Header: React.FC<HeaderProps> = ({ activeTool, setActiveTool, openUpgradeModal, openSignupModal }) => {
  const { user, isAuthenticated, logoutUser, getRemainingUses } = useUser();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const remainingUses = getRemainingUses();
  const usageLimit = USAGE_LIMITS[user.plan];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePageSelect = (tool: Tool) => {
    setActiveTool(tool);
    setIsMoreMenuOpen(false);
    setIsMobileMoreOpen(false);
  }

  const handleLogout = async () => {
    await logoutUser();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          <div className="flex items-center flex-shrink-0">
            <EnhanceAiLogo />
            <div className="ml-2 md:ml-3">
                <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight">EnhanceAiPrompt</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight hidden sm:block">AI-Powered Content Tools</p>
            </div>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-1">
             {MAIN_TOOLS.map(tool => (
                <button
                    key={tool}
                    onClick={() => handlePageSelect(tool)}
                    className={`group flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 ${
                        activeTool === tool
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                    }`}
                    >
                    <span className="mr-2 text-base">{toolIcons[tool]}</span>
                    <span className="capitalize">{tool.toLowerCase()}</span>
                </button>
            ))}
            {/* More Dropdown */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                >
                    More
                    <ChevronDownIcon className={`ml-1 w-4 h-4 transition-transform duration-200 ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMoreMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-10">
                        {MORE_PAGES.map(page => (
                             <button
                                key={page}
                                onClick={() => handlePageSelect(page)}
                                className="w-full text-left flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/40 transition-colors duration-150"
                            >
                                <span className="mr-3 text-base">{toolIcons[page]}</span>
                                <span className="capitalize">{page.toLowerCase()}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Usage Badge */}
            <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/60 dark:bg-gray-800/60 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              <span>{usageLimit - remainingUses}</span>
              <span className="text-gray-500 dark:text-gray-400 mx-1">/</span>
              <span>{usageLimit}</span>
              <span className="hidden sm:inline ml-1 text-gray-500 dark:text-gray-400">uses</span>
            </div>

            {/* Authenticated User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="hidden md:inline max-w-[120px] truncate">{user.email}</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-10">
                    <div className="px-4 py-2 border-b border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{user.plan} Plan</p>
                    </div>

                    {user.plan !== UserPlan.PREMIUM && (
                      <button
                        onClick={() => {
                          openUpgradeModal();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-100/60 dark:hover:bg-gray-700/40 transition-colors duration-150"
                      >
                        ⭐ Upgrade to Premium
                      </button>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-gray-700/40 transition-colors duration-150"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Anonymous User Buttons */
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  Log In
                </button>
                <button 
                  onClick={openSignupModal} 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <span className="hidden sm:inline">Sign Up Free</span>
                  <span className="sm:hidden">Sign Up</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="md:hidden pb-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {MAIN_TOOLS.map(tool => (
                <button
                    key={tool}
                    onClick={() => handlePageSelect(tool)}
                    className={`flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                        activeTool === tool
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/60'
                    }`}
                    >
                    <span className="mr-1.5 text-sm">{toolIcons[tool]}</span>
                    <span className="capitalize">{tool.toLowerCase()}</span>
                </button>
            ))}
            <button
              onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)}
              className={`flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isMobileMoreOpen
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/60'
              }`}
            >
              More
              <ChevronDownIcon className={`ml-1 w-4 h-4 transition-transform duration-200 ${isMobileMoreOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {isMobileMoreOpen && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {MORE_PAGES.map(page => (
                <button
                    key={page}
                    onClick={() => handlePageSelect(page)}
                    className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                        activeTool === page
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                        : 'text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/60'
                    }`}
                    >
                    <span className="mr-2 text-sm">{toolIcons[page]}</span>
                    <span className="capitalize">{page.toLowerCase()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};

export default Header;