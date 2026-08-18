type MetalHunterProps = { x: number; y: number; facing: 1 | -1 };

export function MetalHunter({ x, y, facing }: MetalHunterProps) {
  return (
    <div className="metal-hunter" style={{ left: x, top: `${y}%`, '--hunter-facing': facing } as React.CSSProperties}>
      <i className="hunter-vision" />
      <div className="hunter-body">
        <img src="/assets/skeleton-mouth-screamer.png" alt="" />
      </div>
      <small>СКРЕЖЕТ...</small>
    </div>
  );
}
