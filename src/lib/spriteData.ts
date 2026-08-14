export type SpriteAnimationName =
  | 'idle' | 'walk' | 'run' | 'attack1' | 'attack2' | 'attack3' | 'attack4'
  | 'damage' | 'dead' | 'block' | 'victory';
export type MovementDirection = 'left' | 'right' | 'up' | 'down';

export type SpriteFrame = { x: number; y: number; width: number; height: number };
export type SpriteAnimation = { frames: SpriteFrame[]; frameMs: number; loop?: boolean };
export type SpriteSheet = {
  src: string;
  width: number;
  height: number;
  animations: Partial<Record<SpriteAnimationName, SpriteAnimation>>;
};

const row = (xs: number[], y: number, width: number, height: number): SpriteFrame[] =>
  xs.map((x) => ({ x, y, width, height }));
const animation = (frames: SpriteFrame[], frameMs: number, loop = true): SpriteAnimation =>
  ({ frames, frameMs, loop });

export const swordKnightSheet: SpriteSheet = {
  src: '/assets/hero-sword-sheet-64bit-transparent.png', width: 1023, height: 1538,
  animations: {
    idle: animation(row([380, 515, 650, 790], 38, 130, 178), 300),
    walk: animation(row([380, 515, 650, 800], 245, 130, 180), 150),
    run: animation(row([380, 515, 650, 800], 440, 135, 185), 105),
    attack1: animation(row([15, 205, 395, 585, 785], 680, 190, 180), 78, false),
    attack2: animation(row([15, 210, 405, 600, 795], 885, 195, 180), 82, false),
    damage: animation(row([15, 135, 255, 375], 1100, 120, 150), 95, false),
    dead: animation(row([505, 625, 745, 865], 1100, 120, 155), 155, false),
    block: animation(row([15, 130, 245, 360], 1290, 115, 195), 140),
    victory: animation(row([500], 1270, 240, 230), 400),
  },
};

export const crossbowKnightSheet: SpriteSheet = {
  src: '/assets/hero-crossbow-sheet-64bit-transparent.png', width: 1024, height: 1536,
  animations: {
    idle: animation(row([405, 535, 665, 800], 38, 140, 180), 300),
    walk: animation(row([405, 535, 665, 800], 225, 140, 190), 150),
    run: animation(row([405, 535, 665, 800], 420, 145, 185), 105),
    attack1: animation(row([10, 210, 405, 600, 795], 605, 195, 165), 78, false),
    attack2: animation(row([10, 210, 405, 600, 795], 765, 195, 160), 78, false),
    attack3: animation(row([10, 210, 405, 600, 795], 920, 195, 165), 78, false),
    attack4: animation(row([10, 120, 230, 340], 1100, 110, 155), 95, false),
    damage: animation(row([10, 120, 230, 340], 1100, 110, 155), 95, false),
    dead: animation(row([495, 615, 735, 855], 1100, 120, 160), 155, false),
    block: animation(row([10, 125, 240, 355], 1290, 115, 195), 140),
    victory: animation(row([490], 1270, 250, 235), 400),
  },
};

export const archerSheet: SpriteSheet = {
  src: '/assets/dark-archer-animation-sheet-64bit-transparent.png', width: 1024, height: 1536,
  animations: {
    idle: animation(row([405, 535, 665, 800], 38, 140, 180), 300),
    walk: animation([
      { x: 430, y: 265, width: 105, height: 150 }, { x: 555, y: 265, width: 115, height: 150 },
      { x: 690, y: 265, width: 115, height: 150 }, { x: 830, y: 265, width: 125, height: 150 },
    ], 150),
    run: animation(row([405, 535, 665, 800], 440, 145, 180), 105),
    attack1: animation(row([10, 210, 405, 600, 795], 645, 195, 185), 92, false),
    attack2: animation(row([10, 210, 405, 600, 795], 845, 195, 190), 105, false),
    damage: animation(row([20, 150, 280], 1090, 130, 155), 110, false),
    dead: animation([
      { x: 485, y: 1090, width: 125, height: 165 }, { x: 620, y: 1090, width: 115, height: 165 },
      { x: 750, y: 1090, width: 110, height: 165 }, { x: 870, y: 1090, width: 150, height: 165 },
    ], 170, false),
    block: animation(row([20, 155, 290], 1290, 135, 195), 150),
    victory: animation(row([480], 1245, 270, 255), 400),
  },
};

export const horrorMonsterSheet: SpriteSheet = {
  src: '/assets/horror-skeleton-animation-sheet-64bit-transparent.png', width: 1024, height: 1536,
  animations: {
    idle: animation(row([400, 535, 670, 805], 35, 115, 190), 260),
    walk: animation(row([400, 535, 670, 805], 235, 115, 200), 145),
    run: animation(row([400, 535, 670, 805], 445, 115, 185), 95),
    attack1: animation(row([10, 205, 400, 595, 790], 645, 195, 185), 85, false),
    attack2: animation(row([10, 255, 500, 745], 840, 245, 180), 95, false),
    damage: animation(row([10, 125, 240, 355], 1060, 115, 160), 105, false),
    dead: animation(row([475, 600, 725, 850], 1060, 125, 165), 170, false),
    block: animation(row([10, 125, 240, 355], 1250, 115, 205), 145),
    victory: animation(row([470], 1210, 280, 285), 400),
  },
};
