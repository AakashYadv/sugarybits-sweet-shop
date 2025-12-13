import React from 'react';

interface GenericPageProps {
  title: string;
  content: React.ReactNode;
  onBack: () => void;
}

const GenericPage: React.FC<GenericPageProps> = ({ title, content, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors font-medium"
      >
        <i className="fa-solid fa-arrow-left mr-2"></i> Back to Shop
      </button>
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
          {title}
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
          {content}
        </div>
      </div>
    </div>
  );
};

export default GenericPage;