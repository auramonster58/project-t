type BranchPrinceProps = {
  following?: boolean;
  standing?: boolean;
  facing?: 1 | -1;
  isMoving?: boolean;
  left?: number;
  top?: string;
};

export function BranchPrince({ following = false, standing = false, facing = 1,
  isMoving = false, left, top }: BranchPrinceProps) {
  const mode = following ? 'following' : standing ? 'standing' : 'waiting';
  return (
    <div
      className={`branch-prince branch-prince--${mode} ${isMoving ? 'branch-prince--moving' : ''}`}
      style={{ left, top, '--prince-facing': facing } as React.CSSProperties}
    >
      <img src="/assets/rescued-prince.png" alt="Спасённый принц" />
      {!following && !standing && <span>ПРИНЦ</span>}
    </div>
  );
}
