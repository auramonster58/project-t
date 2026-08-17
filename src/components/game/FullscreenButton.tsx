import { useEffect, useState } from 'react';
import '../../styles/fullscreen-button.css';

type SafariDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type SafariElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const update = () => {
      const safariDocument = document as SafariDocument;
      setIsFullscreen(Boolean(document.fullscreenElement ?? safariDocument.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', update);
    document.addEventListener('webkitfullscreenchange', update);
    update();
    return () => {
      document.removeEventListener('fullscreenchange', update);
      document.removeEventListener('webkitfullscreenchange', update);
    };
  }, []);

  const toggle = async () => {
    const safariDocument = document as SafariDocument;
    const root = document.documentElement as SafariElement;
    if (document.fullscreenElement ?? safariDocument.webkitFullscreenElement) {
      await (document.exitFullscreen?.() ?? safariDocument.webkitExitFullscreen?.());
      return;
    }
    await (root.requestFullscreen?.() ?? root.webkitRequestFullscreen?.());
    window.scrollTo(0, 0);
  };

  return (
    <button className="fullscreen-button" type="button" onClick={() => void toggle()}
      aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'}>
      <span aria-hidden="true">{isFullscreen ? '⊡' : '⛶'}</span>
      <b>{isFullscreen ? 'СВЕРНУТЬ' : 'ВЕСЬ ЭКРАН'}</b>
    </button>
  );
}
