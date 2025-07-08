import React, { useState } from "react";

const ROUNDS = [
  {
    type: "chain",
    text: "A → B → C. C отдает 500. Где причина сбоя?",
    services: ["A", "B", "C"],
    answer: ["C"],
    explain: "C возвращает 500 — проблема в нем.",
  },
  {
    type: "fanout",
    text: "A вызывает B и C. B работает, C отдает 500. Где проблема?",
    services: ["A", "B", "C"],
    answer: ["C"],
    explain: "C падает, B работает — проблема в C.",
  },
  {
    type: "cycle",
    text: "A → B → C → A. B и C отдают 200, A — 500. Где искать причину?",
    services: ["A", "B", "C"],
    answer: ["A"],
    explain: "A падает, остальные работают — проблема в A.",
  },
  {
    type: "multi",
    text: "A → B → C, D → C. C отдает 500, B и D — 502. Где искать корень?",
    services: ["A", "B", "C", "D"],
    answer: ["C"],
    explain: "C падает, B и D получают ошибку от C.",
  },
  {
    type: "false-trace",
    text: "A → B → C, C отдает 200, B — 500. Где проблема?",
    services: ["A", "B", "C"],
    answer: ["B"],
    explain: "C работает, B падает — проблема в B.",
  },
  {
    type: "multi-root",
    text: "A → B, A → C. B и C оба отдают 500. Где искать?",
    services: ["A", "B", "C"],
    answer: ["B", "C"],
    explain: "Оба сервиса падают — возможно, проблема в обоих.",
  },
  {
    type: "complex",
    text: "A → B → C, B → D. D отдает 500, C — 200, B — 502, A — 502. Где корень?",
    services: ["A", "B", "C", "D"],
    answer: ["D"],
    explain: "D падает, B получает ошибку от D, остальные — по цепочке.",
  },
];

export default function DevOpsGame({ onFinish }) {
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

  const toggleSelect = (service) => {
    setSelected((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    const correct =
      selected.length === round.answer.length &&
      selected.every((s) => round.answer.includes(s)) &&
      round.answer.every((s) => selected.includes(s));
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
            <div className="text-2xl mb-2">Мини-игра: Найди, что упало</div>
            <div className="text-base mb-4 text-left max-w-md">
              <b>Твоя задача:</b> по логам или схеме зависимостей сервисов
              определить, где причина сбоя.
              <br />
              <br />
              Иногда виноват один сервис, иногда — несколько!
              <br />
              <b>Выделяй сервисы кликом, можно выбрать несколько.</b>
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
            <div className="mb-2 text-lg font-mono bg-gray-100 border border-black rounded p-3 w-full text-center">
              {round.text}
            </div>
            <form
              onSubmit={checkAnswer}
              className="flex flex-col items-center gap-2 w-full"
            >
              <div className="w-full flex flex-row flex-wrap gap-2 justify-center mt-2">
                {round.services.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`border-2 rounded px-6 py-2 font-pixel text-lg transition-all duration-100 select-none ${
                      selected.includes(s)
                        ? "bg-red-200 border-red-600 text-red-900"
                        : "bg-white border-black hover:bg-yellow-100"
                    }`}
                    onClick={() => toggleSelect(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="bg-black text-white border-2 border-black rounded px-8 py-2 font-pixel hover:bg-white hover:text-black transition text-lg mt-2"
                disabled={selected.length === 0}
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
                Внимательно смотри на коды ошибок и цепочки вызовов!
              </div>
            )}
            <button className="text-red-600 underline mt-2" onClick={giveUp}>
              Сдаться
            </button>
            {result === "wrong" && (
              <div className="text-red-600 font-bold mt-2">
                Неверно! Попробуй ещё раз, подумай над связями.
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
                Успех! Все сбои найдены!
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
