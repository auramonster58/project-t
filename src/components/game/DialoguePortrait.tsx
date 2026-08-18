import type { DialogueEmotion, DialogueSpeaker } from '../../lib/kingDialogue';

const EMOTION_INDEX: Record<DialogueSpeaker, Record<DialogueEmotion, number>> = {
  king: { normal: 0, talking: 1, angry: 11, afraid: 10, surprised: 6, sad: 7, happy: 8 },
  knight: { normal: 0, angry: 1, afraid: 2, surprised: 3, sad: 4, happy: 5, talking: 6 },
};

export function DialoguePortrait({ speaker, emotion }: {
  speaker: DialogueSpeaker; emotion: DialogueEmotion;
}) {
  const index = EMOTION_INDEX[speaker][emotion];
  const columns = speaker === 'king' ? 6 : 4;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const positionX = column / (columns - 1) * 100;
  return <div className={`dialogue-portrait dialogue-portrait--${speaker}`} style={{
    '--portrait-image': `url(/assets/${speaker}-dialogue-emotions.png)`,
    '--portrait-columns': columns,
    '--portrait-x': `${positionX}%`, '--portrait-y': `${row * 100}%`,
  } as React.CSSProperties} aria-hidden="true" />;
}
