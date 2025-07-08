import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ROUNDS = [
  {
    resumes: [
      {
        text: "Опыт работы: 3 года в IT-поддержке, коммуникабельный, быстро обучается, любит помогать людям.",
        answer: 1,
        explain:
          "Системный администратор — подходит по опыту и навыкам коммуникации.",
      },
      {
        text: "Выпускник экономического факультета, участвовал в олимпиадах по математике, любит анализировать данные.",
        answer: 0,
        explain:
          "Бизнес-аналитик — подходит по аналитическим и экономическим навыкам.",
      },
      {
        text: "Работал в школе, умеет объяснять сложные вещи простым языком, терпеливый, любит учиться.",
        answer: 2,
        explain:
          "Учебный методист — подходит по педагогическим и обучающим навыкам.",
      },
      {
        text: "Владеет английским, писал статьи для блога, интересуется технологиями, умеет структурировать информацию.",
        answer: 3,
        explain:
          "Технический писатель — подходит по навыкам структурирования и интересу к технологиям.",
      },
    ],
    positions: [
      "Бизнес-аналитик",
      "Системный администратор",
      "Учебный методист",
      "Технический писатель",
    ],
  },
  {
    resumes: [
      {
        text: "Опыт в продажах, коммуникабельный, умеет убеждать, любит работать с людьми.",
        answer: 2,
        explain:
          "Менеджер по продажам — подходит по опыту и навыкам коммуникации.",
      },
      {
        text: "Закончил факультет дизайна, владеет Figma, любит придумывать интерфейсы.",
        answer: 0,
        explain: "Дизайнер интерфейсов — подходит по образованию и навыкам.",
      },
      {
        text: "Писал тексты для сайтов, умеет быстро находить информацию, грамотный русский язык.",
        answer: 3,
        explain: "Контент-менеджер — подходит по опыту и навыкам.",
      },
      {
        text: "Любит анализировать данные, участвовал в олимпиадах по математике, внимательный к деталям.",
        answer: 1,
        explain: "Бизнес-аналитик — подходит по аналитическим навыкам.",
      },
    ],
    positions: [
      "Дизайнер интерфейсов",
      "Бизнес-аналитик",
      "Менеджер по продажам",
      "Контент-менеджер",
    ],
  },
];

const ItemTypes = { RESUME: "resume" };

