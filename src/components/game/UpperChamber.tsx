export function UpperChamber({ isUnlocked }: { isUnlocked: boolean }) {
  return (
    <div className="upper-chamber">
      <div className="upper-chamber__floor" />
      <div className={`upper-chamber__door ${isUnlocked ? 'upper-chamber__door--open' : 'upper-chamber__door--locked'}`}>
        <span>{isUnlocked ? 'ОТКРЫТО' : 'ЗАПЕРТО'}</span>
        {!isUnlocked && <i className="upper-chamber__lock">◆</i>}
      </div>
      <div className="upper-chamber__carpet">
        <i /><i /><i />
      </div>
      <span className="upper-chamber__rune">◇</span>
      <span className="upper-chamber__rune upper-chamber__rune--right">◇</span>
      <div className="upper-chamber__chest">
        <i className="chest-lid" />
        <i className="chest-body" />
        <b>◆</b>
      </div>
    </div>
  );
}
