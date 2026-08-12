type TouchControlsProps = {
  onMove: (directionX: -1 | 0 | 1, directionY: -1 | 0 | 1) => void;
  onAttack: () => void;
};

export function TouchControls({ onMove, onAttack }: TouchControlsProps) {
  return (
    <div className="touch-controls">
      <div className="move-pad">
        <button onPointerDown={() => onMove(0, -1)} aria-label="Идти вверх">↑</button>
        <button onPointerDown={() => onMove(-1, 0)} aria-label="Идти влево">←</button>
        <button onPointerDown={() => onMove(1, 0)} aria-label="Идти вправо">→</button>
        <button onPointerDown={() => onMove(0, 1)} aria-label="Идти вниз">↓</button>
      </div>
      <div>
        <button className="attack-button" onPointerDown={onAttack} aria-label="Удар">⚔</button>
      </div>
    </div>
  );
}
