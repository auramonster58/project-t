import { EMPTY_ACHIEVEMENT_STATS, type GameSave } from './gameSave';

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export function getAchievements(save?: GameSave): Achievement[] {
  const stats = { ...EMPTY_ACHIEVEMENT_STATS, ...save?.achievementStats };
  const defeatedEnemy = stats.totalKills > 0 || (save?.enemies.some((enemy) => enemy.health === 0) ?? false);
  return [
    { id: 'first-blood', icon: '⚔', title: 'ПЕРВАЯ ПОБЕДА',
      description: 'Победи первого противника', unlocked: defeatedEnemy },
    { id: 'ten-kills', icon: '⚔', title: 'ОХОТНИК',
      description: `Победи 10 врагов · ${Math.min(stats.totalKills, 10)} / 10`, unlocked: stats.totalKills >= 10 },
    { id: 'hundred-kills', icon: '🗡', title: 'ИСТРЕБИТЕЛЬ',
      description: `Победи 100 врагов · ${Math.min(stats.totalKills, 100)} / 100`, unlocked: stats.totalKills >= 100 },
    { id: 'thousand-kills', icon: '🔥', title: 'ЛЕГЕНДА ЗАМКА',
      description: `Победи 1000 врагов · ${Math.min(stats.totalKills, 1000)} / 1000`, unlocked: stats.totalKills >= 1000 },
    { id: 'third-hall', icon: '🗝', title: 'ТРИ ЗАЛА',
      description: 'Доберись до четвёртого зала', unlocked: (save?.unlockedRoom ?? 0) >= 3 },
    { id: 'ambush', icon: '☠', title: 'НЕ ИСПУГАЛСЯ',
      description: 'Переживи засаду в переходе', unlocked: save?.ambushResolved ?? false },
    { id: 'secret-note', icon: '📜', title: 'СЛЕДОПЫТ',
      description: 'Прочитай тайную записку', unlocked: save?.fifthHallNoteRead ?? false },
    { id: 'chest-screamer', icon: '🧰', title: 'ЭТО НЕ СУНДУК',
      description: 'Переживи скример у сундука', unlocked: stats.chestScreamerSeen },
    { id: 'skeleton-screamer', icon: '💀', title: 'ЛИЦОМ К СКЕЛЕТУ',
      description: 'Увидь скример скелета', unlocked: stats.skeletonScreamerSeen },
    { id: 'first-death', icon: '☠', title: 'ЭТО ТОЛЬКО НАЧАЛО',
      description: 'Погибни в замке один раз', unlocked: stats.deaths > 0 },
    { id: 'six-halls', icon: '🏰', title: 'ШЕСТЬ ЗАЛОВ',
      description: 'Открой дорогу к развилке', unlocked: (save?.unlockedRoom ?? 0) > 5 },
    { id: 'fork', icon: '⑂', title: 'ВЫБОР СДЕЛАН',
      description: 'Выбери путь на развилке', unlocked: Boolean(save?.branchRoute) },
    { id: 'upper-route', icon: '↑', title: 'ПУТЬ НАВЕРХ',
      description: 'Выбери верхнюю ветку', unlocked: save?.branchRoute === 'up' },
    { id: 'lower-route', icon: '↓', title: 'ПУТЬ ВНИЗ',
      description: 'Выбери нижнюю ветку', unlocked: save?.branchRoute === 'down' },
    { id: 'castle-complete', icon: '🏆', title: 'ХОЗЯИН ЗАМКА',
      description: 'Пройди выбранную ветку до конца', unlocked: save?.completed ?? false },
    { id: 'good-ending', icon: '🌅', title: 'СПАСЕНИЕ',
      description: 'Получи хорошую концовку и выберись из замка',
      unlocked: Boolean(save?.completed && save.branchRoute === 'up') },
  ];
}
