import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ROUNDS = [
  {
    tasks: [
      "Добавить фичу",
      "Исправить баг",
      "Написать документацию",
      "Обработать фидбек клиентов",
    ],
    answer: [1, 3, 0, 2],
    explain: [
      "Баги критичны — их исправляют в первую очередь.",
      "Фидбек клиентов помогает улучшить продукт.",
      "Новые фичи — важно, но после багов и фидбека.",
      "Документация — важна, но не критична в моменте.",
    ],
  },
  {
    tasks: [
      "Провести исследование рынка",
      "Оптимизировать производительность",
      "Запустить рекламную кампанию",
      "Обновить дизайн интерфейса",
    ],
    answer: [0, 1, 3, 2],
    explain: [
      "Исследование рынка — основа для принятия решений.",
      "Оптимизация — влияет на качество продукта.",
      "Дизайн — важен для UX, но после основы и качества.",
      "Реклама — эффективна, когда продукт готов.",
    ],
  },
];

const ItemTypes = { TASK: "task" };

function TaskCard({ text, index, moveTask, isDragging }) {
  const ref = React.useRef(null);
  const [{ isDraggingItem }, drag] = useDrag(
    () => ({
      type: ItemTypes.TASK,
      item: { index },
      collect: (monitor) => ({
        isDraggingItem: monitor.isDragging(),
      }),
    }),
    [index]
  );

  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    hover(item) {
      if (item.index === index) return;
      moveTask(item.index, index);
      item.index = index;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`bg-blue-100 border-2 border-blue-500 rounded p-2 text-base font-mono mb-2 cursor-move select-none leading-tight transition-all duration-100 ${
        isDraggingItem ? "opacity-50" : ""
      }`}
      style={{
        minHeight: 32,
        maxWidth: 340,
        fontSize: "15px",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {text}
    </div>
  );
}

export default function PrioritizationGame({ onFinish }) {
  const [step, setStep] = useState("tutorial");
  const [roundIndex, setRoundIndex] = useState(0);
  const [order, setOrder] = useState([0, 1, 2, 3]);
  const [result, setResult] = useState(null);
  const [hintShown, setHintShown] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const startGame = () => {
    setRoundIndex(0);
    setStep("game");
    setOrder([0, 1, 2, 3]);
    setResult(null);
    setHintShown(false);
    setCompleted(false);
    setShowExplanations(false);
  };

  const moveTask = (from, to) => {
    setOrder((prev) => {
      const newOrder = [...prev];
      const [removed] = newOrder.splice(from, 1);
      newOrder.splice(to, 0, removed);
      return newOrder;
    });
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    const round = ROUNDS[roundIndex];
    const isCorrect = order.every((idx, i) => idx === round.answer[i]);
    if (isCorrect) {
      if (roundIndex < ROUNDS.length - 1) {
        setResult("success");
        setTimeout(() => {
          setRoundIndex((i) => i + 1);
          setOrder([0, 1, 2, 3]);
          setResult(null);
          setHintShown(false);
          setShowExplanations(false);
        }, 800);
      } else {
        setResult("success");
        setCompleted(true);
        setStep("result");
        setShowExplanations(true);
      }
    } else {
      setResult("wrong");
      setShowExplanations(true);
      setTimeout(() => setResult(null), 1200);
    }
  };

  const giveUp = () => {
    setResult("fail");
    setStep("result");
    setCompleted(true);
    setShowExplanations(true);
  };

  const round = ROUNDS[roundIndex];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="bg-white text-black rounded-2xl border-4 border-black shadow-2xl p-8 min-w-[350px] max-w-2xl font-pixel flex flex-col items-center gap-6">
          {step === "tutorial" && (
            <>
              <div className="text-2xl mb-2">
                Мини-игра: Приоритизация задач
              </div>
              <div className="text-base mb-4 text-left max-w-md">
                <b>Твоя задача:</b> расставь задачи по важности (сверху — самая
                важная).
                <br />
                <br />
                Перетаскивай задачи мышью или пальцем, чтобы изменить порядок.
                <br />
                <b>Используй drag-and-drop.</b>
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
                <div className="w-full flex flex-col gap-2 mt-2">
                  {order.map((idx, i) => (
                    <TaskCard
                      key={idx}
                      text={round.tasks[idx]}
                      index={i}
                      moveTask={(from, to) => moveTask(from, to)}
                    />
                  ))}
                </div>
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
                  Подумай, что критично для продукта, а что можно отложить.
                </div>
              )}
              <button className="text-red-600 underline mt-2" onClick={giveUp}>
                Сдаться
              </button>
              {result === "wrong" && (
                <div className="text-red-600 font-bold mt-2">
                  Неверно! Проверь порядок задач.
                </div>
              )}
              {showExplanations && (
                <div className="mt-4 w-full">
                  <div className="font-bold mb-2">Пояснения:</div>
                  {round.answer.map((taskIdx, i) => (
                    <div key={i} className="text-green-700">
                      <b>
                        {i + 1}. {round.tasks[taskIdx]}
                      </b>
                      : {round.explain[i]}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {step === "result" && (
            <>
              {result === "success" && completed ? (
                <div className="text-green-700 text-2xl font-bold mb-2">
                  Успех! Все раунды решены!
                </div>
              ) : result === "fail" ? (
                <div className="text-red-700 text-2xl font-bold mb-2">
                  Попробуй ещё раз!
                </div>
              ) : null}
              <div className="mb-4">
                <div className="font-bold mb-2">Пояснения:</div>
                {ROUNDS[roundIndex].answer.map((taskIdx, i) => (
                  <div key={i} className="text-green-700">
                    <b>
                      {i + 1}. {ROUNDS[roundIndex].tasks[taskIdx]}
                    </b>
                    : {ROUNDS[roundIndex].explain[i]}
                  </div>
                ))}
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
    </DndProvider>
  );
}
