import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Play, Square, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SplashScreen from './SplashScreen';

type Move = 'rock' | 'paper' | 'scissor' | 'godmode';
type GameResult = 'win' | 'lose' | 'tie';

interface Prediction {
  className: string;
  probability: number;
}

const RockPaperKainchi = () => {
  const [showSplash, setShowSplash] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [userMove, setUserMove] = useState<Move | null>(null);
  const [aiMove, setAiMove] = useState<Move | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [score, setScore] = useState({ user: 0, ai: 0 });
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [godmodeTimer, setGodmodeTimer] = useState(0);
  const [isGodmodeActive, setIsGodmodeActive] = useState(false);
  const [buzzerPlaying, setBuzzerPlaying] = useState(false);
  const { toast } = useToast();

  const buzzerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    buzzerRef.current = new Audio('/models/buzz.mp3');
    buzzerRef.current.preload = 'auto';
  }, []);

  const handleSplashStart = () => {
    setShowSplash(false);
  };

  const initModel = async () => {
    setIsModelLoading(true);
    try {
      const modelURL = '/models/model.json';
      const metadataURL = '/models/metadata.json';
      
      const loadedModel = await tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
      toast({
        title: "Model Loaded!",
        description: "AI is ready to play Rock Paper Kainchi!",
      });
    } catch (error) {
      console.error('Error loading model:', error);
      toast({
        title: "Error",
        description: "Failed to load AI model. Please check the model files.",
        variant: "destructive",
      });
    } finally {
      setIsModelLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 224, height: 224 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const getCounterMove = (move: Move): Move => {
    const counterMoves = {
      rock: 'paper' as Move,
      paper: 'scissor' as Move,
      scissor: 'rock' as Move,
      godmode: 'godmode' as Move
    };
    return counterMoves[move];
  };

  const determineWinner = (userMove: Move, aiMove: Move): GameResult => {
    if (userMove === 'godmode') {
      return aiMove === 'godmode' ? 'tie' : 'win';
    }
    if (aiMove === 'godmode') {
      return 'lose';
    }
    
    if (userMove === aiMove) return 'tie';
    
    const winConditions = {
      rock: 'scissor',
      paper: 'rock',
      scissor: 'paper'
    };
    
    return winConditions[userMove as keyof typeof winConditions] === aiMove ? 'win' : 'lose';
  };

  const playBuzzer = useCallback(() => {
    if (buzzerRef.current && !buzzerPlaying) {
      setBuzzerPlaying(true);
      buzzerRef.current.currentTime = 0;
      buzzerRef.current.play()
        .then(() => {
          setTimeout(() => {
            if (buzzerRef.current) {
              buzzerRef.current.pause();
              buzzerRef.current.currentTime = 0;
            }
            setBuzzerPlaying(false);
          }, 2000);
        })
        .catch(error => {
          console.error('Error playing buzzer:', error);
          setBuzzerPlaying(false);
        });
    }
  }, [buzzerPlaying]);

  const predict = useCallback(async () => {
    if (model && videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 224;
        canvas.height = 224;
        ctx.drawImage(videoRef.current, 0, 0, 224, 224);
        
        const prediction = await model.predict(canvas);
        setPredictions(prediction);
        
        const maxPrediction = prediction.reduce((prev, current) => 
          (prev.probability > current.probability) ? prev : current
        );
        
        if (maxPrediction.probability > 0.7) {
          const detectedMove = maxPrediction.className.toLowerCase() as Move;
          
          if (detectedMove === 'godmode') {
            setGodmodeTimer(prev => {
              const newTimer = prev + 1;
              if (newTimer >= 5 && !isGodmodeActive) {
                setIsGodmodeActive(true);
                playBuzzer();
                setTimeout(() => setIsGodmodeActive(false), 5000);
                return 0;
              }
              return newTimer;
            });
          } else {
            setGodmodeTimer(0);
          }
          
          if (isGameActive && detectedMove !== userMove) {
            setUserMove(detectedMove);
            const counter = getCounterMove(detectedMove);
            setAiMove(counter);
            
            const result = determineWinner(detectedMove, counter);
            setGameResult(result);
            
            if (result === 'win') {
              setScore(prev => ({ ...prev, user: prev.user + 1 }));
            } else if (result === 'lose') {
              setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
            }
            
            setTimeout(() => {
              setUserMove(null);
              setAiMove(null);
              setGameResult(null);
            }, 3000);
          }
        }
      }
    }
  }, [model, isGameActive, userMove, isGodmodeActive, playBuzzer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive && model) {
      interval = setInterval(predict, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive, model, predict]);

  const startGame = async () => {
    if (!model) {
      await initModel();
    }
    await startCamera();
    setIsGameActive(true);
    toast({
      title: "Game Started!",
      description: "Show your move to the camera!",
    });
  };

  const stopGame = () => {
    setIsGameActive(false);
    stopCamera();
    setUserMove(null);
    setAiMove(null);
    setGameResult(null);
    setGodmodeTimer(0);
    setIsGodmodeActive(false);
  };

  const resetScore = () => {
    setScore({ user: 0, ai: 0 });
  };

  const getMoveEmoji = (move: Move | null) => {
    const moveImages = {
      rock: '/models/rock.svg',
      paper: '/models/paper.svg',
      scissor: '/models/scissor.svg',
      godmode: '/models/godmode.svg'
    };
    return move ? moveImages[move] : null;
  };

  const getResultColor = (result: GameResult | null) => {
    switch (result) {
      case 'win': return 'text-rainbow-green';
      case 'lose': return 'text-rainbow-red';
      case 'tie': return 'text-rainbow-yellow';
      default: return 'text-foreground';
    }
  };

  if (showSplash) {
    return <SplashScreen onStart={handleSplashStart} />;
  }

  return (
    <div className="min-h-screen bg-game-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-rainbow-red via-rainbow-yellow via-rainbow-green via-rainbow-blue to-rainbow-violet bg-clip-text text-transparent animate-rainbow-glow">
            Rock Paper Kainchi
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-powered hand gesture recognition game
          </p>
        </div>

        {/* Score Board */}
        <Card className="mb-8 p-6 bg-game-card border-2 animate-rainbow-border">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-rainbow-blue">You</h3>
              <p className="text-4xl font-bold">{score.user}</p>
            </div>
            <div className="text-center">
              <Button
                onClick={resetScore}
                variant="outline"
                size="sm"
                className="border-rainbow-violet text-rainbow-violet hover:bg-rainbow-violet hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-rainbow-red">AI</h3>
              <p className="text-4xl font-bold">{score.ai}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <Card className="p-6 bg-game-card">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold mb-2">Camera Feed</h2>
              {isGodmodeActive && (
                <div className="mb-4 p-3 bg-rainbow-violet text-white rounded-lg animate-pulse-glow">
                  🔥 GODMODE ACTIVATED! 🔥
                </div>
              )}
            </div>
            
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden mb-4">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="hidden"
                width="224"
                height="224"
              />
              
              {godmodeTimer > 0 && godmodeTimer < 5 && (
                <div className="absolute top-4 right-4 bg-rainbow-violet text-white px-3 py-1 rounded-full">
                  Godmode: {godmodeTimer}/5
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              {!isGameActive ? (
                <Button
                  onClick={startGame}
                  disabled={isModelLoading}
                  className="bg-rainbow-green hover:bg-rainbow-blue text-white"
                >
                  {isModelLoading ? (
                    'Loading AI...'
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={stopGame}
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Game
                </Button>
              )}
            </div>
          </Card>

          {/* Game Results Section */}
          <Card className="p-6 bg-game-card">
            <h2 className="text-2xl font-bold text-center mb-6">Game Results</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Your Move */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3 text-rainbow-blue">Your Move</h3>
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                  {userMove && getMoveEmoji(userMove) ? (
                    <img 
                      src={getMoveEmoji(userMove)!} 
                      alt={userMove} 
                      className="w-16 h-16"
                    />
                  ) : (
                    <span className="text-2xl">?</span>
                  )}
                </div>
                <p className="mt-2 capitalize font-medium">{userMove || 'Waiting...'}</p>
              </div>

              {/* AI Move */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-3 text-rainbow-red">AI's Counter</h3>
                <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                  {aiMove && getMoveEmoji(aiMove) ? (
                    <img 
                      src={getMoveEmoji(aiMove)!} 
                      alt={aiMove} 
                      className="w-16 h-16"
                    />
                  ) : (
                    <span className="text-2xl">?</span>
                  )}
                </div>
                <p className="mt-2 capitalize font-medium">{aiMove || 'Thinking...'}</p>
              </div>
            </div>

            {/* Result */}
            {gameResult && (
              <div className={`text-center text-2xl font-bold ${getResultColor(gameResult)} animate-pulse-glow`}>
                {gameResult === 'win' && '🎉 You Win!'}
                {gameResult === 'lose' && '🤖 AI Wins!'}
                {gameResult === 'tie' && '🤝 It\'s a Tie!'}
              </div>
            )}

            {/* Predictions */}
            {predictions.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">AI Confidence:</h4>
                <div className="space-y-1">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="capitalize">{prediction.className}</span>
                      <span>{(prediction.probability * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8 p-6 bg-game-card">
          <h3 className="text-lg font-bold mb-3">How to Play:</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Click "Start Game" to begin</li>
            <li>Show your hand gesture to the camera (rock, paper, or scissors)</li>
            <li>The AI will automatically detect your move and play its counter</li>
            <li>Hold "godmode" gesture for 5 seconds to activate special mode</li>
            <li>Rock beats Scissors, Scissors beats Paper, Paper beats Rock</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default RockPaperKainchi;
