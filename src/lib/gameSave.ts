import { supabase } from './supabase';

export type SavedEnemy = { id: number; health: number };
export type SavedKey = { room: number; x: number; y: number };

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
  const { error } = await supabase.from('game_saves').delete().eq('user_id', userId);
  if (error) throw error;
}
