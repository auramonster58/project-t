import { useEffect, useRef } from 'react';

type TouchControlsProps = {
  onMove: (directionX: -1 | 0 | 1, directionY: -1 | 0 | 1) => void;
  onAttack: () => void;
};

export function TouchControls({ onMove, onAttack }: TouchControlsProps) {
  const moveTimer = useRef<number>();

  const stopMoving = () => window.clearInterval(moveTimer.current);
  const startMoving = (x: -1 | 0 | 1, y: -1 | 0 | 1) => (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    stopMoving();
    onMove(x, y);
    moveTimer.current = window.setInterval(() => onMove(x, y), 70);
  };

  useEffect(() => stopMoving, []);

  return (
    <div className="touch-controls">
      <div className="move-pad">
        <button onPointerDown={startMoving(0, -1)} onPointerUp={stopMoving} onPointerCancel={stopMoving} aria-label="Идти вверх">↑</button>
        <button onPointerDown={startMoving(-1, 0)} onPointerUp={stopMoving} onPointerCancel={stopMoving} aria-label="Идти влево">←</button>
        <button onPointerDown={startMoving(1, 0)} onPointerUp={stopMoving} onPointerCancel={stopMoving} aria-label="Идти вправо">→</button>
        <button onPointerDown={startMoving(0, 1)} onPointerUp={stopMoving} onPointerCancel={stopMoving} aria-label="Идти вниз">↓</button>
      </div>
      <div>
        <button className="attack-button" onPointerDown={(event) => { event.preventDefault(); onAttack(); }} aria-label="Удар">⚔</button>
      </div>
    </div>
  );
}
