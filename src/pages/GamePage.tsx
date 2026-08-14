import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { GameMenu } from '../components/game/GameMenu';
import { clearGameSave } from '../lib/gameSave';
import { supabase } from '../lib/supabase';
import { GameSession } from './GameSession';

const BOSS_ACCOUNT_EMAIL = 'mapex5004@gmail.com';

export function GamePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameRun, setGameRun] = useState(0);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthSession(data.session);
      setAuthReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setAuthSession(nextSession);
      setAuthReady(true);
      if (!nextSession) setIsPlaying(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const startGame = () => {
    if (!authSession) return;
    setGameRun((current) => current + 1);
    setIsPlaying(true);
  };

  const restartGame = async () => {
    if (!authSession) return;
    await clearGameSave(authSession.user.id).catch(() => undefined);
    setGameRun((current) => current + 1);
    setIsPlaying(true);
  };

  if (!isPlaying || !authSession) {
    return <GameMenu title="ГОТОВ К БОЮ?" subtitle="Пройди десять залов и доберись до Круга судьбы"
      primaryLabel="НАЧАТЬ ИГРУ" onPrimary={startGame} session={authSession} authReady={authReady} />;
  }

  const isBossAccount = authSession.user.email?.toLowerCase() === BOSS_ACCOUNT_EMAIL;
  return <GameSession key={gameRun} userId={authSession.user.id} bossMode={isBossAccount}
    onRestart={restartGame} onExitMenu={() => setIsPlaying(false)} />;
}
