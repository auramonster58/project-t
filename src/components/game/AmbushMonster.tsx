import type { AmbusherData } from '../../hooks/usePassageAmbush';
import { horrorMonsterSheet } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

type AmbushMonsterProps = { monster: AmbusherData; bossMode: boolean };

export function AmbushMonster({ monster, bossMode }: AmbushMonsterProps) {
  const animation = monster.health === 0 ? 'dead' : monster.isHit ? 'damage' : 'run';
  return (
    <div className={`ambush-monster ambush-monster--${animation}`}
      style={{ left: monster.x, top: `${monster.y}%`, '--monster-facing': monster.facing } as React.CSSProperties}>
      <PixelSprite animation={animation} sheet={horrorMonsterSheet} />
      <small>{bossMode ? `${monster.health}%` : 'БЕССМЕРТЕН'}</small>
    </div>
  );
}
