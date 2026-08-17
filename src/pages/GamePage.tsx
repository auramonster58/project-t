import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { GameMenu } from '../components/game/GameMenu';
import { NewspaperIntro } from '../components/game/NewspaperIntro';
import { clearGameSave } from '../lib/gameSave';
import { supabase } from '../lib/supabase';
import { GameSession } from './GameSession';

const BOSS_ACCOUNT_EMAIL = 'mapex5004@gmail.com';
type GameScreen = 'menu' | 'intro' | 'playing';

export function GamePage() {
  const [screen, setScreen] = useState<GameScreen>('menu');
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
      if (!nextSession) setScreen('menu');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const startGame = () => {
    if (!authSession) return;
    setScreen('intro');
  };

  const beginStory = () => {
    setGameRun((current) => current + 1);
    setScreen('playing');
  };

  const restartGame = async () => {
    if (!authSession) return;
    await clearGameSave(authSession.user.id).catch(() => undefined);
    setGameRun((current) => current + 1);
    setScreen('playing');
  };

  if (screen === 'menu' || !authSession) {
    return <GameMenu title="ГОТОВ К БОЮ?" subtitle="Пройди десять залов и доберись до Круга судьбы"
      primaryLabel="НАЧАТЬ ИГРУ" onPrimary={startGame} session={authSession} authReady={authReady} />;
  }

  if (screen === 'intro') {
    return <NewspaperIntro onFinish={beginStory} onExit={() => setScreen('menu')} />;
  }

  const isBossAccount = authSession.user.email?.toLowerCase() === BOSS_ACCOUNT_EMAIL;
  return <GameSession key={gameRun} userId={authSession.user.id} bossMode={isBossAccount}
    onRestart={restartGame} onExitMenu={() => setScreen('menu')} />;
}
