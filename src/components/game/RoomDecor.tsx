type RoomDecorProps = { room: number };

export function RoomDecor({ room }: RoomDecorProps) {
  const variant = room % 3;
  return (
    <div className={`room-decor room-decor--${variant}`} aria-hidden="true">
      <div className="chandelier">
        <i className="chandelier-chain" />
        <span className="chandelier-frame"><b /><b /><b /><b /></span>
        <span className="chandelier-light" />
      </div>
      <div className="decor-rug" />
      <div className="decor-table"><i /><i /><span /></div>
      <div className="decor-chair decor-chair--left"><i /><i /></div>
      <div className="decor-chair decor-chair--right"><i /><i /></div>
      <div className="decor-bookshelf"><i /><i /><i /><i /><i /><i /></div>
      <div className="decor-barrels"><i /><i /><i /></div>
      <span className="decor-dust decor-dust--a" />
      <span className="decor-dust decor-dust--b" />
      <span className="decor-dust decor-dust--c" />
    </div>
  );
}
