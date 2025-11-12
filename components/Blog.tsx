import React, { useState, useEffect } from 'react';
import { blogPosts } from '../data/blogPosts';
import AdBanner from './AdBanner';
import EnhancedLoading from './EnhancedLoading';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';

interface BlogPost {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  content?: string;
  imageUrl: string;
  date: string;
  author: {
    name: string;
    imageUrl: string;
  };
  published?: boolean;
  source?: string;
}

const Blog: React.FC = () => {
  const { user } = useUser();
  const [dynamicPosts, setDynamicPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dynamic posts from the API
  useEffect(() => {
    const fetchDynamicPosts = async () => {
      try {
        // Check if we're in production or have a base URL configured
        const baseUrl = window.location.hostname === 'localhost' 
          ? 'http://localhost:5173' 
          : 'https://enhanceaiprompt.com';
        
        const response = await fetch(`${baseUrl}/blog-api.php`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setDynamicPosts(data.posts || []);
        } else {
          console.warn('API returned success: false', data.error);
          setError(data.error || 'Failed to fetch dynamic posts');
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic posts:', err);
        setError('Unable to load latest posts. Showing static content only.');
        // Don't throw - we'll just show static posts
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicPosts();
  }, []);

  // Combine and sort posts (dynamic posts first, then static)
  const allPosts = [...dynamicPosts, ...blogPosts].sort((a, b) => {
    // Convert date strings to comparable format for sorting
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg h-80">
          <img 
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="AI Technology and Innovation" 
              className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20"></div>
          <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 text-white">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-shadow-lg">Tech & AI Blog</h1>
              <p className="mt-3 max-w-2xl text-lg md:text-xl text-shadow">Discover insights, tutorials, and the latest breakthroughs in artificial intelligence.</p>
          </div>
      </div>

      {user.plan === UserPlan.FREE && <AdBanner />}
      
      {/* Loading State */}
      {loading && (
        <div className="py-12">
          <EnhancedLoading 
            message="Loading latest posts..." 
            context="blog"
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid gap-8 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {allPosts.map((post) => (
          <article key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
            <img className="w-full h-48 object-cover" src={post.imageUrl} alt={post.title} />
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase">{post.category}</span>
                {post.source === 'n8n-automation' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Latest
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-xl font-bold text-gray-800 dark:text-white leading-tight flex-grow">
                {post.title}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="mt-6 flex items-center">
                <div className="flex-shrink-0">
                   <img className="h-10 w-10 rounded-full object-cover" src={post.author.imageUrl} alt={post.author.name} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{post.author.name}</p>
                  <div className="flex space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <time dateTime={post.date}>{post.date}</time>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <style>{`.text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.6); } .text-shadow-lg { text-shadow: 2px 2px 8px rgba(0,0,0,0.7); }`}</style>
    </div>
  );
};

export default Blog;