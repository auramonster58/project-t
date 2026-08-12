import { useState } from 'react';
import { GameMenu } from '../components/game/GameMenu';
import { GameSession } from './GameSession';

export function GamePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [session, setSession] = useState(0);

  const startGame = () => {
    setSession((current) => current + 1);
    setIsPlaying(true);
  };

  if (!isPlaying) {
    return <GameMenu title="ГОТОВ К БОЮ?" subtitle="Пройди десять залов и доберись до Круга судьбы"
      primaryLabel="НАЧАТЬ ИГРУ" onPrimary={startGame} />;
  }

  return <GameSession key={session} onRestart={startGame} onExitMenu={() => setIsPlaying(false)} />;
}
