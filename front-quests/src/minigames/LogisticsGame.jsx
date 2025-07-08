import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const CITY_COORDS = {
  "Склад A": { x: 10, y: 60 },
  "Склад B": { x: 10, y: 30 },
  "Склад C": { x: 10, y: 80 },
  Москва: { x: 90, y: 50 },
  "Санкт-Петербург": { x: 90, y: 20 },
  Казань: { x: 90, y: 80 },
  Владимир: { x: 40, y: 75 },
  Тверь: { x: 60, y: 50 },
  Тула: { x: 50, y: 70 },
  Рязань: { x: 55, y: 80 },
  "Великий Новгород": { x: 60, y: 25 },
  Псков: { x: 70, y: 10 },
  Вологда: { x: 60, y: 10 },
  "Нижний Новгород": { x: 60, y: 75 },
  Ульяновск: { x: 50, y: 90 },
  Самара: { x: 70, y: 90 },
  Пенза: { x: 40, y: 90 },
};

const ROUNDS = [
  {
    from: "Склад A",
    to: "Москва",
    cities: ["Владимир", "Тверь", "Тула", "Рязань"],
    optimal: ["Склад A", "Тверь", "Москва"],
  },
  {
    from: "Склад B",
    to: "Санкт-Петербург",
    cities: ["Великий Новгород", "Псков", "Тверь", "Вологда"],
    optimal: ["Склад B", "Великий Новгород", "Санкт-Петербург"],
  },
  {
    from: "Склад C",
    to: "Казань",
    cities: ["Нижний Новгород", "Ульяновск", "Самара", "Пенза"],
    optimal: ["Склад C", "Нижний Новгород", "Казань"],
  },
];

const ItemTypes = { CITY: "city" };

