export type ArrowData = {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  flightMs?: number;
  hostile?: boolean;
};

export function ArrowShot({ arrow }: { arrow: ArrowData }) {
  const verticalPixels = (arrow.targetY - arrow.y) * window.innerHeight / 100;
  const angle = Math.atan2(verticalPixels, arrow.targetX - arrow.x) * 180 / Math.PI;
  return (
    <span className={`arrow-shot ${arrow.hostile ? 'arrow-shot--hostile' : ''}`} style={{
      left: arrow.x,
      top: `${arrow.y}%`,
      '--arrow-x': `${arrow.targetX - arrow.x}px`,
      '--arrow-y': `${arrow.targetY - arrow.y}vh`,
      '--arrow-angle': `${angle}deg`,
      '--arrow-duration': `${arrow.flightMs ?? 280}ms`,
    } as React.CSSProperties}>➤</span>
  );
}
