import { useRef } from 'react';
import { archerSheet, horrorMonsterSheet, swordsmanGuardSheet,
  type SpriteAnimationName, type SpriteSheet } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

export type GuardAttackPhase = 'idle' | 'windup' | 'strike' | 'hit';
export type EnemyData = {
  id: number;
  room: number;
  x: number;
  y: number;
  health: number;
  kind: 'guard' | 'archer' | 'monster';
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
  const isPassageMonster = enemy.kind === 'monster';
  const animation = selectEnemyAnimation(enemy, attackPhase, isShooting, isHit);
  const sheet = selectEnemySheet(enemy.kind);
  const classes = [
    'gate-guard', `gate-guard--${enemy.kind}`, `gate-guard--${animation}`,
    isPassageMonster ? 'gate-guard--passage-monster' : '', isRevealed ? 'gate-guard--revealed' : '',
    isHit ? 'gate-guard--hit' : '', isHidden && !isPassageMonster ? 'gate-guard--hidden' : '',
    enemy.health === 0 ? 'gate-guard--defeated' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={{ left: enemy.x, top: `${enemy.y}%`, zIndex: Math.round(enemy.y) + 10,
      '--enemy-facing': displayedFacing, '--enemy-shift': `${displayedFacing * 24}px`,
      '--hit-shift': `${displayedFacing * -9}px` } as React.CSSProperties}>
      {(isTargeted || isRevealed || isHit) && enemy.health > 0
        && <span className="local-enemy-health"><i style={{ width: `${enemy.health}%` }} /></span>}
      <PixelSprite animation={animation}
        direction={enemy.kind !== 'archer' ? (displayedFacing < 0 ? 'left' : 'right') : undefined}
        sheet={sheet} animateFrames={enemy.health > 0} />
      {(attackPhase === 'windup' || attackPhase === 'hit')
        && <span className="guard-attack-effect">{attackPhase === 'windup' ? '!' : '−12'}</span>}
    </div>
  );
}

function selectEnemySheet(kind: EnemyData['kind']): SpriteSheet {
  if (kind === 'archer') return archerSheet;
  if (kind === 'monster') return horrorMonsterSheet;
  return swordsmanGuardSheet;
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
