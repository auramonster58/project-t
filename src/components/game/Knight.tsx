import { useEffect, useRef, useState } from 'react';
import { restoredCrossbowKnightSheet, restoredSwordKnightSheet, type MovementDirection,
  type SpriteAnimationName } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

type KnightProps = {
  weapon: 'sword' | 'crossbow';
  screenX: number;
  y: number;
  facing: 1 | -1;
  direction: MovementDirection;
  health: number;
  isMoving: boolean;
  isRunning: boolean;
  isAttacking: boolean;
  isBlocking: boolean;
  isVictorious: boolean;
  attackSequence: number;
};

export function Knight(props: KnightProps) {
  const { weapon, screenX, y, facing, health, isMoving, isRunning, isAttacking,
    isBlocking, isVictorious, attackSequence } = props;
  const previousHealth = useRef(health);
  const [isDamaged, setIsDamaged] = useState(false);

  useEffect(() => {
    if (health <= 0 || health >= previousHealth.current) {
      previousHealth.current = health;
      return;
    }
    previousHealth.current = health;
    setIsDamaged(true);
    const timer = window.setTimeout(() => setIsDamaged(false), 420);
    return () => window.clearTimeout(timer);
  }, [health]);

  const animation = selectAnimation({ weapon, health, isDamaged, isAttacking,
    attackSequence, isMoving, isRunning, isBlocking, isVictorious });
  const className = ['knight', `knight--${animation}`, `knight--${weapon}`].join(' ');
  const sheet = weapon === 'sword' ? restoredSwordKnightSheet : restoredCrossbowKnightSheet;
  const modelFacing = facing;

  return (
    <div className={className} style={{ left: screenX, top: `${y}%`, '--facing': facing,
      '--model-facing': modelFacing, '--attack-shift': `${facing * 24}px`,
      '--hit-shift': `${facing * -8}px`,
      zIndex: 101 } as React.CSSProperties}>
      <span className="attack-flash" />
      <PixelSprite animation={animation} sheet={sheet} animateFrames />
      <span className="knight-shadow" />
    </div>
  );
}

function selectAnimation(state: Omit<KnightProps, 'screenX' | 'y' | 'facing' | 'direction'> & { isDamaged: boolean }) {
  if (state.health === 0) return 'dead' satisfies SpriteAnimationName;
  if (state.isDamaged) return 'damage' satisfies SpriteAnimationName;
  if (state.isVictorious) return 'victory' satisfies SpriteAnimationName;
  if (state.isAttacking) {
    if (state.weapon === 'sword') return state.attackSequence % 2 ? 'attack1' : 'attack2';
    return 'attack1' satisfies SpriteAnimationName;
  }
  if (state.isBlocking) return 'block' satisfies SpriteAnimationName;
  if (state.isRunning) return 'run' satisfies SpriteAnimationName;
  if (state.isMoving) return 'walk' satisfies SpriteAnimationName;
  return 'idle' satisfies SpriteAnimationName;
}
