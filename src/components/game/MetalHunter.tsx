import { chasingSkeleton32BitSheet } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

type MetalHunterProps = { x: number; y: number; facing: 1 | -1 };

export function MetalHunter({ x, y, facing }: MetalHunterProps) {
  return (
    <div className="metal-hunter" style={{ left: x, top: `${y}%`, '--hunter-facing': facing } as React.CSSProperties}>
      <i className="hunter-vision" />
      <div className="hunter-body">
        <PixelSprite animation="run" sheet={chasingSkeleton32BitSheet} animateFrames />
      </div>
      <small>СКРЕЖЕТ...</small>
    </div>
  );
}
