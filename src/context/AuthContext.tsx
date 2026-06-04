import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function getAuthErrorMessage(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('email rate limit')) {
    return 'Слишком много писем отправлено на этот email. Подождите несколько минут и попробуйте снова.';
  }

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Неверный email или пароль.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Email ещё не подтверждён. Проверьте почту и перейдите по ссылке подтверждения.';
  }

  if (normalizedMessage.includes('user already registered')) {
    return 'Пользователь с таким email уже зарегистрирован. Попробуйте войти.';
  }

  if (normalizedMessage.includes('signup disabled')) {
    return 'Регистрация сейчас отключена.';
  }

  if (normalizedMessage.includes('password')) {
    return 'Пароль должен быть не короче 6 символов.';
  }

  if (normalizedMessage.includes('email')) {
    return 'Проверьте правильность email.';
  }

  return 'Ошибка авторизации. Попробуйте ещё раз.';
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: getAuthErrorMessage(error.message) };
    }

    return {};
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: getAuthErrorMessage(error.message) };
    }

    return {};
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }

  return value;
}