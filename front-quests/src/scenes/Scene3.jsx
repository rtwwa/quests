import React, { useState, useCallback, useEffect, useRef } from "react";
import DialogSystem from "../components/DialogSystem";
import CharacterStats from "../components/CharacterStats";
import CryptoGame from "../minigames/CryptoGame";
import DataAnomalyGame from "../minigames/DataAnomalyGame";
import HrProfileGame from "../minigames/HrProfileGame";
import PrioritizationGame from "../minigames/PrioritizationGame";
import LogisticsGame from "../minigames/LogisticsGame";
import DevOpsGame from "../minigames/DevOpsGame";
import TestingGame from "../minigames/TestingGame";

const GRID_SIZE = 15;
const CELL_SIZE = 40;
const SPRITE = "/sprites/mainCharacterModel.png";

const npcs = [
  {
    id: 1,
    x: 3,
    y: 3,
    name: "NPC 1",
    portrait: "/sprites/npc.png",
    minigame: "crypto",
  },
  {
    id: 2,
    x: 11,
    y: 3,
    name: "NPC 2",
    portrait: "/sprites/npc.png",
    minigame: "data",
  },
  {
    id: 3,
    x: 3,
    y: 11,
    name: "NPC 3",
    portrait: "/sprites/npc.png",
    minigame: "hr",
  },
  {
    id: 4,
    x: 11,
    y: 11,
    name: "NPC 4",
    portrait: "/sprites/npc.png",
    minigame: "prior",
  },
  {
    id: 5,
    x: 7,
    y: 3,
    name: "NPC 5",
    portrait: "/sprites/npc.png",
    minigame: "logistics",
  },
  {
    id: 6,
    x: 3,
    y: 7,
    name: "NPC 6",
    portrait: "/sprites/npc.png",
    minigame: "devops",
  },
  {
    id: 7,
    x: 11,
    y: 7,
    name: "NPC 7",
    portrait: "/sprites/npc.png",
    minigame: "testing",
  },
];

const dialogTrees = Object.fromEntries(
  npcs.map((npc) => [
    npc.id,
    {
      npc: { name: npc.name, portrait: npc.portrait },
      nodes: {
        start: {
          text: `Привет, я ${npc.name}. Это заглушка диалога.`,
          options: [{ id: 1, text: "Пока!", next: null }],
        },
      },
    },
  ])
);

function isAdjacent(a, b) {
  return (
    (Math.abs(a.x - b.x) === 1 && a.y === b.y) ||
    (Math.abs(a.y - b.y) === 1 && a.x === b.x)
  );
}

