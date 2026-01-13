"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    let error;
    
    if (isSignUp) {
      // Регистрация
      const res = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          // Важно: указываем, куда вернуть пользователя после клика в письме
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      error = res.error;
      if (!error) alert('Письмо отправлено! Проверьте почту (включая Спам).');
    } else {
      // Вход
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
      if (!error) router.push('/');
    }

    if (error) alert(error.message);
    setLoading(false);
  };

  // --- НОВАЯ ФУНКЦИЯ: Повторная отправка ---
  const handleResendEmail = async () => {
    if (!email) {
      alert("Сначала введите Email в поле выше.");
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (error) alert("Ошибка: " + error.message);
    else alert("Письмо отправлено повторно! Проверьте почту.");
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">{isSignUp ? 'Регистрация' : 'Вход'}</h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold transition">
            {loading ? 'Обработка...' : (isSignUp ? 'Зарегистрироваться' : 'Войти')}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:underline"
          >
            {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Создать'}
          </button>

          {/* Кнопка повторной отправки (показываем только при регистрации) */}
          {isSignUp && (
            <button 
              onClick={handleResendEmail}
              className="text-gray-500 hover:text-gray-800 underline mt-2"
              type="button"
            >
              Не пришло письмо? Отправить повторно
            </button>
          )}
        </div>
      </div>
    </div>
  );
}