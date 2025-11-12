import React from 'react';
import { InstagramIcon, LinkedInIcon, XIcon } from './icons/Icons';

const Contact: React.FC = () => {
    const socialLinks = [
        { name: 'LinkedIn', href: 'https://www.linkedin.com/in/toanujgoel/', icon: <LinkedInIcon /> },
        { name: 'X (Twitter)', href: 'https://x.com/Toanujgoel', icon: <XIcon /> },
        { name: 'Instagram', href: 'https://www.instagram.com/toanujgoel/', icon: <InstagramIcon /> },
    ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white tracking-tight">Get in Touch</h1>
          <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-400">
            We’re here to help and answer any question you might have. We look forward to hearing from you!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-700 dark:text-gray-300">
          {/* Contact Information Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Contact Information</h2>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">General Inquiries & Support</h3>
              <p>For any questions, feedback, or support requests, please email us directly.</p>
              <a href="mailto:mailtoanujgoel@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline">
                mailtoanujgoel@gmail.com
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Mailing Address</h3>
              <p>Ghaziabad, Uttar Pradesh, India</p>
              <p>Pin-201012</p>
            </div>
          </div>
          
          {/* Social Media Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Connect With Us</h2>
            <p>Follow us on social media to stay up-to-date with the latest news, features, and AI insights.</p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
