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
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Неверный email или пароль");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <main 
      style={{ 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "flex-start", // Для работы paddingTop
        paddingTop: "42vh",       // Положение на уровне начала ствола
        paddingLeft: "20px", 
        paddingRight: "20px",
        paddingBottom: "40px",
        boxSizing: "border-box",
        backgroundImage: "url('/background.png')", // Дерево только на этой странице
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Матовый прямоугольник (Карточка) */}
      <div 
        style={{
          width: "100%",
          maxWidth: "310px",           // Изящная узкая форма под ствол
          backgroundColor: "rgba(253, 250, 246, 0.92)", // Плотная кремовая бумага
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(139, 69, 19, 0.2)",
          borderRadius: "24px",
          padding: "40px",             // Увеличенные внутренние отступы
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
          boxSizing: "border-box",     // Чтобы паддинги не расширяли форму
          color: "#2c2420",
          textAlign: "center"          // Центрирование заголовков
        }}
      >
        <div style={{ marginBottom: "25px" }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "22px", margin: "0 0 8px 0" }}>
            Вход в Летопись
          </h2>
          <p style={{ fontSize: "12px", fontStyle: "italic", opacity: 0.7, margin: 0 }}>
            Продолжите историю семьи
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Блок Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ 
              fontSize: "10px", 
              fontWeight: "bold", 
              letterSpacing: "0.15em", 
              opacity: 0.6,
              textAlign: "center" // Центрирование названия поля
            }}>
              ЭЛЕКТРОННАЯ ПОЧТА
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(139, 69, 19, 0.2)",
                backgroundColor: "white",
                fontSize: "14px",
                boxSizing: "border-box", // Гарантия вписывания в ширину
                textAlign: "center",    // Текст и курсор по центру
                outline: "none"
              }}
            />
          </div>

          {/* Блок Пароль */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ 
              fontSize: "10px", 
              fontWeight: "bold", 
              letterSpacing: "0.15em", 
              opacity: 0.6,
              textAlign: "center" // Центрирование названия поля
            }}>
              ПАРОЛЬ
            </label>
            <div style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 40px",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 69, 19, 0.2)",
                  backgroundColor: "white",
                  fontSize: "14px",
                  boxSizing: "border-box", // Гарантия вписывания в ширину
                  textAlign: "center",    // Текст и курсор по центру
                  outline: "none"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  opacity: 0.4
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: "#b91c1c", fontSize: "11px", backgroundColor: "#fef2f2", padding: "8px", borderRadius: "8px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "5px",
              borderRadius: "50px",
              backgroundColor: "#5d4037",
              color: "#fdfaf6",
              border: "none",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "var(--font-playfair), serif",
              boxShadow: "0 4px 15px rgba(93, 64, 55, 0.2)"
            }}
          >
            {loading ? "Загрузка..." : "Войти в архив"}
          </button>
        </form>

        <div style={{ marginTop: "25px", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: "12px", opacity: 0.8 }}>
            Впервые здесь?{" "}
            <Link 
              href="/signup" 
              style={{ color: "#5d4037", fontWeight: "bold", textDecoration: "none" }}
            >
              Создать летопись
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}