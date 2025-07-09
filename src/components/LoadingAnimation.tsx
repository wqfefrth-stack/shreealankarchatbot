
import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingAnimationProps {
  onComplete: () => void;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('Loading...');

  const loadingTexts = [
    'Loading...',
    'श्री अलंकार',
    'Fine Jewelry Since 1998',
    '१९९८ पासून उत्कृष्ट दागिने',
    'Welcome / स्वागत'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentText(prev => {
        const currentIndex = loadingTexts.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, 800);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 z-50 flex items-center justify-center">
      <div className="text-center text-white">
        {/* Logo */}
        <div className="mb-8 animate-pulse">
          <img 
            src="/lovable-uploads/df89ad8d-4e94-4d53-813b-4e057004190e.png" 
            alt="Shree Alankar Logo" 
            className="w-32 h-32 mx-auto object-contain"
          />
        </div>
        
        {/* Company Name */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 animate-fade-in">
            श्री अलंकार
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold opacity-90">
            Shree Alankar
          </h2>
          <p className="text-lg md:text-xl opacity-75 mt-2">
            Fine Jewelry Since 1998
          </p>
        </div>

        {/* Sparkles Animation */}
        <div className="mb-8 relative">
          <Sparkles className="w-12 h-12 mx-auto animate-spin text-amber-300" />
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 animate-pulse text-yellow-300" />
          </div>
          <div className="absolute -bottom-2 -left-2">
            <Sparkles className="w-4 h-4 animate-bounce text-amber-200" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-8">
          <p className="text-xl md:text-2xl font-medium animate-pulse">
            {currentText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 max-w-full mx-auto">
          <div className="bg-amber-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-300 to-amber-300 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm opacity-75 mt-2">{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
