import type { WardrobeData } from '../../lib/gameData';

type WardrobeProps = WardrobeData & { occupied: boolean };

export function Wardrobe({ x, y, occupied }: WardrobeProps) {
  return (
    <div className={`wardrobe ${occupied ? 'wardrobe--occupied' : ''}`}
      style={{ left: x, top: `${y}%`, zIndex: Math.round(y) + 8 }}>
      <span className="wardrobe-crown" />
      <span className="wardrobe-door wardrobe-door--left"><i /></span>
      <span className="wardrobe-door wardrobe-door--right"><i /></span>
      {occupied && <b aria-hidden="true">••</b>}
    </div>
  );
}