function ResumeCard({ resume, index, isDragging }) {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: ItemTypes.RESUME,
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
      className="bg-yellow-100 border-2 border-yellow-500 rounded p-2 text-sm font-mono mb-1 cursor-move select-none leading-tight"
      style={{
        opacity,
        minHeight: 32,
        maxWidth: 320,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {resume}
    </div>
  );
}

function PositionDrop({ position, onDrop, candidate, isOver, canDrop }) {
  const [{ isOverCurrent, canDropCurrent }, drop] = useDrop(
    () => ({
      accept: ItemTypes.RESUME,
      drop: (item) => onDrop(item.index),
      collect: (monitor) => ({
        isOverCurrent: monitor.isOver(),
        canDropCurrent: monitor.canDrop(),
      }),
    }),
    [onDrop]
  );
  return (
    <div
      ref={drop}
      className={`border-2 rounded p-2 mb-1 text-base font-pixel flex items-center min-h-[36px] transition-all duration-150 w-full ${
        candidate !== null
          ? "bg-green-100 border-green-600"
          : isOverCurrent && canDropCurrent
          ? "bg-yellow-200 border-yellow-500"
          : "bg-white border-black hover:bg-yellow-50"
      }`}
      style={{
        minHeight: 36,
        maxWidth: 340,
        fontSize: "15px",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      <span className="flex-1 truncate">{position}</span>
      {candidate !== null && (
        <span className="ml-2 text-xs text-gray-700 truncate">{candidate}</span>
      )}
    </div>
  );
}

export default function HrProfileGame({ onFinish }) {
  const [step, setStep] = useState("tutorial");
  const [roundIndex, setRoundIndex] = useState(0);
  const [assignments, setAssignments] = useState([null, null, null, null]);
  const [result, setResult] = useState(null);
  const [hintShown, setHintShown] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const startGame = () => {
    setRoundIndex(0);
    setStep("game");
    setAssignments([null, null, null, null]);
    setResult(null);
    setHintShown(false);
    setCompleted(false);
    setShowExplanations(false);
  };

  const handleDrop = (resumeIdx, posIdx) => {
    setAssignments((prev) => {
      const newAssign = [...prev];
      for (let i = 0; i < newAssign.length; i++) {
        if (newAssign[i] === resumeIdx) newAssign[i] = null;
      }
      newAssign[posIdx] = resumeIdx;
      return newAssign;
    });
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    const round = ROUNDS[roundIndex];
    if (assignments.some((a) => a === null)) return;
    const isCorrect = assignments.every(
      (resumeIdx, posIdx) =>
        resumeIdx !== null && round.resumes[resumeIdx].answer === posIdx
    );
    if (isCorrect) {
      if (roundIndex < ROUNDS.length - 1) {
        setResult("success");
        setTimeout(() => {
          setRoundIndex((i) => i + 1);
          setAssignments([null, null, null, null]);
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

  const availableResumes = round.resumes
    .map((r, i) => (assignments.includes(i) ? null : { ...r, idx: i }))
    .filter(Boolean);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="bg-white text-black rounded-2xl border-4 border-black shadow-2xl p-8 min-w-[350px] max-w-2xl font-pixel flex flex-col items-center gap-6">
          {step === "tutorial" && (
            <>
              <div className="text-2xl mb-2">Мини-игра: Профиль кандидата</div>
              <div className="text-base mb-4 text-left max-w-md">
                <b>Твоя задача:</b> для каждой вакансии выбери подходящего
                кандидата, перетаскивая резюме мышью или пальцем.
                <br />
                <br />
                В каждом раунде 4 вакансии и 4 кандидата. У каждой вакансии —
                только один правильный кандидат.
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
                <div className="w-full flex flex-row gap-8 justify-between">
                  <div className="flex-1">
                    <div className="font-bold mb-2">Вакансии</div>
                    {round.positions.map((pos, posIdx) => (
                      <PositionDrop
                        key={posIdx}
                        position={pos}
                        candidate={
                          assignments[posIdx] !== null
                            ? round.resumes[assignments[posIdx]].text
                            : null
                        }
                        onDrop={(resumeIdx) => handleDrop(resumeIdx, posIdx)}
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold mb-2">Кандидаты</div>
                    {availableResumes.map((r) => (
                      <ResumeCard key={r.idx} resume={r.text} index={r.idx} />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-black text-white border-2 border-black rounded px-8 py-2 font-pixel hover:bg-white hover:text-black transition text-lg mt-2"
                  disabled={assignments.some((a) => a === null)}
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
                  Сопоставь навыки и опыт кандидата с требованиями вакансии.
                </div>
              )}
              <button className="text-red-600 underline mt-2" onClick={giveUp}>
                Сдаться
              </button>
              {result === "wrong" && (
                <div className="text-red-600 font-bold mt-2">
                  Неверно! Проверь соответствие всех кандидатов.
                </div>
              )}
              {showExplanations && (
                <div className="mt-4 w-full">
                  <div className="font-bold mb-2">Пояснения:</div>
                  {round.positions.map((pos, posIdx) => {
                    const assignedIdx = assignments[posIdx];
                    const isCorrect =
                      assignedIdx !== null &&
                      round.resumes[assignedIdx].answer === posIdx;
                    return (
                      <div
                        key={posIdx}
                        className={
                          isCorrect ? "text-green-700" : "text-red-700"
                        }
                      >
                        <b>{pos}:</b>{" "}
                        {assignedIdx !== null
                          ? round.resumes[assignedIdx].text
                          : "(не выбран)"}
                        <br />
                        <span className="text-xs">
                          {
                            round.resumes.find((r, i) => r.answer === posIdx)
                              ?.explain
                          }
                        </span>
                      </div>
                    );
                  })}
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
                {ROUNDS[roundIndex].positions.map((pos, posIdx) => {
                  const assignedIdx = assignments[posIdx];
                  const isCorrect =
                    assignedIdx !== null &&
                    ROUNDS[roundIndex].resumes[assignedIdx].answer === posIdx;
                  return (
                    <div
                      key={posIdx}
                      className={isCorrect ? "text-green-700" : "text-red-700"}
                    >
                      <b>{pos}:</b>{" "}
                      {assignedIdx !== null
                        ? ROUNDS[roundIndex].resumes[assignedIdx].text
                        : "(не выбран)"}
                      <br />
                      <span className="text-xs">
                        {
                          ROUNDS[roundIndex].resumes.find(
                            (r, i) => r.answer === posIdx
                          )?.explain
                        }
                      </span>
                    </div>
                  );
                })}
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
