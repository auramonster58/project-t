import { useEffect, useState, type CSSProperties } from 'react';
import type { MovementDirection, SpriteAnimationName, SpriteSheet } from '../../lib/spriteData';

type PixelSpriteProps = {
  animation: SpriteAnimationName;
  className?: string;
  direction?: MovementDirection;
  frameOverride?: number;
  sheet: SpriteSheet;
  animateFrames?: boolean;
};

// На карточках порядок ракурсов такой: вниз, влево, вверх, вправо.
const DIRECTION_FRAME: Record<MovementDirection, number> = { down: 0, left: 1, up: 2, right: 3 };
const DIRECTIONAL_ANIMATIONS: SpriteAnimationName[] = ['idle', 'walk', 'run'];

export function PixelSprite({ animation, className = '', direction, frameOverride, sheet,
  animateFrames = false }: PixelSpriteProps) {
  const selected = sheet.animations[animation] ?? sheet.animations.idle;
  const [animatedFrame, setAnimatedFrame] = useState(0);

  useEffect(() => {
    setAnimatedFrame(0);
    if (!selected || (DIRECTIONAL_ANIMATIONS.includes(animation) && !animateFrames)
      || frameOverride !== undefined || selected.frames.length < 2) return;

    let currentFrame = 0;
    const timer = window.setInterval(() => {
      const lastFrame = selected.frames.length - 1;
      if (currentFrame === lastFrame && selected.loop === false) {
        window.clearInterval(timer);
        return;
      }
      currentFrame = currentFrame === lastFrame ? 0 : currentFrame + 1;
      setAnimatedFrame(currentFrame);
    }, selected.frameMs);
    return () => window.clearInterval(timer);
  }, [animateFrames, animation, frameOverride, selected]);

  if (!selected) return null;
  const usesDirection = DIRECTIONAL_ANIMATIONS.includes(animation);
  const requestedIndex = frameOverride ?? (usesDirection && animateFrames
    ? animatedFrame : direction && usesDirection
    ? DIRECTION_FRAME[direction]
    : usesDirection ? 0 : animatedFrame);
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
