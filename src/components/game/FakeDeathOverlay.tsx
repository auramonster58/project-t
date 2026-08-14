import { horrorMonsterSheet, restoredCrossbowKnightSheet,
  restoredSwordKnightSheet } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

export function FakeDeathOverlay({ weapon }: { weapon: 'sword' | 'crossbow' }) {
  return (
    <div className="skeleton-devour" role="alert">
      <span className="skeleton-devour__noise" aria-hidden="true" />
      <div className="skeleton-devour__beast">
        <PixelSprite animation="screamer" sheet={horrorMonsterSheet} />
        <span className="skeleton-devour__mouth">
          <i>{Array.from({ length: 7 }, (_, tooth) => <b key={`top-${tooth}`} />)}</i>
          <i>{Array.from({ length: 7 }, (_, tooth) => <b key={`bottom-${tooth}`} />)}</i>
        </span>
      </div>
      <div className="skeleton-devour__victim">
        <PixelSprite animation="damage"
          sheet={weapon === 'sword' ? restoredSwordKnightSheet : restoredCrossbowKnightSheet} />
      </div>
      <span className="skeleton-devour__camera" aria-hidden="true" />
      <span className="skeleton-devour__bite" aria-hidden="true" />
      <strong>УКУС</strong>
    </div>
  );
}
