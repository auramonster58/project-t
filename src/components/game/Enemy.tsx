import { useRef } from 'react';
import { archerSheet, swordKnightSheet, type SpriteAnimationName } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

export type GuardAttackPhase = 'idle' | 'windup' | 'strike' | 'hit';
export type EnemyData = {
  id: number;
  room: number;
  x: number;
  y: number;
  health: number;
  kind: 'guard' | 'archer';
  patrolDirection: 1 | -1;
};

type EnemyProps = {
  enemy: EnemyData;
  facing: 1 | -1;
  attackPhase: GuardAttackPhase;
  isShooting: boolean;
  isTargeted: boolean;
  isRevealed: boolean;
  isHit: boolean;
  isInLight: boolean;
};

export function Enemy(props: EnemyProps) {
  const { enemy, facing, attackPhase, isShooting, isTargeted, isRevealed, isHit, isInLight } = props;
  const lastLivingFacing = useRef(facing);
  if (enemy.health > 0) lastLivingFacing.current = facing;
  const displayedFacing = enemy.health === 0 ? lastLivingFacing.current : facing;
  const isHidden = !isInLight && !isRevealed && !isHit;
  const isSummonedGuard = enemy.id >= 9101 && enemy.id <= 9104;
  const animation = selectEnemyAnimation(enemy, attackPhase, isShooting, isHit);
  const classes = [
    'gate-guard', `gate-guard--${enemy.kind}`, `gate-guard--${animation}`,
    isSummonedGuard ? 'gate-guard--summoned' : '', isRevealed ? 'gate-guard--revealed' : '',
    isHit ? 'gate-guard--hit' : '', isHidden && !isSummonedGuard ? 'gate-guard--hidden' : '',
    enemy.health === 0 ? 'gate-guard--defeated' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ left: enemy.x, top: `${enemy.y}%`, zIndex: Math.round(enemy.y) + 10,
      '--enemy-facing': displayedFacing, '--enemy-shift': `${displayedFacing * 24}px`,
      '--hit-shift': `${displayedFacing * -9}px` } as React.CSSProperties}>
      {(isTargeted || isRevealed || isHit) && enemy.health > 0
        && <span className="local-enemy-health"><i style={{ width: `${enemy.health}%` }} /></span>}
      <PixelSprite animation={animation}
        direction={enemy.kind === 'guard' ? (displayedFacing < 0 ? 'left' : 'right') : undefined}
        frameOverride={enemy.kind === 'archer' && animation === 'idle' ? 1 : undefined}
        sheet={enemy.kind === 'archer' ? archerSheet : swordKnightSheet} />
      {(attackPhase === 'windup' || attackPhase === 'hit')
        && <span className="guard-attack-effect">{attackPhase === 'windup' ? '!' : '−12'}</span>}
    </div>
  );
}

function selectEnemyAnimation(enemy: EnemyData, phase: GuardAttackPhase,
  isShooting: boolean, isHit: boolean): SpriteAnimationName {
  if (enemy.health === 0) return 'dead';
  if (isHit || phase === 'hit') return 'damage';
  if (enemy.kind === 'archer' && isShooting) return 'attack1';
  if (phase === 'windup') return 'block';
  if (phase === 'strike') return enemy.id % 2 ? 'attack1' : 'attack2';
  return 'walk';
}
