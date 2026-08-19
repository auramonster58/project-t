type BranchPrinceProps = {
  carried?: boolean;
  left?: number;
  top?: string;
};

export function BranchPrince({ carried = false, left, top }: BranchPrinceProps) {
  return (
    <div
      className={carried ? 'branch-prince branch-prince--carried' : 'branch-prince branch-prince--waiting'}
      style={{ left, top }}
    >
      <img src="/assets/rescued-prince.png" alt={carried ? 'Спасённый принц' : 'Принц ждёт помощи'} />
      {!carried && <span>ПРИНЦ</span>}
    </div>
  );
}
