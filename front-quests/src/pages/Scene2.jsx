import React, { useState, useCallback, useEffect, useRef } from "react";
import DialogSystem from "../components/DialogSystem";
import CharacterStats from "../components/CharacterStats";

const GRID_SIZE = 15;
const CELL_SIZE = 40;
const SPRITE = "/sprites/mainCharacterModel.png";

const npc = {
  id: 1,
  x: 7,
  y: 7,
  name: "Загадочный Проводник",
  portrait: "/sprites/npc-guide.png",
};

const dialogTree = {
  npc: { name: npc.name, portrait: npc.portrait },
  nodes: {
    start: {
      text: "Ты пришёл дальше, чем многие. Готов узнать больше?",
      options: [
        { id: 1, text: "Да, расскажи мне всё!", next: "reply1" },
        { id: 2, text: "Я пока не готов.", next: "reply2" },
      ],
    },
    reply1: {
      text: "В каждом из нас есть искра. Но только ты решаешь, что с ней делать.",
      options: [{ id: 0, text: "Спасибо", next: null }],
    },
    reply2: {
      text: "Путь открыт. Возвращайся, когда будешь готов.",
      options: [{ id: 0, text: "Уйти", next: null }],
    },
  },
};

const initialStats = {
  creativity: 0,
  empathy: 0,
  bravery: 0,
  logic: 0,
  organization: 0,
};

function isAdjacent(a, b) {
  return (
    (Math.abs(a.x - b.x) === 1 && a.y === b.y) ||
    (Math.abs(a.y - b.y) === 1 && a.x === b.x)
  );
}

export default function Scene2() {
  const [pos, setPos] = useState({ x: 7, y: 13 });
  const [activeKey, setActiveKey] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogNodeKey, setDialogNodeKey] = useState("start");
  const [stats, setStats] = useState(initialStats);
  const keyTimeout = useRef(null);

  const tiles = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => "grass.png")
  );

  const canMove = (x, y) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    return true;
  };

  const move = useCallback(
    (dx, dy) => {
      if (showDialog) return;
      setPos((prev) => {
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        if (canMove(nx, ny)) {
          return { x: nx, y: ny };
        }
        return prev;
      });
    },
    [showDialog]
  );

  useEffect(() => {
    function handleKey(e) {
      if (showDialog) return;
      const keyMap = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
      };
      const moveArr = keyMap[e.key];
      if (moveArr) {
        if (keyTimeout.current) clearTimeout(keyTimeout.current);
        setActiveKey(e.key);
        move(...moveArr);
        keyTimeout.current = setTimeout(() => setActiveKey(null), 120);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (keyTimeout.current) clearTimeout(keyTimeout.current);
    };
  }, [move, showDialog]);

  const controls = [
    { key: "up", dx: 0, dy: -1 },
    { key: "left", dx: -1, dy: 0 },
    { key: "right", dx: 1, dy: 0 },
    { key: "down", dx: 0, dy: 1 },
  ];

  const handlePress = (key, dx, dy) => {
    if (showDialog) return;
    setActiveKey(key);
    move(dx, dy);
  };
  const handleRelease = () => setActiveKey(null);

  useEffect(() => {
    if (showDialog) return;
    if (isAdjacent(pos, npc)) {
      setShowDialog(true);
      setDialogNodeKey("start");
    }
  }, [pos, showDialog]);

  const handleDialogSelect = (option) => {
    if (!option.next) {
      setShowDialog(false);
      setDialogNodeKey("start");
    } else {
      setDialogNodeKey(option.next);
    }
  };

  const renderTile = (x, y) => {
    const isPlayer = pos.x === x && pos.y === y;
    const isNpc = npc.x === x && npc.y === y;
    const tile = tiles[y][x];
    return (
      <div
        key={y + "," + x}
        className="flex items-center justify-center relative"
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          background: tile ? "#111" : "#000",
        }}
      >
        {tile && (
          <img
            src={`/sprites/tiles/${tile}`}
            alt="grass"
            className="absolute left-0 top-0 w-full h-full z-0"
            style={{ imageRendering: "pixelated" }}
          />
        )}
        {isNpc && (
          <img
            src={npc.portrait}
            alt={npc.name}
            className="w-8 h-8 z-20 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ imageRendering: "pixelated" }}
          />
        )}
        {isPlayer && (
          <img
            src={SPRITE}
            alt="player"
            className="w-8 h-8 z-30 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ imageRendering: "pixelated" }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <CharacterStats stats={stats} />
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          border: "2px solid white",
          background: "#000",
        }}
      >
        {Array.from({ length: GRID_SIZE }, (_, y) =>
          Array.from({ length: GRID_SIZE }, (_, x) => renderTile(x, y))
        )}
      </div>
      <div className="flex gap-2 mt-2">
        {controls.map((c) => (
          <button
            key={c.key}
            className={`bg-transparent border-none p-0 transition-transform duration-75 ${
              activeKey === c.key ? "scale-90 brightness-75" : ""
            }`}
            onMouseDown={() => handlePress(c.key, c.dx, c.dy)}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={() => handlePress(c.key, c.dx, c.dy)}
            onTouchEnd={handleRelease}
            aria-label={c.key}
          >
            <img
              src={`/sprites/keys/k-${c.key}.png`}
              alt={c.key}
              className="w-8 h-8"
              style={{ imageRendering: "pixelated" }}
            />
          </button>
        ))}
      </div>
      {showDialog && (
        <DialogSystem
          npc={dialogTree.npc}
          node={dialogTree.nodes[dialogNodeKey]}
          options={dialogTree.nodes[dialogNodeKey].options}
          onSelect={handleDialogSelect}
          stats={stats}
        />
      )}
    </div>
  );
}
