import { Link } from 'wouter';
import { ROOM_COUNT } from '../../lib/gameData';

type GameHudProps = {
  playerHealth: number;
  enemyHealth: number | null;
  room: number;
  shownDamage: number | null;
};

export function GameHud({ playerHealth, enemyHealth, room, shownDamage }: GameHudProps) {
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
      {enemyHealth !== null && <div className="enemy-status">
        <strong>БЛИЖАЙШИЙ СТРАЖ</strong>
        <div className="enemy-health"><span style={{ width: `${enemyHealth}%` }} /></div>
      </div>}
      <div className="room-counter">КОМНАТА {room} / {ROOM_COUNT}</div>
      {shownDamage !== null && <div className="damage-number">−{shownDamage}</div>}
    </>
  );
}
