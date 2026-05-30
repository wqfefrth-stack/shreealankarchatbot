import React, { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  onComplete: () => void;
}

const loadingTexts = [
  'Preparing your experience',
  'श्री अलंकार',
  'Fine Jewelry · Since 1998',
  'Welcome · स्वागत',
];

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [textIdx, setTextIdx] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(i);
          setTimeout(onComplete, 450);
          return 100;
        }
        return p + 2;
      });
    }, 45);
    return () => clearInterval(i);
  }, [onComplete]);

  useEffect(() => {
    const t = setInterval(() => setTextIdx((i) => (i + 1) % loadingTexts.length), 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 gradient-backdrop flex items-center justify-center overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div
        className="absolute -bottom-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary-glow/20 blur-3xl animate-float"
        style={{ animationDelay: '1.5s' }}
      />

      <div className="relative text-center px-6 max-w-md w-full">
        <div className="relative mx-auto mb-10 w-28 h-28">
          <div className="absolute inset-0 rounded-full luxury-gradient opacity-30 blur-2xl animate-glow" />
          <div className="relative w-28 h-28 rounded-full glass-panel flex items-center justify-center shadow-elegant animate-float">
            <img
              src="/lovable-uploads/df89ad8d-4e94-4d53-813b-4e057004190e.png"
              alt="Shree Alankar"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        <h1 className="font-display text-5xl md:text-6xl font-semibold mb-2 text-luxury animate-fade-up">
          श्री अलंकार
        </h1>
        <p
          className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-12 animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          Shree Alankar · Est. 1998
        </p>

        <p key={textIdx} className="text-base text-foreground/80 mb-8 animate-fade-up min-h-[1.5rem]">
          {loadingTexts[textIdx]}
        </p>

        <div className="w-full max-w-xs mx-auto">
          <div className="h-[3px] rounded-full bg-border/60 overflow-hidden">
            <div
              className="h-full luxury-gradient transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs tracking-widest text-muted-foreground tabular-nums">
            {String(progress).padStart(3, '0')}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
