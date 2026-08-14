import { ScreamerEffects } from './ScreamerEffects';

export function UpperRoomScreamer() {
  return (
    <div className="upper-room-screamer" role="alert">
      <ScreamerEffects />
      <div className="screamer-monster">
        <i className="screamer-horn screamer-horn--left" />
        <i className="screamer-horn screamer-horn--right" />
        <i className="screamer-eye screamer-eye--left"><b /></i>
        <i className="screamer-eye screamer-eye--right"><b /></i>
        <em className="screamer-scar" />
        <span className="screamer-maw">
          <span><b /><b /><b /><b /><b /><b /></span>
          <i />
          <span><b /><b /><b /><b /><b /><b /></span>
        </span>
      </div>
      <strong>БЕГИ</strong>
      <small>ОНО ВСЁ ВРЕМЯ БЫЛО ЗА ТОБОЙ</small>
    </div>
  );
}
