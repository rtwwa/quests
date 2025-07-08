import React, { useState } from "react";

const EXAMPLES = [
  {
    data: [
      { label: "Понедельник", value: 1000 },
      { label: "Вторник", value: 1100 },
      { label: "Среда", value: 1200 },
      { label: "Четверг", value: 20000 },
    ],
    answer: 3,
    explain:
      "В четверг резкий скачок: 20 000, остальные значения около 1000-1200.",
  },
];

const TASKS = [
  {
    data: [
      { label: "Январь", value: 5000 },
      { label: "Февраль", value: 5200 },
      { label: "Март", value: 5100 },
      { label: "Апрель", value: 15000 },
      { label: "Май", value: 5300 },
    ],
    answer: 3,
  },
  {
    data: [
      { label: "09:00", value: 120 },
      { label: "10:00", value: 130 },
      { label: "11:00", value: 125 },
      { label: "12:00", value: 800 },
      { label: "13:00", value: 128 },
    ],
    answer: 3,
  },
  {
    data: [
      { label: "Пн", value: 200 },
      { label: "Вт", value: 210 },
      { label: "Ср", value: 205 },
      { label: "Чт", value: 208 },
      { label: "Пт", value: 1000 },
    ],
    answer: 4,
  },
  {
    data: [
      { label: "Сайт A", value: 3000 },
      { label: "Сайт B", value: 3100 },
      { label: "Сайт C", value: 9000 },
      { label: "Сайт D", value: 3200 },
    ],
    answer: 2,
  },
  {
    data: [
      { label: "2021", value: 10000 },
      { label: "2022", value: 10200 },
      { label: "2023", value: 10100 },
      { label: "2024", value: 500 },
    ],
    answer: 3,
  },
  {
    data: [
      { label: "Москва", value: 500 },
      { label: "Питер", value: 520 },
      { label: "Казань", value: 510 },
      { label: "Тула", value: 1500 },
      { label: "Самара", value: 530 },
    ],
    answer: 3,
  },
];

export default function DataAnomalyGame({ onFinish }) {
  const [step, setStep] = useState("tutorial");
  const [taskIndex, setTaskIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hintShown, setHintShown] = useState(false);
  const [completed, setCompleted] = useState(false);

  const startGame = () => {
    setTaskIndex(0);
    setStep("game");
    setResult(null);
    setSelected(null);
    setHintShown(false);
    setCompleted(false);
  };

  const startTask = () => setStep("game");

  const handleSelect = (idx) => {
    setSelected(idx);
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    if (selected === null) return;
    const task = TASKS[taskIndex];
    if (selected === task.answer) {
      if (taskIndex < TASKS.length - 1) {
        setResult("success");
        setTimeout(() => {
          setTaskIndex((i) => i + 1);
          setResult(null);
          setSelected(null);
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
            <div className="text-2xl mb-2">Мини-игра: Выяви аномалию</div>
            <div className="text-base mb-4 text-left max-w-md">
              <b>Твоя задача:</b> в каждом наборе данных найти аномальную строку
              — ту, что выбивается из общего ряда.
              <br />
              <br />
              В каждом задании выбери одну строку, которая кажется
              подозрительной или выбивается из общего тренда.
              <br />
              <b>Вводи ответ внимательно!</b>
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
              Задача {taskIndex + 1} из {TASKS.length}
            </div>
            <form
              onSubmit={checkAnswer}
              className="flex flex-col items-center gap-2 w-full"
            >
              <div className="bg-gray-100 border border-black rounded p-2 mt-2 mb-2 w-full">
                {TASKS[taskIndex].data.map((row, i) => (
                  <div
                    key={i}
                    className={`flex flex-row gap-2 cursor-pointer items-center rounded px-2 py-1 mb-1 w-full ${
                      selected === i
                        ? "bg-yellow-200 border-2 border-yellow-500"
                        : "hover:bg-yellow-100"
                    }`}
                    onClick={() => handleSelect(i)}
                  >
                    <input
                      type="radio"
                      checked={selected === i}
                      onChange={() => handleSelect(i)}
                      className="mr-2"
                    />
                    <span className="flex-1">{row.label}:</span>
                    <span>{row.value.toLocaleString("ru-RU")}</span>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="bg-black text-white border-2 border-black rounded px-8 py-2 font-pixel hover:bg-white hover:text-black transition text-lg mt-2"
                disabled={selected === null}
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
                Подумай, какое значение выбивается из общего ряда.
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
              Правильный ответ:
              <div className="bg-gray-100 border border-black rounded p-2 mt-2 mb-2">
                {TASKS[taskIndex].data.map((row, i) => (
                  <div
                    key={i}
                    className={
                      TASKS[taskIndex].answer === i
                        ? "font-bold text-green-700"
                        : ""
                    }
                  >
                    {row.label}: {row.value.toLocaleString("ru-RU")}
                  </div>
                ))}
              </div>
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