function CityCard({ name, index }) {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: ItemTypes.CITY,
      item: { index },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
      }),
    }),
    [index]
  );
  return (
    <div
      ref={drag}
      className="bg-blue-100 border-2 border-blue-500 rounded p-2 text-base font-mono mb-2 cursor-move select-none leading-tight transition-all duration-100"
      style={{
        opacity,
        minHeight: 32,
        maxWidth: 180,
        fontSize: "15px",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {name}
    </div>
  );
}

function RouteSlot({ city, onDrop, canDrop, isOver, fixed }) {
  const [{ isOverCurrent, canDropCurrent }, drop] = useDrop(
    () => ({
      accept: ItemTypes.CITY,
      drop: (item) => onDrop(item.index),
      canDrop: () => !fixed,
      collect: (monitor) => ({
        isOverCurrent: monitor.isOver(),
        canDropCurrent: monitor.canDrop(),
      }),
    }),
    [onDrop, fixed]
  );
  return (
    <div
      ref={drop}
      className={`border-2 rounded p-2 mb-2 text-base font-pixel flex items-center min-h-[36px] transition-all duration-150 w-full ${
        fixed
          ? "bg-gray-200 border-gray-400"
          : city
          ? "bg-green-100 border-green-600"
          : isOverCurrent && canDropCurrent
          ? "bg-yellow-100 border-yellow-500"
          : "bg-white border-black hover:bg-yellow-50"
      }`}
      style={{
        minHeight: 36,
        maxWidth: 200,
        fontSize: "15px",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {city ||
        (fixed ? (
          <span className="text-gray-500">(фикс.)</span>
        ) : (
          <span className="text-gray-400">Перетащи город</span>
        ))}
    </div>
  );
}

function MapView({ from, to, cities, route }) {
  const all = [from, ...cities, to];
  const points = all.map((name) => ({ name, ...CITY_COORDS[name] }));
  const routePoints = route.filter(Boolean).map((name) => CITY_COORDS[name]);
  return (
    <svg
      width={400}
      height={220}
      className="mb-4 bg-blue-50 rounded border border-blue-200"
    >
      {/* Связи маршрута */}
      {routePoints.length > 1 &&
        routePoints.slice(1).map((pt, i) => {
          const prev = routePoints[i];
          return (
            <line
              key={i}
              x1={prev.x * 4}
              y1={prev.y * 2}
              x2={pt.x * 4}
              y2={pt.y * 2}
              stroke="#2563eb"
              strokeWidth={3}
              markerEnd="url(#arrow)"
            />
          );
        })}
      <defs>
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
        </marker>
      </defs>
      {/* Точки */}
      {points.map((pt, i) => (
        <circle
          key={pt.name}
          cx={pt.x * 4}
          cy={pt.y * 2}
          r={pt.name === from ? 10 : pt.name === to ? 10 : 7}
          fill={
            pt.name === from
              ? "#f59e42"
              : pt.name === to
              ? "#22c55e"
              : route.includes(pt.name)
              ? "#2563eb"
              : "#fff"
          }
          stroke="#222"
          strokeWidth={2}
        />
      ))}
      {/* Подписи */}
      {points.map((pt, i) => (
        <text
          key={pt.name + "_label"}
          x={pt.x * 4 + 12}
          y={pt.y * 2 + 4}
          fontSize={pt.name === from || pt.name === to ? 16 : 13}
          fill="#222"
        >
          {pt.name}
        </text>
      ))}
    </svg>
  );
}

export default function LogisticsGame({ onFinish }) {
  const [step, setStep] = useState("tutorial");
  const [roundIndex, setRoundIndex] = useState(0);
  const [route, setRoute] = useState([null, null, null, null, null]);
  const [result, setResult] = useState(null);
  const [hintShown, setHintShown] = useState(false);
  const [completed, setCompleted] = useState(false);

  const round = ROUNDS[roundIndex];
  const routeLength = round.optimal.length;

  React.useEffect(() => {
    if (step === "game") {
      const arr = Array(routeLength).fill(null);
      arr[0] = round.from;
      arr[routeLength - 1] = round.to;
      setRoute(arr);
    }
  }, [step, roundIndex]);

  const availableCities = round.cities.filter((city) => !route.includes(city));

  const handleDrop = (cityIdx, slotIdx) => {
    setRoute((prev) => {
      const arr = [...prev];
      for (let i = 1; i < arr.length - 1; i++) {
        if (arr[i] === round.cities[cityIdx]) arr[i] = null;
      }
      arr[slotIdx] = round.cities[cityIdx];
      return arr;
    });
  };

  const startGame = () => {
    setRoundIndex(0);
    setStep("game");
    setResult(null);
    setHintShown(false);
    setCompleted(false);
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    if (
      route.some((city, idx) => idx !== 0 && idx !== routeLength - 1 && !city)
    )
      return;
    const userRoute = route.filter(Boolean);
    const isCorrect =
      userRoute.length === round.optimal.length &&
      userRoute.every((city, i) => city === round.optimal[i]);
    if (isCorrect) {
      if (roundIndex < ROUNDS.length - 1) {
        setResult("success");
        setTimeout(() => {
          setRoundIndex((i) => i + 1);
          setResult(null);
          setHintShown(false);
        }, 800);
      } else {
        setResult("success");
        setCompleted(true);
        setStep("result");
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
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="bg-white text-black rounded-2xl border-4 border-black shadow-2xl p-8 min-w-[350px] max-w-2xl font-pixel flex flex-col items-center gap-6">
          {step === "tutorial" && (
            <>
              <div className="text-2xl mb-2">Мини-игра: Реши доставку</div>
              <div className="text-base mb-4 text-left max-w-md">
                <b>Твоя задача:</b> проложи оптимальный маршрут доставки,
                перетаскивая города в маршрут.
                <br />
                <br />
                Не обязательно использовать все города!
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
              <MapView
                from={round.from}
                to={round.to}
                cities={round.cities}
                route={route}
              />
              <div className="text-xl mb-2">
                Раунд {roundIndex + 1} из {ROUNDS.length}
              </div>
              <form
                onSubmit={checkAnswer}
                className="flex flex-col items-center gap-2 w-full"
              >
                <div className="w-full flex flex-row gap-8 justify-between">
                  <div className="flex-1">
                    <div className="font-bold mb-2">Маршрут</div>
                    {route.map((city, idx) => (
                      <RouteSlot
                        key={idx}
                        city={city}
                        onDrop={(cityIdx) => handleDrop(cityIdx, idx)}
                        fixed={idx === 0 || idx === routeLength - 1}
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold mb-2">Доступные города</div>
                    {availableCities.map((city, i) => (
                      <CityCard key={i} name={city} index={i} />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-black text-white border-2 border-black rounded px-8 py-2 font-pixel hover:bg-white hover:text-black transition text-lg mt-2"
                  disabled={route.some(
                    (city, idx) => idx !== 0 && idx !== routeLength - 1 && !city
                  )}
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
                  Не обязательно использовать все города! Найди кратчайший и
                  оптимальный путь.
                </div>
              )}
              <button className="text-red-600 underline mt-2" onClick={giveUp}>
                Сдаться
              </button>
              {result === "wrong" && (
                <div className="text-red-600 font-bold mt-2">
                  Неверно! Попробуй ещё раз, подумай над маршрутом.
                </div>
              )}
            </>
          )}
          {step === "result" && (
            <>
              {result === "success" && completed ? (
                <div className="text-green-700 text-2xl font-bold mb-2">
                  Успех! Все маршруты проложены!
                </div>
              ) : result === "fail" ? (
                <div className="text-red-700 text-2xl font-bold mb-2">
                  Попробуй ещё раз!
                </div>
              ) : null}
              <div className="mb-4">
                <div className="font-bold mb-2">Оптимальный маршрут:</div>
                <div className="text-green-700">
                  {round.optimal.join(" → ")}
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
    </DndProvider>
  );
}
