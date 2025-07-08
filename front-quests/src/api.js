const API_URL = import.meta.env.VITE_API_URL;

export async function register({ name, email, password }) {
  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function login({ email, password }) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_URL}/api/profile`, {
    credentials: "include",
  });
  return res.json();
}

export async function saveProgress(progress) {
  const res = await fetch(`${API_URL}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ progress }),
  });
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });
  return res.json();
}
