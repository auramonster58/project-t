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
  isAttacking: boolean;
  isTargeted: boolean;
  isRevealed: boolean;
  isHit: boolean;
  isInLight: boolean;
};

export function Enemy({ enemy, facing, isAttacking, isTargeted, isRevealed, isHit, isInLight }: EnemyProps) {
  const isHidden = !isInLight && !isRevealed && !isHit;
  return (
    <div
      className={`gate-guard gate-guard--${enemy.kind} ${isAttacking ? 'gate-guard--attacking' : ''} ${isRevealed ? 'gate-guard--revealed' : ''} ${isHit ? 'gate-guard--hit' : ''} ${isHidden ? 'gate-guard--hidden' : ''} ${enemy.health === 0 ? 'gate-guard--defeated' : ''}`}
      style={{ left: enemy.x, top: `${enemy.y}%`, zIndex: Math.round(enemy.y) + 10,
        '--enemy-facing': facing } as React.CSSProperties}
    >
      {(isTargeted || isRevealed || isHit) && enemy.health > 0 && <span className="local-enemy-health"><i style={{ width: `${enemy.health}%` }} /></span>}
      {enemy.kind === 'archer' ? <img className="enemy-archer" src="/assets/knight-archer.png" alt="" /> : <>
        <span className="guard-head" /><span className="guard-body" /><span className="guard-spear" />
      </>}
    </div>
  );
}
