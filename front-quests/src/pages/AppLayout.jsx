import { useEffect, useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import Game from "../Game";
import AuthModal from "../ui/AuthModal";
import { getProfile, logout } from "../api";

export const UserContext = createContext();
export function useUser() {
  return useContext(UserContext);
}

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  useEffect(() => {
    getProfile().then((data) => {
      if (data && data.user) setUser({ ...data.user, progress: data.progress });
      else setUser(null);
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAuthOpen(true);
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen flex flex-col bg-black text-white font-pixel">
        <header className="p-4 border-b border-white text-2xl relative">
          Костёр забытых искр
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <img
              src="/sprites/mainCharacterModel.png"
              alt="Профиль"
              className="w-8 h-8 rounded-full border"
            />
            <span>{user ? user.name : "Гость"}</span>
            {user && (
              <button
                onClick={handleLogout}
                className="ml-2 text-xs border border-white rounded px-2 py-1 hover:bg-white hover:text-black transition"
              >
                Выйти
              </button>
            )}
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center select-none">
          <Game />
          <Outlet />
        </main>
        <footer className="p-2 border-t border-white text-center text-xs opacity-60">
          &copy; {new Date().getFullYear()} Костёр забытых искр
        </footer>
        {(!user || authOpen) && (
          <AuthModal
            onClose={() => setAuthOpen(false)}
            onAuthSuccess={setUser}
          />
        )}
      </div>
    </UserContext.Provider>
  );
}
