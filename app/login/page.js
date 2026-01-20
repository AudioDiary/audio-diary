"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Ошибка входа"); setLoading(false); }
    else { router.push("/"); }
  };

  return (
    // Применяем класс с деревом ТОЛЬКО здесь
    <main className="bg-tree-overlay min-h-screen flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-[320px] text-center">
        <h2 className="font-header text-2xl mb-2 text-amber-950">Вход в Летопись</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-amber-900/10 outline-none text-center"
          />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} placeholder="Пароль" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-amber-900/10 outline-none text-center"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 opacity-30">
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <button className="w-full py-3 bg-amber-900 text-white rounded-full font-bold">Войти</button>
        </form>
      </div>
    </main>
  );
}