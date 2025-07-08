import React, { useState } from "react";
import AuthModal from "../ui/AuthModal";

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-pixel">
      <header className="py-10 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">
          Профориентационная текстовая игра
        </h1>
        <p className="text-lg mb-8">
          Пройди 7 миниигр и получи советы по профессиям!
        </p>
        <button
          className="bg-white text-black font-pixel px-8 py-3 rounded shadow hover:bg-black hover:text-white border-2 border-white transition"
          onClick={() => setShowAuth(true)}
        >
          Начать игру
        </button>
      </header>
      <section className="flex-1 flex flex-col items-center justify-center py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl w-full">
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">🎮</span>
            <h3 className="font-bold mb-1">Играй</h3>
            <p className="text-center text-sm">Проходи короткие квесты</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">🧠</span>
            <h3 className="font-bold mb-1">Узнавай о себе</h3>
            <p className="text-center text-sm">Оценивай свои навыки</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-2">💼</span>
            <h3 className="font-bold mb-1">Получай профессию</h3>
            <p className="text-center text-sm">Советы по профориентации</p>
          </div>
        </div>
      </section>
      <footer className="py-6 text-center border-t border-white text-xs opacity-70">
        © {new Date().getFullYear()} Профориентационная игра ·{" "}
        <a href="#" className="underline">
          Контакты
        </a>
      </footer>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
