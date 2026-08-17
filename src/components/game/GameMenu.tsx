import { useState } from 'react';
import { Link } from 'wouter';
import type { Session } from '@supabase/supabase-js';
import { NeonPatterns } from '../NeonPatterns';
import { AchievementsPanel } from './AchievementsPanel';
import { MenuRegistration } from './MenuRegistration';

type GameMenuProps = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimary: () => void;
  session: Session | null;
  authReady: boolean;
};

export function GameMenu({ title, subtitle, primaryLabel, onPrimary, session, authReady }: GameMenuProps) {
  const canStart = authReady && Boolean(session);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  return (
    <main className="game-page game-menu-screen">
      <NeonPatterns />
      <MenuRegistration session={session} />
      <div className="game-menu-panel">
        <span>HORROR ACTION</span>
        <h1>RE:TURN</h1>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <button onClick={onPrimary} disabled={!canStart}>
          {!authReady ? 'ПРОВЕРЯЕМ ВХОД…' : canStart ? primaryLabel : 'СНАЧАЛА ВОЙДИ'}
        </button>
        <button className="trophy-button" onClick={() => setAchievementsOpen(true)}>
          <span aria-hidden="true">🏆</span> ДОСТИЖЕНИЯ
        </button>
        <Link href="/">НА ГЛАВНУЮ</Link>
      </div>
      {achievementsOpen && <AchievementsPanel userId={session?.user.id}
        onClose={() => setAchievementsOpen(false)} />}
    </main>
  );
}
