import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Scene1 from "./scenes/Scene1";
import Scene2 from "./scenes/Scene2";
import Scene3 from "./scenes/Scene3";
import { useUser } from "./pages/AppLayout";
import { saveProgress } from "./api";

const initialStats = {
  creativity: 0,
  empathy: 0,
  bravery: 0,
  logic: 0,
  organization: 0,
};

export default function Game() {
  const { user } = useUser();
  const location = useLocation();
  const [stats, setStats] = useState(() => {
    if (user && user.progress && user.progress.stats) {
      return { ...initialStats, ...user.progress.stats };
    }
    return initialStats;
  });

  useEffect(() => {
    if (user && user.progress && user.progress.stats) {
      setStats({ ...initialStats, ...user.progress.stats });
    }
  }, [user]);

  useEffect(() => {
    if (location.pathname.includes("scene1")) {
      setStats(initialStats);
      if (user) {
        saveProgress({ scene: 1, stats: initialStats });
      }
    }
  }, [location.pathname, user]);

  const updateStats = (delta) => {
    setStats((prev) => {
      const next = { ...prev };
      for (const key in delta) {
        next[key] = (next[key] || 0) + (delta[key] || 0);
      }
      return next;
    });
  };

  return (
    <Routes>
      <Route
        index
        element={<Scene1 stats={stats} updateStats={updateStats} />}
      />
      <Route
        path="scene1"
        element={<Scene1 stats={stats} updateStats={updateStats} />}
      />
      <Route
        path="scene2"
        element={<Scene2 stats={stats} updateStats={updateStats} />}
      />
      <Route
        path="scene3"
        element={<Scene3 stats={stats} updateStats={updateStats} />}
      />
      <Route path="*" element={<Navigate to="." />} />
    </Routes>
  );
}
