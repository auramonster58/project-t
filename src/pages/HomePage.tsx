import { Link } from 'wouter';
import { NeonPatterns } from '../components/NeonPatterns';

export function HomePage() {
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
      </section>
    </main>
  );
}
