import { Link } from 'wouter';
import type { Session } from '@supabase/supabase-js';
import { NeonPatterns } from '../NeonPatterns';
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
        <Link href="/">НА ГЛАВНУЮ</Link>
      </div>
    </main>
  );
}
