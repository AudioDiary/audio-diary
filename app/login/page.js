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
      setError("Ошибка входа");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <main className="login-container">
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-left: 20px;
          padding-right: 20px;
          padding-bottom: 50px;
          box-sizing: border-box;
          
          /* Фон: всегда видим картинку целиком */
          background-image: url('/background.png');
          background-repeat: no-repeat;
          background-position: center top;
          background-size: 100% auto;
          background-attachment: scroll;
          background-color: #f2eedf;
        }

        /* Позиционирование формы точно "в дерево" */
        @media (min-width: 769px) {
          .login-container {
            /* 44vw — это точка начала ствола на большинстве мониторов для этой картинки */
            padding-top: 37vw; 
          }
        }

        @media (max-width: 768px) {
          .login-container {
            /* На мобильных дерево визуально ниже из-за узкого экрана */
            padding-top: 80vw; 
          }
        }

        .glass-box {
          width: 100%;
          /* Сужаем форму до 260px, чтобы она вписалась в границы ствола */
          max-width: 260px; 
          background-color: rgba(253, 250, 246, 0.95);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(139, 69, 19, 0.15);
          border-radius: 20px;
          padding: 30px 20px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          box-sizing: border-box;
          text-align: center;
        }

        .input-field {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(139, 69, 19, 0.2);
          background: white;
          font-size: 14px;
          text-align: center;
          outline: none;
          box-sizing: border-box;
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          border-radius: 40px;
          background-color: #5d4037;
          color: white;
          border: none;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
          font-family: var(--font-playfair), serif;
          margin-top: 10px;
        }
      `}</style>

      <div className="glass-box">
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "20px", margin: "0 0 5px 0", color: "#4e342e" }}>
            Вход в Летопись
          </h2>
          <p style={{ fontSize: "11px", fontStyle: "italic", opacity: 0.6, margin: 0 }}>
            История вашей семьи
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "9px", fontWeight: "bold", letterSpacing: "0.1em", opacity: 0.5 }}>
              ЭЛЕКТРОННАЯ ПОЧТА
            </label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "9px", fontWeight: "bold", letterSpacing: "0.1em", opacity: 0.5 }}>
              ПАРОЛЬ
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                style={{ paddingRight: "35px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  opacity: 0.3
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && <div style={{ color: "#b91c1c", fontSize: "10px" }}>{error}</div>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>

        <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <p style={{ fontSize: "11px", opacity: 0.7 }}>
            <Link href="/signup" style={{ color: "#5d4037", fontWeight: "bold", textDecoration: "none" }}>
              Создать свою летопись
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}