import type { CSSProperties } from 'react';
import type { MovementDirection, SpriteAnimationName, SpriteSheet } from '../../lib/spriteData';

type PixelSpriteProps = {
  animation: SpriteAnimationName;
  className?: string;
  direction?: MovementDirection;
  frameOverride?: number;
  sheet: SpriteSheet;
};

const DIRECTION_FRAME: Record<MovementDirection, number> = { down: 0, right: 1, up: 2, left: 3 };
const ACTION_POSE: Partial<Record<SpriteAnimationName, number>> = {
  attack1: 2,
  attack2: 2,
  attack3: 2,
  attack4: 2,
  damage: 1,
  dead: 0,
  block: 1,
  victory: 0,
};

export function PixelSprite({ animation, className = '', direction, frameOverride, sheet }: PixelSpriteProps) {
  const selected = sheet.animations[animation] ?? sheet.animations.idle;
  if (!selected) return null;
  const usesDirection = Boolean(direction && ['idle', 'walk', 'run'].includes(animation));
  const requestedIndex = frameOverride ?? (direction && usesDirection
    ? DIRECTION_FRAME[direction]
    : ACTION_POSE[animation] ?? 0);
  const frame = selected.frames[Math.min(requestedIndex, selected.frames.length - 1)];
  const xPosition = frame.x / Math.max(1, sheet.width - frame.width) * 100;
  const yPosition = frame.y / Math.max(1, sheet.height - frame.height) * 100;
  const style: CSSProperties = {
    backgroundImage: `url(${sheet.src})`,
    backgroundPosition: `${xPosition}% ${yPosition}%`,
    backgroundSize: `${sheet.width / frame.width * 100}% ${sheet.height / frame.height * 100}%`,
  };
  return <span className={`pixel-sprite ${className}`} style={style} aria-hidden="true" />;
}
