type KeyDropProps = { x: number; y: number };

export function KeyDrop({ x, y }: KeyDropProps) {
  return <div className="key-drop" style={{ left: x, top: `${y}%` }}><span>◆</span><small>КЛЮЧ</small></div>;
}

type ExitPortalProps = { x: number; y: number; active: boolean };

export function ExitPortal({ x, y, active }: ExitPortalProps) {
  return (
    <div className={`exit-portal ${active ? 'exit-portal--active' : ''}`} style={{ left: x, top: `${y}%` }}>
      <span /><small>{active ? 'ВОЙТИ В КРУГ' : 'ДВЕРЬ ЗАКРЫТА'}</small>
    </div>
  );
}

type CastleTrapProps = { x: number; y: number };

export function CastleTrap({ x, y }: CastleTrapProps) {
  return (
    <div className="castle-trap" style={{ left: x, top: `${y}%` }}>
      <span>▲▲▲</span><small>ЛОВУШКА</small>
    </div>
  );
}
