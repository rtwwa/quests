import React, { useState } from "react";

const ROUNDS = [
  {
    code: ["1. function sum(a, b)", "2.   return a - b", "3. end"],
    answer: [1],
    explain: "Вместо a - b должно быть a + b.",
  },
  {
    code: ["1. if x = 5 then", "2.   print('ok')", "3. end"],
    answer: [0],
    explain: "Вместо x = 5 должно быть x == 5 (или x === 5).",
  },
  {
    code: ["1. arr = [1,2,3]", "2. print(arr[3])", "3. end"],
    answer: [1],
    explain: "arr[3] выходит за пределы массива (индексация с 0).",
  },
  {
    code: [
      "1. function isEven(n)",
      "2.   if n % 2 = 1 then",
      "3.     return true",
      "4.   else",
      "5.     return false",
      "6.   end",
      "7. end",
    ],
    answer: [1],
    explain:
      "Логика перепутана: для чётного должно быть n % 2 == 0, return true.",
  },
  {
    code: ["1. let x = 0", "2. while x < 5 do", "3.   x = x - 1", "4. end"],
    answer: [2],
    explain: "x уменьшается, цикл никогда не завершится. Нужно x = x + 1.",
  },
  {
    code: [
      "1. function max(a, b)",
      "2.   if a > b then",
      "3.     return a",
      "4.   else",
      "5.     return a",
      "6.   end",
      "7. end",
    ],
    answer: [4],
    explain: "Вместо return a должно быть return b во втором случае.",
  },
];

export default function TestingGame({ onFinish }) {
  const [step, setStep] = useState("tutorial");
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [hintShown, setHintShown] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const round = ROUNDS[roundIndex];

  const startGame = () => {
    setRoundIndex(0);
    setStep("game");
    setSelected([]);
    setResult(null);
    setHintShown(false);
    setCompleted(false);
    setShowExplanation(false);
  };

  const toggleSelect = (idx) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    const correct =
      selected.length === round.answer.length &&
      selected.every((i) => round.answer.includes(i)) &&
      round.answer.every((i) => selected.includes(i));
    if (correct) {
      if (roundIndex < ROUNDS.length - 1) {
        setResult("success");
        setTimeout(() => {
          setRoundIndex((i) => i + 1);
          setSelected([]);
          setResult(null);
          setHintShown(false);
          setShowExplanation(false);
        }, 800);
      } else {
        setResult("success");
        setCompleted(true);
        setStep("result");
        setShowExplanation(true);
      }
    } else {
      setResult("wrong");
      setShowExplanation(true);
      setTimeout(() => setResult(null), 1200);
    }
  };

  const giveUp = () => {
    setResult("fail");
    setStep("result");
    setCompleted(true);
    setShowExplanation(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white text-black rounded-2xl border-4 border-black shadow-2xl p-8 min-w-[350px] max-w-xl font-pixel flex flex-col items-center gap-6">
        {step === "tutorial" && (
          <>
            <div className="text-2xl mb-2">Мини-игра: Найди ошибку в коде</div>
            <div className="text-base mb-4 text-left max-w-md">
              <b>Твоя задача:</b> кликни по строке псевдокода, где есть ошибка.
              <br />
              <br />
              Иногда ошибка одна, иногда их несколько!
              <br />
              <b>Можно выделять несколько строк.</b>
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
        {step === "game" && (
          <>
            <div className="text-xl mb-2">
              Раунд {roundIndex + 1} из {ROUNDS.length}
            </div>
            <form
              onSubmit={checkAnswer}
              className="flex flex-col items-center gap-2 w-full"
            >
              <div className="w-full flex flex-col gap-1 mt-2 bg-gray-100 border border-black rounded p-3">
                {round.code.map((line, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-1 rounded cursor-pointer font-mono text-base transition-all duration-100 select-none ${
                      selected.includes(idx)
                        ? "bg-red-200 border border-red-600 text-red-900"
                        : "hover:bg-yellow-100"
                    }`}
                    onClick={() => toggleSelect(idx)}
                  >
                    {line}
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="bg-black text-white border-2 border-black rounded px-8 py-2 font-pixel hover:bg-white hover:text-black transition text-lg mt-2"
                disabled={selected.length === 0 || result !== null}
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
                Внимательно смотри на логику, индексы, условия и синтаксис!
              </div>
            )}
            <button className="text-red-600 underline mt-2" onClick={giveUp}>
              Сдаться
            </button>
            {result === "wrong" && (
              <div className="text-red-600 font-bold mt-2">
                Неверно! Попробуй ещё раз, подумай над логикой.
              </div>
            )}
            {showExplanation && (
              <div className="mt-4 w-full">
                <div className="font-bold mb-2">Пояснение:</div>
                <div className="text-green-700">{round.explain}</div>
              </div>
            )}
          </>
        )}
        {step === "result" && (
          <>
            {result === "success" && completed ? (
              <div className="text-green-700 text-2xl font-bold mb-2">
                Успех! Все ошибки найдены!
              </div>
            ) : result === "fail" ? (
              <div className="text-red-700 text-2xl font-bold mb-2">
                Попробуй ещё раз!
              </div>
            ) : null}
            <div className="mb-4">
              <div className="font-bold mb-2">Пояснение:</div>
              <div className="text-green-700">{round.explain}</div>
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
