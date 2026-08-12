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
