import '../../styles/newspaper-intro.css';

type NewspaperIntroProps = {
  onFinish: () => void;
  onExit: () => void;
};

export function NewspaperIntro({ onFinish, onExit }: NewspaperIntroProps) {
  return (
    <main className="newspaper-intro">
      <img
        className="missing-poster"
        src="/assets/missing-knight-poster.png"
        alt="Объявление о пропавшем рыцаре, вернувшемся в заброшенный замок"
      />
      <div className="newspaper-actions">
        <button onClick={onExit}>ВЕРНУТЬСЯ</button>
        <button onClick={onFinish}>ВОЙТИ В ЗАМОК</button>
      </div>
    </main>
  );
}
