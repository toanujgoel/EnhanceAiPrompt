import React from 'react';
import { blogPosts } from '../data/blogPosts';
import AdBanner from './AdBanner';
import { useUser } from '../hooks/useUser';
import { UserPlan } from '../types';

const Blog: React.FC = () => {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg h-80">
          <img 
              src="https://images.unsplash.com/photo-1620712943543-aebc6923297f?q=80&w=1770&auto=format&fit=crop" 
              alt="AI and Technology" 
              className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 text-white">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-shadow-lg">Tech & AI Blog</h1>
              <p className="mt-3 max-w-2xl text-lg md:text-xl text-shadow">Your daily dose of insights, tutorials, and news from the world of AI.</p>
          </div>
      </div>

      {user.plan === UserPlan.FREE && <AdBanner />}
      
      <div className="grid gap-8 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {blogPosts.map((post) => (
          <article key={post.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
            <img className="w-full h-48 object-cover" src={post.imageUrl} alt={post.title} />
            <div className="p-6 flex flex-col flex-grow">
              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase">{post.category}</span>
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