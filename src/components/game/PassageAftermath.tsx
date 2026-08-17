import { horrorMonsterSheet } from '../../lib/spriteData';
import { PixelSprite } from './PixelSprite';

export function PassageAftermath({ guardsReleased }: { guardsReleased: boolean }) {
  return (
    <div className="passage-aftermath">
      <DecoyMonster side="left" guardsReleased={guardsReleased} />
      <div className="abandoned-armor">
        <img src="/assets/return-armor.png" alt="" />
      </div>
      <DecoyMonster side="right" guardsReleased={guardsReleased} />
    </div>
  );
}

function DecoyMonster({ side, guardsReleased }: { side: 'left' | 'right'; guardsReleased: boolean }) {
  return (
    <div className={`sleeping-monster sleeping-monster--${side} ${guardsReleased ? 'sleeping-monster--released' : ''}`}>
      <PixelSprite animation={guardsReleased ? 'victory' : 'idle'} sheet={horrorMonsterSheet} />
    </div>
  );
}
