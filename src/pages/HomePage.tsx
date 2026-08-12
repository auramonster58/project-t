import { Link } from 'wouter';

export function HomePage() {
  return (
    <main className="container">
      <section className="hello">
        <h1>Привет! 🚀</h1>
        <p>Это твой проект. Пока тут пусто — самое интересное впереди.</p>
        <Link href="/game" className="hello__hint game-link">
          Войти в Чёрный замок →
        </Link>
      </section>
    </main>
  );
}
