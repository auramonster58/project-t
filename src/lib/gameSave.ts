import { supabase } from './supabase';

export type SavedEnemy = { id: number; health: number };
export type SavedKey = { room: number; x: number; y: number };
export type BranchRoute = 'up' | 'middle' | 'down';
export type AchievementStats = {
  totalKills: number;
  chestScreamerSeen: boolean;
  skeletonScreamerSeen: boolean;
  deaths: number;
};

export const EMPTY_ACHIEVEMENT_STATS: AchievementStats = {
  totalKills: 0,
  chestScreamerSeen: false,
  skeletonScreamerSeen: false,
  deaths: 0,
};

export type GameSave = {
  unlockedRoom: number;
  playerHealth: number;
  enemies: SavedEnemy[];
  keys: SavedKey[];
  completed: boolean;
  ambushResolved?: boolean;
  decoyGuardsReleased?: boolean;
  fifthHallNoteRead?: boolean;
  fifthHallKeyCollected?: boolean;
  fifthHallChestOpened?: boolean;
  branchRoute?: BranchRoute;
  branchDistance?: number;
  achievementStats?: AchievementStats;
};

export async function loadGameSave(userId: string) {
  const { data, error } = await supabase.from('game_saves').select('state').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data?.state as GameSave | undefined;
}

export async function saveGame(userId: string, state: GameSave) {
  const { error } = await supabase.from('game_saves').upsert({
    user_id: userId,
    state,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function clearGameSave(userId: string) {
  const { data } = await supabase.from('game_saves').select('state').eq('user_id', userId).maybeSingle();
  const previous = data?.state as GameSave | undefined;
  const resetState: GameSave = {
    unlockedRoom: 0,
    playerHealth: 100,
    enemies: [],
    keys: [],
    completed: false,
    achievementStats: previous?.achievementStats ?? EMPTY_ACHIEVEMENT_STATS,
  };
  const { error } = await supabase.from('game_saves').upsert({
    user_id: userId,
    state: resetState,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