export default function Scene3({ stats, updateStats }) {
  const [pos, setPos] = useState({ x: 7, y: 13 });
  const [activeKey, setActiveKey] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentNpcId, setCurrentNpcId] = useState(null);
  const [dialogNodeKey, setDialogNodeKey] = useState("start");
  const [completedNpcs, setCompletedNpcs] = useState([]);
  const [showMinigame, setShowMinigame] = useState(false);
  const [showDataGame, setShowDataGame] = useState(false);
  const [showHrGame, setShowHrGame] = useState(false);
  const [showPriorGame, setShowPriorGame] = useState(false);
  const [showLogisticsGame, setShowLogisticsGame] = useState(false);
  const [showDevOpsGame, setShowDevOpsGame] = useState(false);
  const [showTestingGame, setShowTestingGame] = useState(false);
  const keyTimeout = useRef(null);
  const [recentlyClosedNpcId, setRecentlyClosedNpcId] = useState(null);

  const tiles = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => "grass.png")
  );

  const canMove = (x, y) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    if (npcs.some((n) => n.x === x && n.y === y)) return false;
    return true;
  };

  const move = useCallback(
    (dx, dy) => {
      if (
        showDialog ||
        showMinigame ||
        showDataGame ||
        showHrGame ||
        showPriorGame ||
        showLogisticsGame ||
        showDevOpsGame ||
        showTestingGame
      )
        return;
      setPos((prev) => {
        const nx = prev.x + dx;
        const ny = prev.y + dy;
        if (canMove(nx, ny)) {
          return { x: nx, y: ny };
        }
        return prev;
      });
    },
    [
      showDialog,
      showMinigame,
      showDataGame,
      showHrGame,
      showPriorGame,
      showLogisticsGame,
      showDevOpsGame,
      showTestingGame,
    ]
  );

  useEffect(() => {
    function handleKey(e) {
      if (
        showDialog ||
        showMinigame ||
        showDataGame ||
        showHrGame ||
        showPriorGame ||
        showLogisticsGame ||
        showDevOpsGame ||
        showTestingGame
      )
        return;
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
  }, [
    move,
    showDialog,
    showMinigame,
    showDataGame,
    showHrGame,
    showPriorGame,
    showLogisticsGame,
    showDevOpsGame,
    showTestingGame,
  ]);

  const controls = [
    { key: "up", dx: 0, dy: -1 },
    { key: "left", dx: -1, dy: 0 },
    { key: "right", dx: 1, dy: 0 },
    { key: "down", dx: 0, dy: 1 },
  ];

  const handlePress = (key, dx, dy) => {
    if (
      showDialog ||
      showMinigame ||
      showDataGame ||
      showHrGame ||
      showPriorGame ||
      showLogisticsGame ||
      showDevOpsGame ||
      showTestingGame
    )
      return;
    setActiveKey(key);
    move(dx, dy);
  };
  const handleRelease = () => setActiveKey(null);

  useEffect(() => {
    if (
      showDialog ||
      showMinigame ||
      showDataGame ||
      showHrGame ||
      showPriorGame ||
      showLogisticsGame ||
      showDevOpsGame ||
      showTestingGame
    )
      return;
    const npc = npcs.find(
      (n) => isAdjacent(pos, n) && !completedNpcs.includes(n.id)
    );
    if (npc) {
      if (npc.minigame === "crypto") {
        if (recentlyClosedNpcId !== npc.id) {
          setShowMinigame(true);
          setCurrentNpcId(npc.id);
        }
      } else if (npc.minigame === "data") {
        if (recentlyClosedNpcId !== npc.id) {
          setShowDataGame(true);
          setCurrentNpcId(npc.id);
        }
      } else if (npc.minigame === "hr") {
        if (recentlyClosedNpcId !== npc.id) {
          setShowHrGame(true);
          setCurrentNpcId(npc.id);
        }
      } else if (npc.minigame === "prior") {
        if (recentlyClosedNpcId !== npc.id) {
          setShowPriorGame(true);
          setCurrentNpcId(npc.id);
        }
      } else if (npc.minigame === "logistics") {
        if (recentlyClosedNpcId !== npc.id) {
          setShowLogisticsGame(true);
          setCurrentNpcId(npc.id);
        }
      } else if (npc.minigame === "devops") {
        if (recentlyClosedNpcId !== npc.id) {
          setShowDevOpsGame(true);
          setCurrentNpcId(npc.id);
        }
      } else if (npc.minigame === "testing") {
        if (recentlyClosedNpcId !== npc.id) {
          setShowTestingGame(true);
          setCurrentNpcId(npc.id);
        }
      } else {
        setCurrentNpcId(npc.id);
        setShowDialog(true);
        setDialogNodeKey("start");
      }
    } else if (recentlyClosedNpcId !== null) {
      setRecentlyClosedNpcId(null);
    }
  }, [
    pos,
    completedNpcs,
    showDialog,
    showMinigame,
    showDataGame,
    showHrGame,
    showPriorGame,
    showLogisticsGame,
    showDevOpsGame,
    showTestingGame,
    recentlyClosedNpcId,
  ]);

  const handleDialogSelect = (option) => {
    if (!option.next) {
      setShowDialog(false);
      setCompletedNpcs((prev) =>
        prev.includes(currentNpcId) ? prev : [...prev, currentNpcId]
      );
      setCurrentNpcId(null);
      setDialogNodeKey("start");
    } else {
      setDialogNodeKey(option.next);
    }
  };

  const handleMinigameFinish = (success) => {
    setShowMinigame(false);
    if (success === true) {
      setCompletedNpcs((prev) =>
        prev.includes(currentNpcId) ? prev : [...prev, currentNpcId]
      );
    }
    setRecentlyClosedNpcId(currentNpcId);
    setCurrentNpcId(null);
  };

  const handleDataGameFinish = (success) => {
    setShowDataGame(false);
    if (success === true) {
      setCompletedNpcs((prev) =>
        prev.includes(currentNpcId) ? prev : [...prev, currentNpcId]
      );
    }
    setRecentlyClosedNpcId(currentNpcId);
    setCurrentNpcId(null);
  };

  const handleHrGameFinish = (success) => {
    setShowHrGame(false);
    if (success === true) {
      setCompletedNpcs((prev) =>
        prev.includes(currentNpcId) ? prev : [...prev, currentNpcId]
      );
    }
    setRecentlyClosedNpcId(currentNpcId);
    setCurrentNpcId(null);
  };

  const handlePriorGameFinish = (success) => {
    setShowPriorGame(false);
    if (success === true) {
      setCompletedNpcs((prev) =>
        prev.includes(currentNpcId) ? prev : [...prev, currentNpcId]
      );
    }
    setRecentlyClosedNpcId(currentNpcId);
    setCurrentNpcId(null);
  };

  const handleLogisticsGameFinish = (success) => {
    setShowLogisticsGame(false);
    if (success === true) {
      setCompletedNpcs((prev) =>
        prev.includes(currentNpcId) ? prev : [...prev, currentNpcId]
      );
    }
    setRecentlyClosedNpcId(currentNpcId);
    setCurrentNpcId(null);
  };

  const handleDevOpsGameFinish = (success) => {
    setShowDevOpsGame(false);
    if (success === true) {
      setCompletedNpcs((prev) =>
        prev.includes(currentNpcId) ? prev : [...prev, currentNpcId]
      );
    }
    setRecentlyClosedNpcId(currentNpcId);
    setCurrentNpcId(null);
  };

  const handleTestingGameFinish = (success) => {
    setShowTestingGame(false);
    if (success === true) {
      setCompletedNpcs((prev) =>
        prev.includes(currentNpcId) ? prev : [...prev, currentNpcId]
      );
    }
    setRecentlyClosedNpcId(currentNpcId);
    setCurrentNpcId(null);
  };

  const renderTile = (x, y) => {
    const isPlayer = pos.x === x && pos.y === y;
    const npcHere = npcs.find((n) => n.x === x && n.y === y);
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
        {npcHere && (
          <img
            src={npcHere.portrait}
            alt={npcHere.name}
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

  const allDone = completedNpcs.length === npcs.length;

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
      {showDialog &&
        currentNpcId &&
        !showMinigame &&
        !showDataGame &&
        !showHrGame &&
        !showPriorGame &&
        !showLogisticsGame &&
        !showDevOpsGame &&
        !showTestingGame && (
          <DialogSystem
            npc={dialogTrees[currentNpcId].npc}
            node={dialogTrees[currentNpcId].nodes[dialogNodeKey]}
            options={dialogTrees[currentNpcId].nodes[dialogNodeKey].options}
            onSelect={handleDialogSelect}
            stats={stats}
          />
        )}
      {showMinigame && <CryptoGame onFinish={handleMinigameFinish} />}
      {showDataGame && <DataAnomalyGame onFinish={handleDataGameFinish} />}
      {showHrGame && <HrProfileGame onFinish={handleHrGameFinish} />}
      {showPriorGame && <PrioritizationGame onFinish={handlePriorGameFinish} />}
      {showLogisticsGame && (
        <LogisticsGame onFinish={handleLogisticsGameFinish} />
      )}
      {showDevOpsGame && <DevOpsGame onFinish={handleDevOpsGameFinish} />}
      {showTestingGame && <TestingGame onFinish={handleTestingGameFinish} />}
      {allDone && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-white text-black rounded-lg shadow-lg p-10 min-w-[400px] max-w-2xl font-pixel border-2 border-black flex flex-col items-center gap-8">
            <div className="text-2xl mb-2">Сцена завершена!</div>
            {/* Можно добавить кнопку перехода дальше */}
          </div>
        </div>
      )}
    </div>
  );
}
