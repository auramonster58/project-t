type KnightProps = {
  screenX: number;
  y: number;
  facing: 1 | -1;
  isMoving: boolean;
  isAttacking: boolean;
};

export function Knight({ screenX, y, facing, isMoving, isAttacking }: KnightProps) {
  const className = [
    'knight',
    isMoving ? 'knight--moving' : '',
    isAttacking ? 'knight--attacking' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} style={{ left: screenX, top: `${y}%`, '--facing': facing, zIndex: Math.round(y) + 20 } as React.CSSProperties}>
      <div className="attack-flash" />
      <img
        className={isAttacking ? 'knight-strike' : 'knight-idle'}
        src={isAttacking ? '/assets/knight-strike.png' : '/assets/knight-portrait.png'}
        alt="Тёмный рыцарь с мечом"
        draggable={false}
      />
      <span className="knight-shadow" />
    </div>
  );
}
