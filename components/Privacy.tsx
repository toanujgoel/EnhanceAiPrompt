import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8 md:p-10">
      <div className="max-w-4xl mx-auto prose dark:prose-invert prose-h1:text-3xl prose-h1:font-extrabold prose-h2:font-bold prose-h2:border-l-4 prose-h2:border-primary-500 prose-h2:pl-4 prose-a:text-primary-600 dark:prose-a:text-primary-400 hover:prose-a:underline">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400"><strong>Effective Date:</strong> August 26, 2025</p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg my-6">
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">
            <strong>Disclaimer:</strong> This Privacy Policy is for informational purposes only and does not constitute legal advice. You should consult with a legal professional to ensure compliance with all applicable laws and regulations.
            </p>
        </div>

        <p>Welcome to EnhanceAiPrompt.com ("we," "us," or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website https://www.enhanceaiprompt.com and use our services (the "Services").</p>

        <h2>1. Information We Collect</h2>
        <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
        <ul>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your email address, that you voluntarily give to us when you register for an account.</li>
            <li><strong>Usage Data:</strong> We automatically collect information about your usage of our Services, such as which tools you use and how often. This is used to track the consumption of your daily credits.</li>
            <li><strong>Log and Device Data:</strong> Our servers automatically collect standard web server logs when you access the Site, such as your IP address, browser type, operating system, and access times.</li>
        </ul>

        <h2>2. AI Data Handling (Gemini API)</h2>
        <p>When you use our AI-powered tools, the prompts and input text you provide are sent to Google's Gemini API for processing. We do not store the content of your prompts or the generated output on our servers. Your data is handled in accordance with Google's API policies. We encourage you to review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</p>
        
        <h2>3. Use of Your Information</h2>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
        <ul>
            <li>Create and manage your account.</li>
            <li>Monitor and enforce usage limits based on your subscription plan.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
            <li>Display personalized advertisements to you.</li>
        </ul>

        <h2>4. Third-Party Services</h2>
        <p>We may share information with third parties that perform services for us or on our behalf, including:</p>
        <ul>
            <li><strong>Payment Processing:</strong> We use Cashfree for processing payments. We do not store or collect your payment card details. That information is provided directly to Cashfree.</li>
            <li><strong>Website Analytics:</strong> We may use Google Analytics to help analyze how users use the Site.</li>
            <li><strong>Advertising:</strong> We use Google AdSense to serve ads when you visit the Site.</li>
        </ul>

        <h2>5. Security of Your Information</h2>
        <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>

        <h2>6. Governing Law</h2>
        <p>This Privacy Policy and any disputes related thereto shall be governed by and construed in accordance with the laws of the state of Uttar Pradesh, India, without regard to its conflict of law principles.</p>
        
        <h2>7. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.</p>

        <h2>8. Contact Us</h2>
        <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:mailtoanujgoel@gmail.com">mailtoanujgoel@gmail.com</a></p>
      </div>
    </div>
  );
};

export default Privacy;
