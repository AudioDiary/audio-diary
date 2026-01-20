"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Состояние для глазика
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
        alignItems: "flex-start", 
        paddingTop: "42vh", 
        paddingLeft: "20px", 
        paddingRight: "20px",
        paddingBottom: "40px",
        boxSizing: "border-box" 
      }}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "310px",
          backgroundColor: "rgba(253, 250, 246, 0.96)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(139, 69, 19, 0.15)",
          borderRadius: "20px",
          padding: "25px 20px",
          boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
          boxSizing: "border-box",
          color: "#2c2420",
          textAlign: "center"
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "20px", margin: "0 0 5px 0" }}>
            Вход в Летопись
          </h2>
          <p style={{ fontSize: "11px", fontStyle: "italic", opacity: 0.7, margin: 0 }}>
            Продолжите историю семьи
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "9px", fontWeight: "bold", letterSpacing: "0.1em", opacity: 0.6 }}>
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
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid rgba(139, 69, 19, 0.2)",
                backgroundColor: "white",
                fontSize: "14px",
                boxSizing: "border-box",
                textAlign: "center",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "9px", fontWeight: "bold", letterSpacing: "0.1em", opacity: 0.6 }}>
              ПАРОЛЬ
            </label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"} // Переключаем тип поля
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "10px 35px 10px 35px", // Добавляем отступы по бокам для иконки
                  borderRadius: "10px",
                  border: "1px solid rgba(139, 69, 19, 0.2)",
                  backgroundColor: "white",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  textAlign: "center",
                  outline: "none"
                }}
              />
              {/* Кастомный глазик */}
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
                  fontSize: "14px",
                  opacity: 0.5,
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"} 
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: "#b91c1c", fontSize: "10px", backgroundColor: "#fef2f2", padding: "6px", borderRadius: "8px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "5px",
              borderRadius: "40px",
              backgroundColor: "#5d4037",
              color: "#fdfaf6",
              border: "none",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              fontFamily: "var(--font-playfair), serif"
            }}
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>

        <div style={{ marginTop: "15px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: "11px", opacity: 0.8 }}>
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