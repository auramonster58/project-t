type KnightProps = {
  weapon: 'sword' | 'crossbow';
  screenX: number;
  y: number;
  facing: 1 | -1;
  isMoving: boolean;
  isAttacking: boolean;
};

export function Knight({ weapon, screenX, y, facing, isMoving, isAttacking }: KnightProps) {
  const isSwordStrike = weapon === 'sword' && isAttacking;
  const className = [
    'knight',
    isMoving ? 'knight--moving' : '',
    isAttacking ? 'knight--attacking' : '',
    weapon === 'crossbow' ? 'knight--crossbow' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={className} style={{ left: screenX, top: `${y}%`, '--facing': facing, zIndex: 101 } as React.CSSProperties}>
      <div className="attack-flash" />
      <img
        className={isSwordStrike ? 'knight-strike' : 'knight-idle'}
        src={weapon === 'crossbow' ? '/assets/knight-crossbow.png'
          : isSwordStrike ? '/assets/knight-strike.png' : '/assets/knight-portrait.png'}
        alt={weapon === 'sword' ? 'Тёмный рыцарь с мечом' : 'Тёмный рыцарь с арбалетом'}
        draggable={false}
      />
      <span className="knight-shadow" />
    </div>
  );
}
