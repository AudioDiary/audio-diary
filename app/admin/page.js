"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Неверный email или пароль");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      {/* Контейнер формы с эффектом стекла */}
      <div className="glass-card p-8 md:p-10 w-full max-w-[400px] border-white/40 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="font-header text-3xl text-amber-950 mb-2">Вход в Летопись</h2>
          <p className="font-body text-sm text-amber-900/60 italic">
            Продолжите историю вашей семьи
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-amber-900/70 uppercase tracking-widest mb-1.5 ml-1">
              Электронная почта
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-amber-900/10 focus:border-amber-900/30 focus:bg-white/80 outline-none transition-all font-body text-amber-950"
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-900/70 uppercase tracking-widest mb-1.5 ml-1">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 border border-amber-900/10 focus:border-amber-900/30 focus:bg-white/80 outline-none transition-all font-body text-amber-950"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center font-body bg-red-50/50 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-900 text-amber-50 rounded-full font-header text-lg hover:bg-amber-800 transition-all shadow-lg shadow-amber-900/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Открываем книгу..." : "Войти в архив"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-amber-900/10 pt-6">
          <p className="font-body text-sm text-amber-900/70">
            Впервые здесь?{" "}
            <Link 
              href="/signup" 
              className="font-bold text-amber-900 hover:underline decoration-amber-900/30 underline-offset-4"
            >
              Создать свою летопись
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}