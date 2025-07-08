import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let data;
      if (tab === "login") {
        data = await login({ email, password });
      } else {
        data = await register({ name, email, password });
      }
      if (data.error) {
        setError(data.error || "Ошибка");
      } else {
        onClose();
        if (onAuthSuccess) onAuthSuccess(data.user || data);
        navigate("/app/scene1");
      }
    } catch (e) {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-xs p-6 font-pixel relative">
        <button
          className="absolute top-2 right-2 text-black text-2xl font-bold hover:opacity-60"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 border-b-2 font-bold ${
              tab === "login" ? "border-black" : "border-transparent"
            }`}
            onClick={() => setTab("login")}
          >
            Войти
          </button>
          <button
            className={`flex-1 py-2 border-b-2 font-bold ${
              tab === "register" ? "border-black" : "border-transparent"
            }`}
            onClick={() => setTab("register")}
          >
            Регистрация
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {tab === "register" && (
            <input
              type="text"
              required
              placeholder="Имя"
              className="px-3 py-2 border border-black rounded bg-white text-black font-pixel focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            className="px-3 py-2 border border-black rounded bg-white text-black font-pixel focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Пароль"
            className="px-3 py-2 border border-black rounded bg-white text-black font-pixel focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="text-red-600 text-xs">{error}</div>}
          <button
            type="submit"
            className="bg-black text-white py-2 rounded font-pixel border-2 border-black hover:bg-white hover:text-black transition"
            disabled={loading}
          >
            {tab === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}
