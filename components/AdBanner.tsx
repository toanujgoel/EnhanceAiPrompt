
import React from 'react';

const AdBanner: React.FC = () => {
  return (
    <div className="my-4 p-4 bg-gray-200 dark:bg-gray-700 text-center rounded-lg shadow">
      <p className="font-semibold text-gray-700 dark:text-gray-300">Advertisement</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Upgrade to Premium for an ad-free experience!</p>
    </div>
  );
};

export default AdBanner;
