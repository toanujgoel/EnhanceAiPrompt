import React from 'react';
import { CpuChipIcon } from './icons/Icons';

const About: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">About EnhanceAiPrompt.com</h1>
          <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-400">Refine Prompts. Humanize Content.</p>
        </div>

        <div className="space-y-12 text-gray-700 dark:text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-l-4 border-primary-500 pl-4">Our Mission: From Personal Tool to Public Utility</h2>
            <p>EnhanceAiPrompt.com began as a personal project to solve a simple problem: how to be more efficient. It started with a single tool for prompt enhancement, born out of the need to get better, more reliable results from AI models. However, it quickly became clear that a great prompt was only half the battle.</p>
            <p className="mt-4">This realization sparked the expansion into a comprehensive suite of tools. We added the Content Humanizer, Text-to-Speech, Image Generator, and a Thought Transcriber to address the entire content creation workflow. Our mission is to equip creators, professionals, and businesses with the tools needed to make daily tasks significantly more efficient, while our blog aims to keep you at the forefront of the latest advancements in AI technology.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-l-4 border-primary-500 pl-4">Meet the Creator</h2>
            <p>This platform was built and is maintained by a solo entrepreneur with over 8 years of experience as a Senior Software Engineer. With a deep passion for technology and efficiency, the goal has always been to build practical tools that enhance workflows and provide clear, actionable insights into the ever-evolving tech landscape. This project is a culmination of that dedication, offered to you.</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CpuChipIcon />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">The Power of AI & Your Responsibility</h3>
                <p className="text-blue-800 dark:text-blue-200">Our core tools are powered by Google's advanced Gemini AI models, designed to help you transform, enhance, and generate content at unprecedented speed. While this technology is incredibly powerful, it's important to remember that it is a tool to assist, not replace, human oversight.</p>
                <p className="mt-3 text-blue-800 dark:text-blue-200 font-semibold">You, the user, are always responsible for reviewing, verifying, and taking ownership of the final output. Ensure all facts are accurate and the content meets your standards before use.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
