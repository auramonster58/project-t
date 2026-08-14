import { ScreamerEffects } from './ScreamerEffects';

export function ChestMimicScreamer() {
  return <div className="mimic-screamer" role="alert">
    <ScreamerEffects />
    <div className="mimic-face">
      <i className="mimic-eye mimic-eye--left"><b /></i>
      <i className="mimic-eye mimic-eye--right"><b /></i>
      <div className="mimic-mouth">
        <span className="mimic-teeth mimic-teeth--top"><b /><b /><b /><b /><b /><b /><b /><b /></span>
        <i className="mimic-tongue" />
        <span className="mimic-teeth mimic-teeth--bottom"><b /><b /><b /><b /><b /><b /><b /></span>
      </div>
    </div>
    <strong>ТЫ ОТКРЫЛ НЕ ТОТ СУНДУК</strong>
  </div>;
}
