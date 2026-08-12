import { Link } from 'wouter';

type GameHudProps = {
  playerHealth: number;
  enemyHealth: number;
  showDamage: boolean;
};

export function GameHud({ playerHealth, enemyHealth, showDamage }: GameHudProps) {
  return (
    <>
      <div className="game-hud">
        <Link href="/" className="back-button" aria-label="На главную">←</Link>
        <img src="/assets/knight-portrait.png" alt="Портрет рыцаря" />
        <div className="hero-status">
          <strong>ТЕНЕВОЙ РЫЦАРЬ</strong>
          <div className="health"><span style={{ width: `${playerHealth}%` }} /></div>
        </div>
      </div>
      <div className="enemy-status">
        <strong>СТРАЖ ВОРОТ</strong>
        <div className="enemy-health"><span style={{ width: `${enemyHealth}%` }} /></div>
      </div>
      {showDamage && <div className="damage-number">−25</div>}
    </>
  );
}
