import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, XMarkIcon } from './icons/Icons';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Hello! How can I help you today?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        // Prevent background scroll when chatbot is open
        document.body.style.overflow = 'hidden';
        scrollToBottom();
    } else {
        document.body.style.overflow = 'auto';
    }
    // Cleanup on component unmount
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput.trim() }];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await getChatResponse(messages, userInput.trim());
      setMessages([...newMessages, { sender: 'bot', text: response.text, sources: response.sources }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chatbot"
        className="fixed bottom-6 right-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white w-16 h-16 rounded-full shadow-xl flex items-center justify-center hover:from-primary-600 hover:to-primary-700 transition-transform transform hover:scale-110 active:scale-100 z-50"
      >
        {isOpen ? <XMarkIcon /> : <ChatBubbleLeftRightIcon />}
      </button>
      
      {/* Overlay for mobile */}
       <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity sm:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsOpen(false)}
      ></div>


      {isOpen && (
        <div className="fixed bottom-0 left-0 right-0 w-full h-[80vh] bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl flex flex-col transition-all border-t border-gray-200 dark:border-gray-700 z-40 sm:bottom-24 sm:left-auto sm:right-6 sm:w-full sm:max-w-sm sm:h-[60vh] sm:rounded-2xl sm:border">
          <header className="bg-primary-600 text-white p-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
            <h3 className="font-bold text-lg">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat" className="p-1 rounded-full hover:bg-white/20">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </header>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-xs ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  {msg.sender === 'bot' && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 border-t border-gray-300 dark:border-gray-600 pt-2">
                        <h4 className="text-xs font-bold mb-1">Sources:</h4>
                        {msg.sources.map((source, i) => (
                            <a href={source.web.uri} key={i} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 dark:text-blue-400 hover:underline block truncate">
                                {source.web.title}
                            </a>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="p-3 rounded-2xl rounded-bl-none bg-gray-200 dark:bg-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                aria-label="Send message"
                className="p-3 bg-primary-600 text-white rounded-r-xl hover:bg-primary-700 disabled:bg-gray-400"
              >
                <PaperAirplaneIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;