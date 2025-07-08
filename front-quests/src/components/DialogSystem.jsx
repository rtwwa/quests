import { useEffect } from "react";

function checkRequirements(stats, required) {
  if (!required) return true;
  return Object.entries(required).every(
    ([key, val]) => (stats[key] ?? 0) >= val
  );
}

const statLabels = {
  creativity: "Креатив",
  empathy: "Эмпатия",
  bravery: "Отвага",
  logic: "Логика",
  organization: "Организация",
};

function renderRequirements(requiredStats) {
  if (!requiredStats) return null;
  const reqs = Object.entries(requiredStats)
    .map(([key, val]) => `${statLabels[key] || key} ${val}`)
    .join(", ");

  if (reqs == 0) return null;

  return <span className="text-xs text-blue-600 ml-4">Требуется: {reqs}</span>;
}

export default function DialogSystem({ npc, node, options, onSelect, stats }) {
  useEffect(() => {
    function handleKey(e) {
      if (!options) return;
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < options.length) {
        const opt = options[idx];
        if (checkRequirements(stats, opt.requiredStats)) {
          onSelect(opt);
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [options, onSelect, stats]);

  return (
    <div
      className={
        "fixed z-50 flex items-end md:items-end justify-center " +
        "inset-0 md:inset-x-0 md:inset-y-auto md:left-0 md:right-0 md:bottom-0 " +
        "md:max-w-7xl md:mx-auto bg-black bg-opacity-60"
      }
      style={{ pointerEvents: "auto" }}
    >
      <div
        className={
          "bg-white text-black border-2 border-black font-pixel " +
          "flex items-start gap-6 p-6 md:p-8 " +
          "w-full max-w-full max-h-full md:w-[1200px] md:max-w-7xl md:rounded-t-2xl md:shadow-2xl"
        }
      >
        <img
          src={npc.portrait}
          alt={npc.name}
          className="w-32 h-32 md:w-48 md:h-48 object-contain border-2 border-black bg-white"
          style={{ imageRendering: "pixelated" }}
        />
        <div className="flex-1 flex flex-col">
          <div className="text-xl font-bold mb-2">{npc.name}</div>
          <div className="text-lg mb-6 whitespace-pre-line">{node.text}</div>
          <div className="flex flex-col">
            {options &&
              options.map((opt, i) => {
                const available = checkRequirements(stats, opt.requiredStats);
                return (
                  <button
                    key={opt.id}
                    className={
                      "text-left bg-black text-white border-2 border-black px-6 py-3 font-pixel transition text-lg flex justify-between items-center " +
                      (available
                        ? "hover:bg-white hover:text-black cursor-pointer"
                        : "opacity-50 cursor-not-allowed")
                    }
                    onClick={() => available && onSelect(opt)}
                    disabled={!available}
                  >
                    <span>
                      {i + 1}. {opt.text}
                    </span>
                    <span className="ml-4 flex items-center gap-2">
                      {opt.requiredStats &&
                        renderRequirements(opt.requiredStats)}
                      {opt.requiredStats && !available && (
                        <span className="text-xs text-red-600 ml-2">
                          (недостаточно)
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
