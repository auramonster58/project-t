import { Link } from 'wouter';

type GameMenuProps = {
  title: string;
  subtitle: string;
  primaryLabel: string;
  onPrimary: () => void;
};

export function GameMenu({ title, subtitle, primaryLabel, onPrimary }: GameMenuProps) {
  return (
    <main className="game-page game-menu-screen">
      <div className="game-menu-panel">
        <span>HORROR ACTION</span>
        <h1>RE:TURN</h1>
        <h2>{title}</h2>
        <p>{subtitle}</p>
        <button onClick={onPrimary}>{primaryLabel}</button>
        <Link href="/">НА ГЛАВНУЮ</Link>
      </div>
    </main>
  );
}
