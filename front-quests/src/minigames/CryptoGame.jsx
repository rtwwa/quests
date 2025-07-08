import React, { useState } from "react";

const PHRASES = [
  { original: "ШИФРОВАНИЕ", type: "caesar", shift: 3 },
  { original: "БЛАГОРОДНЫЙ", type: "anagram" },
  {
    original: "КРАСИВЫЙ ДОМ",
    type: "replace",
    map: {
      Ы: "Е",
      А: "О",
      Р: "П",
      И: "К",
      С: "Й",
      К: "А",
      Д: "М",
      В: "Л",
      М: "С",
      Й: "Т",
      О: "Р",
    },
  },
];

const EXAMPLES = {
  caesar: {
    encrypted: "ТУЛЕЗХ ПЛУ",
    original: "ПРИВЕТ МИР",
    explain:
      "Шифр Цезаря: каждая буква сдвинута на 3 вперёд. Например, П → Т, Р → У и т.д.",
  },
  anagram: {
    encrypted: "ДОК",
    original: "КОД",
    explain: "Анаграмма: буквы перемешаны местами. Пример: КОД → ДОК.",
  },
  replace: {
    encrypted: "ПРИВЕТ",
    original: "ЛОГИКА",
    explain:
      "Замена: каждая буква заменена по таблице. Например, Л → П, О → Р и т.д.",
  },
};

const ABC = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

function caesarCipher(str, shift) {
  const abc = ABC;
  return str
    .split("")
    .map((ch) => {
      const up = ch.toUpperCase();
      const idx = abc.indexOf(up);
      if (idx === -1) return ch;
      let nidx = (idx + shift + abc.length) % abc.length;
      return abc[nidx];
    })
    .join("");
}

function replaceCipher(str, map) {
  return str
    .split("")
    .map((ch) => (map[ch] ? map[ch] : ch))
    .join("");
}

