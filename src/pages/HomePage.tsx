import { useState } from 'react';
import { Link } from 'wouter';
import { NeonPatterns } from '../components/NeonPatterns';

export function HomePage() {
  const [copied, setCopied] = useState(false);
  const gameUrl = typeof window !== 'undefined'
    ? new URL('/game', window.location.origin).toString()
    : 'http://localhost:5173/game';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1300);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="castle-home">
      <NeonPatterns />
      <section className="castle-home__content">
        <span className="castle-home__eyebrow">ВОЙДИ ВО ТЬМУ · НАЙДИ ВЫХОД</span>
        <h1>RE:TURN</h1>
        <p>Десять залов. Один рыцарь. Ни одного пути назад.</p>
        <Link href="/game" className="castle-home__button game-link">
          НАЧАТЬ ПУТЬ <b>→</b>
        </Link>

        <div className="castle-home__qr-panel" aria-label="QR code для входа в игру">
          <div className="castle-home__qr">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(gameUrl)}`}
              alt="QR код для запуска игры"
            />
          </div>

          <div className="castle-home__qr-copy">
            <strong>ОТКРЫТЬ НА ТЕЛЕФОНЕ</strong>
            <a href={gameUrl} target="_blank" rel="noreferrer">
              {gameUrl.replace(/^https?:\/\//, '')}
            </a>
            <button type="button" className="castle-home__copy-button" onClick={handleCopy}>
              {copied ? 'СКОПИРОВАНО' : 'СКОПИРОВАТЬ ССЫЛКУ'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
