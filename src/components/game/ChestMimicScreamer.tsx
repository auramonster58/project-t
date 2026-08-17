import { restoredCrossbowKnightSheet, restoredSwordKnightSheet } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

type ChestScreamerProps = {
  originX: number;
  originY: number;
  weapon: 'sword' | 'crossbow';
};

export function ChestMimicScreamer({ originX, originY, weapon }: ChestScreamerProps) {
  const style = { '--chest-x': `${originX}px`, '--chest-y': `${originY}%` } as React.CSSProperties;
  return <div className="chest-skeleton-scare" style={style} role="alert">
    <span className="chest-skeleton-scare__shade" />
    <div className="chest-skeleton-scare__monster">
      <img className="chest-skeleton-scare__image" src="/assets/skeleton-mouth-screamer.png" alt="" />
    </div>
    <div className="chest-skeleton-scare__victim">
      <PixelSprite animation="damage"
        sheet={weapon === 'sword' ? restoredSwordKnightSheet : restoredCrossbowKnightSheet} />
    </div>
    <span className="chest-skeleton-scare__bite" />
    <strong>ОН БЫЛ ЗА СУНДУКОМ</strong>
  </div>;
}
