type GameResultProps = {
  title: string;
  subtitle: string;
  onRestart: () => void;
  onExitMenu: () => void;
};

export function GameResult({ title, subtitle, onRestart, onExitMenu }: GameResultProps) {
  return (
    <div className="game-result">
      <strong>{title}</strong>
      <span>{subtitle}</span>
      <div>
        <button onClick={onRestart}>НАЧАТЬ ЗАНОВО</button>
        <button onClick={onExitMenu}>ВЫЙТИ В МЕНЮ</button>
      </div>
    </div>
  );
}
