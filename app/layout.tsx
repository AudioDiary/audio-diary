import type { Metadata } from "next";
import { Playfair_Display, Lora } from "next/font/google"; // Импортируем "книжные" шрифты
import "./globals.css";

// Шрифт для заголовков
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
});

// Шрифт для основного текста
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Книга памяти нашей семьи",
  description: "Сохраните историю ваших поколений с помощью голоса",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${playfair.variable} ${lora.variable} antialiased font-serif`}
      >
        {/* Оверлей для того, чтобы фон был чуть приглушен и текст читался лучше */}
        <div className="fixed inset-0 bg-black/10 z-[-1]" /> 
        {children}
      </body>
    </html>
  );
}