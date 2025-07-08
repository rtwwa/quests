import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(express.json());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);

import cookieParser from "cookie-parser";
app.use(cookieParser());

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  progress: {
    scene: Number,
    stats: Object,
  },
});
const User = mongoose.model("User", userSchema);

function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Нет авторизации" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Неверный токен" });
  }
}

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Все поля обязательны" });
  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ error: "Email уже зарегистрирован" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    JWT_SECRET
  );
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
  res.json({ user: { name: user.name, email: user.email } });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Пользователь не найден" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Неверный пароль" });
  const token = jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    JWT_SECRET
  );
  res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
  res.json({ user: { name: user.name, email: user.email } });
});

app.get("/api/profile", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  res.json({
    user: { name: user.name, email: user.email },
    progress: user.progress,
  });
});

app.post("/api/progress", auth, async (req, res) => {
  const { progress } = req.body;
  if (!progress || !progress.scene || progress.scene > 2)
    return res.status(400).json({ error: "Некорректный прогресс" });
  await User.findByIdAndUpdate(req.user.id, { progress });
  res.json({ ok: true });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
