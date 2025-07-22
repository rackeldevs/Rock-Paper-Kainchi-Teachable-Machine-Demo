
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen = ({ onStart }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rainbow-red via-rainbow-yellow via-rainbow-green via-rainbow-blue to-rainbow-violet">
      <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md mx-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Rock Paper Kainchi
        </h1>
        
        <div className="space-y-4 mb-8">
          <p className="text-xl text-gray-700 font-semibold">
            Made by AdityaK
          </p>
          <p className="text-sm text-gray-600">
            AI Model trained with 1925 samples in total
          </p>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="bg-rainbow-violet hover:bg-rainbow-blue text-white font-bold px-8 py-3"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default SplashScreen;
