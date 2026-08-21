import { useEffect, useRef } from 'react';

type TouchControlsProps = {
  onMove: (directionX: -1 | 0 | 1, directionY: -1 | 0 | 1, stepScale?: number) => void;
  onAttack: () => void;
};

export function TouchControls({ onMove, onAttack }: TouchControlsProps) {
  const moveFrame = useRef<number>();

  const clearMoveFrame = () => {
    if (moveFrame.current !== undefined) window.cancelAnimationFrame(moveFrame.current);
  };
  const stopMoving = () => {
    clearMoveFrame();
    onMove(0, 0);
  };
  const startMoving = (x: -1 | 0 | 1, y: -1 | 0 | 1) => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    clearMoveFrame();
    onMove(x, y);
    let previous = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(now - previous, 32);
      previous = now;
      onMove(x, y, elapsed / 70);
      moveFrame.current = window.requestAnimationFrame(tick);
    };
    moveFrame.current = window.requestAnimationFrame(tick);
  };

  useEffect(() => clearMoveFrame, []);

  return (
    <div className="touch-controls">
      <div className="move-pad">
        <button className="move-up" onPointerDown={startMoving(0, -1)} onPointerUp={stopMoving} onPointerCancel={stopMoving} onLostPointerCapture={stopMoving} aria-label="Идти вверх">↑</button>
        <button className="move-left" onPointerDown={startMoving(-1, 0)} onPointerUp={stopMoving} onPointerCancel={stopMoving} onLostPointerCapture={stopMoving} aria-label="Идти влево">←</button>
        <button className="move-right" onPointerDown={startMoving(1, 0)} onPointerUp={stopMoving} onPointerCancel={stopMoving} onLostPointerCapture={stopMoving} aria-label="Идти вправо">→</button>
        <button className="move-down" onPointerDown={startMoving(0, 1)} onPointerUp={stopMoving} onPointerCancel={stopMoving} onLostPointerCapture={stopMoving} aria-label="Идти вниз">↓</button>
      </div>
      <div>
        <button className="attack-button" onPointerDown={(event) => { event.preventDefault(); onAttack(); }} aria-label="Удар">⚔</button>
      </div>
    </div>
  );
}
