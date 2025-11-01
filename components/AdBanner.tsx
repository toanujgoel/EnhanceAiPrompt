import React from 'react';

const AdBanner: React.FC = () => {
  return (
    <div className="my-6 p-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-center rounded-xl shadow-md border border-gray-300 dark:border-gray-600">
      <p className="font-semibold text-gray-800 dark:text-gray-200">Advertisement</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">Upgrade to Premium for an ad-free experience and more daily uses!</p>
    </div>
  );
};

export default AdBanner;