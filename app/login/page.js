"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react'; // Импортируем иконки глаза

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Состояние для показа пароля
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
          {/* Поле Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          
          {/* Поле Пароля с глазиком */}
          <div className="relative">
            <input
              // Если showPassword true - показываем текст, иначе - пароль
              type={showPassword ? "text" : "password"} 
              placeholder="Пароль"
              // Добавляем pr-10 (padding-right), чтобы текст не наезжал на иконку
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button" // Важно: type="button", чтобы не отправлялась форма
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold transition disabled:opacity-70">
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