import { useEffect, useState } from 'react';
import { CHARACTER_NAMES, type DialogueLine } from '../../lib/kingDialogue';
import { DialoguePortrait } from './DialoguePortrait';

type DialogueBoxProps = { lines: DialogueLine[]; onFinish: () => void };

export function DialogueBox({ lines, onFinish }: DialogueBoxProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const line = lines[lineIndex];
  const isComplete = visibleLetters >= line.text.length;

  useEffect(() => {
    setVisibleLetters(0);
    const timer = window.setInterval(() => setVisibleLetters((count) => {
      if (count >= line.text.length) { window.clearInterval(timer); return count; }
      return count + 1;
    }), 28);
    return () => window.clearInterval(timer);
  }, [line]);

  const advance = () => {
    if (!isComplete) { setVisibleLetters(line.text.length); return; }
    if (lineIndex === lines.length - 1) { onFinish(); return; }
    setLineIndex((index) => index + 1);
  };

  return (
    <section className="dialogue-layer" role="dialog" aria-label="Разговор с королём">
      <button className="dialogue-box" onClick={advance}>
        <DialoguePortrait speaker={line.speaker} emotion={line.emotion} />
        <div className="dialogue-copy">
          <strong>{CHARACTER_NAMES[line.speaker]}</strong>
          <p>— {line.text.slice(0, visibleLetters)}<i className="dialogue-cursor" /></p>
          <small>{isComplete ? 'НАЖМИТЕ, ЧТОБЫ ПРОДОЛЖИТЬ' : 'НАЖМИТЕ, ЧТОБЫ ОТКРЫТЬ РЕПЛИКУ'}</small>
        </div>
        <span className="dialogue-progress">{lineIndex + 1}/{lines.length}</span>
      </button>
    </section>
  );
}
