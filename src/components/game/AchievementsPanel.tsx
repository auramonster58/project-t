import { useEffect, useState } from 'react';
import { getAchievements, type Achievement } from '../../lib/achievements';
import { loadGameSave } from '../../lib/gameSave';
import '../../styles/achievements.css';

type AchievementsPanelProps = { userId?: string; onClose: () => void };

export function AchievementsPanel({ userId, onClose }: AchievementsPanelProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(() => getAchievements());
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) return;
    let active = true;
    loadGameSave(userId)
      .then((save) => { if (active) setAchievements(getAchievements(save)); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;
  return (
    <div className="achievements-overlay" role="dialog" aria-modal="true" aria-label="Достижения">
      <section className="achievements-panel">
        <header>
          <div><span>🏆</span><strong>ДОСТИЖЕНИЯ</strong><small>{unlocked} / {achievements.length}</small></div>
          <button onClick={onClose} aria-label="Закрыть достижения">×</button>
        </header>
        {!userId && <p className="achievements-message">Войди в игру, чтобы сохранять достижения.</p>}
        {loading ? <p className="achievements-message">ЗАГРУЖАЕМ НАГРАДЫ…</p> : <div className="achievements-list">
          {achievements.map((achievement) => <article
            className={achievement.unlocked ? 'achievement achievement--unlocked' : 'achievement'}
            key={achievement.id}>
            <span>{achievement.unlocked ? achievement.icon : '🔒'}</span>
            <div><strong>{achievement.title}</strong><small>{achievement.description}</small></div>
          </article>)}
        </div>}
      </section>
    </div>
  );
}
