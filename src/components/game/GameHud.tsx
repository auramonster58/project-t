import { Link } from 'wouter';
import { ROOM_COUNT } from '../../lib/gameData';
import { swordKnightSheet } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

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
        <span className="hud-pixel-portrait">
          <PixelSprite animation="idle" direction="down" sheet={swordKnightSheet} />
        </span>
        <div className="hero-status">
          <strong>ТЕНЕВОЙ РЫЦАРЬ</strong>
          <div className="health"><span style={{ width: `${playerHealth}%` }} /></div>
        </div>
      </div>
      {enemyHealth !== null && <div className="enemy-status">
        <strong>БЛИЖАЙШИЙ СТРАЖ</strong>
        <div className="enemy-health"><span style={{ width: `${enemyHealth}%` }} /></div>
      </div>}
      <div className="room-counter">ЗАЛ {room} / {ROOM_COUNT}</div>
      {shownDamage !== null && <div className="damage-number">−{shownDamage}</div>}
    </>
  );
}