function anagram(str) {
  return str
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

function CaesarAlphabet() {
  const abc = ABC.split("");
  return (
    <div className="flex flex-col items-center ml-6 md:ml-10">
      <div className="text-xs font-mono tracking-widest text-gray-700 mb-1">
        Алфавит:
      </div>
      <div className="text-base font-mono tracking-widest text-black bg-yellow-100 rounded px-1 py-1 border border-yellow-400">
        {abc.join(" ")}
      </div>
    </div>
  );
}

function ReplaceTable({ map }) {
  return (
    <div className="flex flex-col items-center ml-6 md:ml-10">
      <div className="text-xs font-mono tracking-widest text-gray-700 mb-1">
        Таблица замены:
      </div>
      <div className="text-base font-mono tracking-widest text-black bg-blue-100 rounded px-1 py-1 border border-blue-400">
        {Object.entries(map).map(([from, to]) => (
          <div key={from}>
            {from} → {to}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CryptoGame({ onFinish }) {
  const [step, setStep] = useState("tutorial");
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [hintShown, setHintShown] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [fixedAnagrams, setFixedAnagrams] = useState([]);

  React.useEffect(() => {
    if (step === "tutorial") {
      setFixedAnagrams([]);
    }
    if (step === "example" && fixedAnagrams.length === 0) {
      setFixedAnagrams(
        PHRASES.map((p) =>
          p.type === "anagram" ? anagram(p.original.replace(/ /g, "")) : null
        )
      );
    }
  }, [step]);

  const puzzles = PHRASES.map((puzzle, idx) => {
    let encrypted = "";
    if (puzzle.type === "caesar") {
      encrypted = caesarCipher(puzzle.original, puzzle.shift);
    } else if (puzzle.type === "replace") {
      encrypted = replaceCipher(puzzle.original, puzzle.map);
    } else if (puzzle.type === "anagram") {
      encrypted =
        fixedAnagrams[idx] || anagram(puzzle.original.replace(/ /g, ""));
    }
    return { ...puzzle, encrypted };
  });

  const puzzle = puzzles[puzzleIndex];

  const startGame = () => {
    setPuzzleIndex(0);
    setStep("example");
    setInput("");
    setResult(null);
    setHintShown(false);
    setCompleted(false);
  };

  const startTask = () => setStep("game");

  const checkAnswer = (e) => {
    e.preventDefault();
    if (!puzzle) return;
    const answer = input.trim().toUpperCase();
    if (answer === puzzle.original) {
      if (puzzleIndex < puzzles.length - 1) {
        setResult("success");
        setTimeout(() => {
          setPuzzleIndex((i) => i + 1);
          setStep("example");
          setInput("");
          setResult(null);
          setHintShown(false);
        }, 800);
      } else {
        setResult("success");
        setStep("result");
        setCompleted(true);
      }
    } else {
      setResult("wrong");
      setTimeout(() => setResult(null), 1000);
    }
  };

  const giveUp = () => {
    setResult("fail");
    setStep("result");
    setCompleted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white text-black rounded-2xl border-4 border-black shadow-2xl p-8 min-w-[350px] max-w-lg font-pixel flex flex-col items-center gap-6">
        {step === "tutorial" && (
          <>
            <div className="text-2xl mb-2">Мини-игра: Взлом кода</div>
            <div className="text-base mb-4 text-left max-w-md">
              <b>Твоя задача:</b> последовательно расшифруй три фразы, используя
              логику и внимание.
              <br />
              <br />
              <b>Виды шифров:</b>
              <br />
              <ul className="list-disc ml-6 mb-2">
                <li>Шифр Цезаря: буквы сдвинуты на несколько позиций.</li>
                <li>Замена: буквы заменены по таблице.</li>
                <li>Анаграмма: буквы перемешаны.</li>
              </ul>
              <b>Вводи ответ КАПСОМ, без лишних пробелов.</b>
            </div>
            <div className="flex flex-row gap-4">
              <button
                className="bg-black text-white border-2 border-black rounded px-8 py-3 font-pixel hover:bg-white hover:text-black transition text-lg"
                onClick={startGame}
              >
                Начать
              </button>
              <button
                className="bg-gray-300 text-black border-2 border-black rounded px-8 py-3 font-pixel hover:bg-white hover:text-black transition text-lg"
                onClick={() => onFinish(false)}
              >
                Выйти
              </button>
            </div>
          </>
        )}
        {step === "example" && puzzle && (
          <>
            <div className="text-xl mb-2">
              Пример задачи {puzzleIndex + 1} из {puzzles.length}
            </div>
            <div className="mb-2 text-lg flex flex-row items-start">
              <div>
                <span className="font-bold">Зашифровано:</span>
                <div className="bg-gray-200 border-2 border-black rounded p-4 text-2xl tracking-widest mt-2 select-all">
                  {EXAMPLES[puzzle.type].encrypted}
                </div>
                <div className="mt-2 text-base">
                  <span className="font-bold">Ответ:</span>{" "}
                  {EXAMPLES[puzzle.type].original}
                </div>
                <div className="mt-2 text-base text-blue-700">
                  {EXAMPLES[puzzle.type].explain}
                </div>
              </div>
              {puzzle.type === "caesar" && <CaesarAlphabet />}
              {puzzle.type === "replace" && <ReplaceTable map={puzzle.map} />}
            </div>
            <button
              className="bg-black text-white border-2 border-black rounded px-8 py-3 font-pixel hover:bg-white hover:text-black transition text-lg"
              onClick={startTask}
            >
              К задаче
            </button>
          </>
        )}
        {step === "game" && puzzle && (
          <>
            <div className="text-xl mb-2">
              Задача {puzzleIndex + 1} из {puzzles.length}
            </div>
            <div className="mb-2 text-lg flex flex-row items-start">
              <div>
                <span className="font-bold">Зашифровано:</span>
                <div className="bg-gray-200 border-2 border-black rounded p-4 text-2xl tracking-widest mt-2 select-all">
                  {puzzle.encrypted}
                </div>
              </div>
              {puzzle.type === "caesar" && <CaesarAlphabet />}
              {puzzle.type === "replace" && <ReplaceTable map={puzzle.map} />}
            </div>
            <form
              onSubmit={checkAnswer}
              className="flex flex-col items-center gap-2 w-full"
            >
              <input
                className="border-2 border-black rounded px-4 py-2 text-lg w-full text-center font-mono tracking-widest"
                value={input}
                onChange={(e) => setInput(e.target.value.toUpperCase())}
                placeholder="Твой ответ..."
                autoFocus
                maxLength={32}
              />
              <button
                type="submit"
                className="bg-black text-white border-2 border-black rounded px-8 py-2 font-pixel hover:bg-white hover:text-black transition text-lg mt-2"
              >
                Проверить
              </button>
            </form>
            <button
              className="text-blue-700 underline mt-2"
              onClick={() => setHintShown(true)}
              disabled={hintShown}
            >
              Показать подсказку
            </button>
            {hintShown && (
              <div className="mt-2 text-base text-blue-700">
                {puzzle.type === "caesar" &&
                  `Это шифр Цезаря, сдвиг ${puzzle.shift}.`}
                {puzzle.type === "replace" &&
                  "Это шифр замены (таблица подстановки)."}
                {puzzle.type === "anagram" &&
                  "Это анаграмма — буквы перемешаны."}
              </div>
            )}
            <button className="text-red-600 underline mt-2" onClick={giveUp}>
              Сдаться
            </button>
            {result === "wrong" && (
              <div className="text-red-600 font-bold mt-2">Неверно!</div>
            )}
          </>
        )}
        {step === "result" && (
          <>
            {result === "success" && completed ? (
              <div className="text-green-700 text-2xl font-bold mb-2">
                Успех! Все задачи решены!
              </div>
            ) : result === "fail" ? (
              <div className="text-red-700 text-2xl font-bold mb-2">
                Попробуй ещё раз!
              </div>
            ) : null}
            <div className="mb-4">
              Правильный ответ: <b>{puzzle?.original}</b>
            </div>
            <button
              className="bg-black text-white border-2 border-black rounded px-8 py-3 font-pixel hover:bg-white hover:text-black transition text-lg"
              onClick={() => onFinish(result === "success" && completed)}
            >
              Вернуться
            </button>
          </>
        )}
      </div>
    </div>
  );
}
