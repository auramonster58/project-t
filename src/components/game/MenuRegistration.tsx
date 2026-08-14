import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

type AuthMode = 'signup' | 'signin';

export function MenuRegistration({ session }: { session: Session | null }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!isSupabaseConfigured || !mode) {
      setMessage('Сначала подключи Supabase в .env');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const { data, error } = mode === 'signup'
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: name.trim() }, emailRedirectTo: `${window.location.origin}/game` },
          })
        : await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else if (data.session) setMode(null);
      else setMessage('Проверь почту и подтверди регистрацию');
    } catch {
      setMessage('Не удалось подключиться. Попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) {
      setMessage('Сначала подключи Supabase в .env');
      return;
    }
    setBusy(true);
    setMessage('Открываем вход через Google…');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/game` },
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
    }
  }

  if (session) {
    const metadata = session.user.user_metadata;
    const playerName = (metadata.display_name ?? metadata.full_name ?? metadata.name) as string | undefined;
    return <aside className="menu-registration menu-registration--signed-in">
      <strong>ИГРОК: {playerName ?? session.user.email}</strong>
      <button className="registration-toggle" onClick={() => supabase.auth.signOut()}>ВЫЙТИ</button>
    </aside>;
  }

  return (
    <aside className="menu-registration">
      <div className="registration-actions">
        <button className="registration-toggle" onClick={() => setMode(mode === 'signup' ? null : 'signup')}>РЕГИСТРАЦИЯ</button>
        <button className="registration-toggle" onClick={() => setMode(mode === 'signin' ? null : 'signin')}>ВОЙТИ</button>
      </div>
      <button className="google-auth-button" type="button" onClick={signInWithGoogle} disabled={busy}>
        <span aria-hidden="true">G</span>{busy ? 'ПОДОЖДИ…' : 'ВОЙТИ ЧЕРЕЗ GOOGLE'}
      </button>
      {!mode && message && <small className="registration-message">{message}</small>}
      {mode && <form className="registration-form" onSubmit={submit}>
        <strong>{mode === 'signup' ? 'НОВЫЙ ИГРОК' : 'ВХОД В ИГРУ'}</strong>
        {mode === 'signup' && <label>Имя<input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={24} required /></label>}
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></label>
        <button type="submit" disabled={busy}>{busy ? 'ПОДОЖДИ…' : mode === 'signup' ? 'СОЗДАТЬ АККАУНТ' : 'ВОЙТИ'}</button>
        {message && <small>{message}</small>}
      </form>}
    </aside>
  );
}
