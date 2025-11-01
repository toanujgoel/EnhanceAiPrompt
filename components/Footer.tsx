import React from 'react';
import { Tool } from '../types';
import { EnhanceAiLogo } from './icons/Icons';

interface FooterProps {
  setActivePage: (page: Tool) => void;
}

const Footer: React.FC<FooterProps> = ({ setActivePage }) => {
  const handleLinkClick = (page: Tool) => {
    setActivePage(page);
    window.scrollTo(0, 0); // Scroll to top on page change
  };

  return (
    <footer className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-1 md:justify-start">
            <div className="flex items-center">
              <EnhanceAiLogo />
              <div className="ml-3">
                  <p className="text-base font-bold text-gray-800 dark:text-white">EnhanceAiPrompt.com</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Refine Prompts. Humanize Content.</p>
              </div>
            </div>
          </div>
          <div className="mt-8 md:mt-0 md:order-2">
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <button onClick={() => handleLinkClick(Tool.ABOUT)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</button>
              <button onClick={() => handleLinkClick(Tool.BLOG)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Blog</button>
              <button onClick={() => handleLinkClick(Tool.CONTACT)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</button>
              <button onClick={() => handleLinkClick(Tool.PRIVACY)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</button>
              <button onClick={() => handleLinkClick(Tool.TERMS)} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</button>
            </nav>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} EnhanceAiPrompt.com. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
