type GameResultProps = {
  title: string;
  subtitle: string;
  onRestart: () => void;
  onExitMenu: () => void;
  bloody?: boolean;
};

export function GameResult({ title, subtitle, onRestart, onExitMenu, bloody = false }: GameResultProps) {
  return (
    <div className={`game-result ${bloody ? 'game-result--bloody' : ''}`}>
      <strong>{title}</strong>
      <span>{subtitle}</span>
      <div>
        <button onClick={onRestart}>НАЧАТЬ ЗАНОВО</button>
        <button onClick={onExitMenu}>ВЫЙТИ В МЕНЮ</button>
      </div>
    </div>
  );
}
