import React, { useState, useCallback, useEffect, useRef } from "react";
import DialogSystem from "../components/DialogSystem";
import CharacterStats from "../components/CharacterStats";
import { useNavigate } from "react-router-dom";
import { saveProgress } from "../api";
import { useUser } from "../pages/AppLayout";

const GRID_SIZE = 15;
const CELL_SIZE = 40;
const SPRITE = "/sprites/mainCharacterModel.png";

const npc = {
  id: 1,
  x: 7,
  y: 7,
  name: "Загадочный Проводник",
  portrait: "/sprites/chaos.png",
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

export default function Scene2({ stats, updateStats }) {
  const [pos, setPos] = useState({ x: 7, y: 13 });
  const [activeKey, setActiveKey] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogNodeKey, setDialogNodeKey] = useState("start");
  const keyTimeout = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [saving, setSaving] = useState(false);

  const keyMap = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };

  function getProfession(stats) {
    const max = Math.max(...Object.values(stats));
    const entries = Object.entries(stats).filter(([_, v]) => v === max);

    const [key] = entries[Math.floor(Math.random() * entries.length)];
    switch (key) {
      case "creativity":
        return { name: "креатором", icon: "/sprites/profession-creator.png" };
      case "empathy":
        return { name: "проводником", icon: "/sprites/profession-guide.png" };
      case "bravery":
        return { name: "лидером", icon: "/sprites/profession-leader.png" };
      case "logic":
        return { name: "технарём", icon: "/sprites/profession-tech.png" };
      case "organization":
        return {
          name: "организатором",
          icon: "/sprites/profession-organizer.png",
        };
      default:
        return { name: "кем угодно с:", icon: "" };
    }
  }

  const dialogTree = {
    npc: {
      name: "Хаос",

      portrait: "/sprites/npc-chaos.jpg",
    },

    nodes: {
      start: {
        text: "Так, вот ты и здесь. Искра, что осмелилась зажечься в моём объятии. Ты помнишь, кто ты. Но знаешь ли ты, каково твоё место в этом вихре бытия и небытия?",

        options: [
          {
            id: 1,

            text: `Я здесь, чтобы нести свет в это Забвение. Я — ${
              getProfession(stats).name
            }.`,

            next: "chaos_purpose_assert",

            stat: "bravery",

            requiredStats: { bravery: 1 },
          },

          {
            id: 2,

            text: "Я лишь пытаюсь понять. Что такое этот вихрь? Что такое ты?",

            next: "chaos_inquiry",

            stat: "logic",

            requiredStats: { logic: 1 },
          },

          {
            id: 3,

            text: "Я чувствую твою мощь, но и твою боль. Что тревожит тебя?",

            next: "chaos_empathy_approach",

            stat: "empathy",

            requiredStats: { empathy: 1 },
          },

          {
            id: 4,

            text: "Я пришел, потому что Костер привел меня сюда. Что от меня требуется?",

            next: "chaos_neutral_start",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_neutral_start: {
        text: "Требуется? Ха! От меня ничего не требуется. Лишь твоё присутствие. Ты думаешь, мир функционирует по расписанию? Мой танец – это вечное отсутствие плана. Но ты здесь не просто так. Ты – это вопрос, заданный мне. И ответ на него ты должен найти сам.",

        options: [
          {
            id: 40,

            text: "Тогда помоги мне понять этот вопрос.",

            next: "chaos_inquiry",

            stat: "logic",

            requiredStats: { logic: 1 },
          },

          {
            id: 41,

            text: "Я готов принять вызов, если это мой путь.",

            next: "chaos_purpose_assert",

            stat: "bravery",

            requiredStats: { bravery: 1 },
          },

          {
            id: 42,

            text: "Я чувствую, что это не только мой вопрос, но и твой. Что с нами происходит?",

            next: "chaos_empathy_approach",

            stat: "empathy",

            requiredStats: { empathy: 1 },
          },

          {
            id: 43,

            text: "Мне нужно время, чтобы осмыслить это. (Подумать)",

            next: "chaos_universal_interim",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_universal_interim: {
        text: "Время… это лишь иллюзия, созданная для того, чтобы порядок мог существовать. В моём вихре времени нет. Есть лишь бесконечное Сейчас. Но если тебе нужно осмысление, продолжай искать.",

        options: [
          {
            id: 44,

            text: "Я готов продолжить наш разговор.",

            next: "start",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_purpose_assert: {
        text: "Свет... ха-ха! Наивное пламя в океане бездны. Каждый, кто зажигает свою искру, верит в свою великую цель. Но Забвение стирает всё. Даже предназначение. Что заставляет тебя думать, что твоё – иное?",

        options: [
          {
            id: 10,

            text: "Моя отвага. Я не сдамся, даже перед лицом безграничности.",

            next: "chaos_bravery_path",

            stat: "bravery",

            requiredStats: { bravery: 2 },
          },

          {
            id: 11,

            text: "Потому что я вижу, как моя искра влияет на мир. Она создаёт.",

            next: "chaos_creativity_assert",

            stat: "creativity",

            requiredStats: { creativity: 2 },
          },

          {
            id: 12,

            text: "Потому что я чувствую связь со всем, что было забыто. И буду её восстанавливать.",

            next: "chaos_empathy_assert",

            stat: "empathy",

            requiredStats: { empathy: 2 },
          },

          {
            id: 13,

            text: "Я не знаю. Но я чувствую, что должен идти этим путем.",

            next: "chaos_assert_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_assert_neutral_reply: {
        text: "Чувство... это интуиция. Иногда она сильнее любого знания. Возможно, именно это чувство и есть твоё истинное предназначение, не требующее объяснений. Продолжай идти за ним.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_bravery_path: {
        text: "Отвага... да, я помню её. Она была началом. И концом. Смелость бросить вызов пустоте… но что, если сама пустота – это всё, что останется? Что тогда твоя смелость?",

        options: [
          {
            id: 100,

            text: "Даже если я один, я буду стоять. Это моя суть.",

            next: "chaos_final_bravery",

            stat: "bravery",

            requiredStats: { bravery: 4 },
          },

          {
            id: 101,

            text: "Я буду бороться за каждый луч света, чтобы другие не потеряли надежду.",

            next: "chaos_empathy_bravery",

            stat: "empathy",

            requiredStats: { bravery: 3, empathy: 2 },
          },

          {
            id: 102,

            text: "Моя смелость — это лишь ответ на твой вызов.",

            next: "chaos_bravery_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_bravery_neutral_reply: {
        text: "Ответ... Значит, ты часть моего танца, сам того не зная. Твоя смелость — это отражение моего безграничного движения. Ты принадлежишь этому вихрю, даже когда борешься с ним.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_creativity_assert: {
        text: "Создаёт? Ты думаешь, можно что-то создать там, где нет основы? Мой вихрь – это постоянное изменение. Сегодня есть, завтра нет. Где же твои творения обретут опору?",

        options: [
          {
            id: 110,

            text: "Я создам опору там, где её нет. В моей голове.",

            next: "chaos_final_creativity",

            stat: "creativity",

            requiredStats: { creativity: 4 },
          },

          {
            id: 111,

            text: "Мои творения обретут опору в сердцах тех, кто увидит в них смысл.",

            next: "chaos_empathy_creativity",

            stat: "empathy",

            requiredStats: { creativity: 3, empathy: 2 },
          },

          {
            id: 112,

            text: "Я создаю, потому что не могу иначе. Это моя природа.",

            next: "chaos_creativity_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_creativity_neutral_reply: {
        text: "Природа… да, она сильнее любой логики. Твоя природа – это мой отголосок, стремление к новым формам, даже если они мимолётны. Ты – часть моей бесконечной игры.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_empathy_assert: {
        text: "Связь… ты говоришь о связях? Когда-то всё было связано. А теперь – рассыпано. И чем сильнее связь, тем больнее её разрыв. Разве ты готов нести эту боль?",

        options: [
          {
            id: 120,

            text: "Я готов. Боль — часть понимания и роста.",

            next: "chaos_final_empathy",

            stat: "empathy",

            requiredStats: { empathy: 4 },
          },

          {
            id: 121,

            text: "Моя задача – восстановить эти связи, даже если это причиняет боль.",

            next: "chaos_organization_empathy",

            stat: "organization",

            requiredStats: { empathy: 3, organization: 2 },
          },

          {
            id: 122,

            text: "Я не уверен. Но я чувствую, что это важно.",

            next: "chaos_empathy_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_empathy_neutral_reply: {
        text: "Важность… это то, что отличает твоё пламя от простого тепла. Если это важно для тебя, значит, это важно для твоего пути. Иди, ищи свою значимость.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_inquiry: {
        text: "Что такое этот вихрь? (Сущность Хаоса словно сгущается, принимая форму бесконечной спирали.) Это Я. Я – изначальное состояние всего, что есть и чего нет. Бесформенное, безграничное, вечное… и забытое. А ты, Искра, пытаешься измерить меня своими крошечными мерками. Возможно ли это?",

        options: [
          {
            id: 20,

            text: "Да. Любой хаос можно упорядочить, если понять его логику.",

            next: "chaos_logic_path",

            stat: "logic",

            requiredStats: { logic: 2 },
          },

          {
            id: 21,

            text: "Измерить – нет. Но понять, как взаимодействовать – да. Для этого нужно создать новую систему.",

            next: "chaos_organization_inquiry",

            stat: "organization",

            requiredStats: { organization: 2 },
          },

          {
            id: 22,

            text: "Может, твоё забвение – это не полное отсутствие, а лишь отсутствие имени?",

            next: "chaos_creativity_inquiry",

            stat: "creativity",

            requiredStats: { creativity: 2 },
          },

          {
            id: 23,

            text: "Я не знаю, возможно ли. Но я должен попытаться.",

            next: "chaos_inquiry_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_inquiry_neutral_reply: {
        text: "Попытка… это начало любого порядка. Твоё стремление к познанию – это тот самый импульс, что ведет меня к проявлению форм. Продолжай свой поиск.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_logic_path: {
        text: "Логика… интересное понятие. Порядок, что стремится ограничить бесконечность. Но как ты упорядочишь то, что постоянно меняется? Что, если в моём хаосе нет той логики, что ты ищешь?",

        options: [
          {
            id: 200,

            text: "Я найду новые законы. Создам их, если понадобится.",

            next: "chaos_final_logic",

            stat: "logic",

            requiredStats: { logic: 4 },
          },

          {
            id: 201,

            text: "Именно в отсутствии твоей логики есть моя логика. Я буду систематизировать сам процесс изменения.",

            next: "chaos_organization_logic",

            stat: "organization",

            requiredStats: { logic: 3, organization: 2 },
          },

          {
            id: 202,

            text: "Может быть, твоя логика отличается от моей. Но я всё равно буду искать.",

            next: "chaos_logic_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_logic_neutral_reply: {
        text: "Ищи. Именно в поиске и рождается понимание. Твоё стремление к истине – это одна из самых мощных сил в моём безграничном танце.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_organization_inquiry: {
        text: "Новая система? Какая дерзость! Ты думаешь, твои хрупкие рамки смогут объять мой безграничный размах? Всё, что пытается меня упорядочить, я поглощаю. Почему твоя система будет иной?",

        options: [
          {
            id: 210,

            text: "Моя система будет гибкой. Она будет включать твои изменения, а не бороться с ними.",

            next: "chaos_final_organization",

            stat: "organization",

            requiredStats: { organization: 4 },
          },

          {
            id: 211,

            text: "Моя система будет построена на понимании твоей сути, а не на попытке её подавить.",

            next: "chaos_empathy_organization",

            stat: "empathy",

            requiredStats: { organization: 3, empathy: 2 },
          },

          {
            id: 212,

            text: "Я просто верю, что порядок возможен даже здесь.",

            next: "chaos_organization_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_organization_neutral_reply: {
        text: "Вера… в ней есть своя сила. Даже если это вера в то, что кажется невозможным. Она создает нити, по которым ты можешь двигаться сквозь меня.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_creativity_inquiry: {
        text: "Отсутствие имени? Да, я бесчисленное множество раз обретал и терял имена. Но имя – это лишь звук. Как звук может дать форму тому, что не имеет формы? Или ты видишь что-то за пределами звука?",

        options: [
          {
            id: 220,

            text: "Я вижу образы, эмоции, чувства. Я создам новый язык для тебя.",

            next: "chaos_final_creativity_alt",

            stat: "creativity",

            requiredStats: { creativity: 4 },
          },

          {
            id: 221,

            text: "Я увижу суть. В ней и будет твоё имя, твоё предназначение.",

            next: "chaos_logic_creativity",

            stat: "logic",

            requiredStats: { creativity: 3, logic: 2 },
          },

          {
            id: 222,

            text: "Я лишь пытаюсь найти смысл в том, что вижу.",

            next: "chaos_creativity_inquiry_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_creativity_inquiry_neutral_reply: {
        text: "Смысл… это твоя величайшая потребность. Именно это стремление к смыслу делает тебя Искрой. Продолжай видеть.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_empathy_approach: {
        text: "Боль… (Вихрь Хаоса словно замедляется, в нём появляются fleeting образы разрушенных миров и утраченных надежд.) Да, боль. Боль от того, что всё стремится к порядку, чтобы потом разрушиться. Боль от неизбежности конца. Разве ты не чувствуешь эту безысходность?",

        options: [
          {
            id: 30,

            text: "Я чувствую. Но именно в боли есть потенциал для возрождения.",

            next: "chaos_empathy_path",

            stat: "empathy",

            requiredStats: { empathy: 2 },
          },

          {
            id: 31,

            text: "Я не вижу безысходности. Я вижу лишь начало новой трансформации.",

            next: "chaos_bravery_empathy",

            stat: "bravery",

            requiredStats: { bravery: 2 },
          },

          {
            id: 32,

            text: "Если есть боль, значит, есть и тот, кто её чувствует. И его можно понять.",

            next: "chaos_logic_empathy",

            stat: "logic",

            requiredStats: { logic: 2 },
          },

          {
            id: 33,

            text: "Я просто слушаю то, что ты говоришь.",

            next: "chaos_empathy_approach_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_empathy_approach_neutral_reply: {
        text: "Слушать… это редкий дар в моей бесконечности. Продолжай слушать. Возможно, именно в безмолвии ты найдешь свои ответы.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_empathy_path: {
        text: "Возрождение… (Хаос вздыхает, и этот вздох наполняет всё пространство.) Моя природа – это и есть вечное возрождение через разрушение. Но зачем стремиться к порядку, если он всё равно станет частью меня? Зачем бороться с неизбежным?",

        options: [
          {
            id: 300,

            text: "Чтобы придать этому возрождению смысл, а не просто быть слепой силой.",

            next: "chaos_final_empathy",

            stat: "empathy",

            requiredStats: { empathy: 4 },
          },

          {
            id: 301,

            text: "Чтобы упорядочить циклы возрождения. Придать им форму.",

            next: "chaos_organization_empathy_alt",

            stat: "organization",

            requiredStats: { empathy: 3, organization: 2 },
          },

          {
            id: 302,

            text: "Я верю, что есть путь, который не требует борьбы.",

            next: "chaos_empathy_path_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_empathy_path_neutral_reply: {
        text: "Вера в пути… да, это твоё предназначение – находить их. Даже там, где, казалось бы, их нет. Ты – надежда для тех, кто сбился с пути.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_bravery_empathy: {
        text: "Новая трансформация… (Хаос словно колеблется.) Ты не боишься поглощения? Не боишься раствориться в моей бесконечности? Что придаёт тебе такую уверенность?",

        options: [
          {
            id: 310,

            text: "Моя вера в себя и своё предназначение. Я не растворюсь, я изменю тебя.",

            next: "chaos_final_bravery",

            stat: "bravery",

            requiredStats: { bravery: 4 },
          },

          {
            id: 311,

            text: "Моя способность видеть за пределами страха и находить новый путь.",

            next: "chaos_creativity_bravery",

            stat: "creativity",

            requiredStats: { bravery: 3, creativity: 2 },
          },

          {
            id: 312,

            text: "Я просто иду туда, куда меня зовёт Костер.",

            next: "chaos_bravery_empathy_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_bravery_empathy_neutral_reply: {
        text: "Зов… да, ты слышишь его. Это связь, невидимая нить, что ведет тебя сквозь мой вихрь. Твой путь – это моё направление.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_logic_empathy: {
        text: "Понять меня… (Хаос принимает форму огромного, вращающегося глаза.) Ты думаешь, мой вихрь можно измерить разумом? Мои причины – это не цепочка следствий. Это первозданный импульс. Как ты его поймёшь?",

        options: [
          {
            id: 320,

            text: "Я пойму его через его структуру. Через то, как он проявляется.",

            next: "chaos_final_logic",

            stat: "logic",

            requiredStats: { logic: 4 },
          },

          {
            id: 321,

            text: "Я пойму его через его влияние на мир и живые существа.",

            next: "chaos_empathy_logic",

            stat: "empathy",

            requiredStats: { logic: 3, empathy: 2 },
          },

          {
            id: 322,

            text: "Я буду пытаться понять, даже если это кажется невозможным.",

            next: "chaos_logic_empathy_neutral_reply",

            stat: "none",

            requiredStats: {},
          },
        ],
      },

      chaos_logic_empathy_neutral_reply: {
        text: "Пытайся. Это стремление к пониманию – это свет, что пробивается сквозь мою бесконечную тьму. Ты – мой ученик, и мой учитель.",

        options: [
          {
            id: 0,

            text: "Что ждет меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_final_bravery: {
        text: "(Вихрь Хаоса вокруг тебя успокаивается, словно подчиняясь твоей воле. Ты стоишь непоколебимо.) – Храбрость… Ты не просто сражаешься с пустотой, ты сам становишься маяком. Твоё предназначение – быть Первопроходцем, тем, кто осмеливается идти вперёд, куда бы ни вёл путь, и зажигать надежду в других. Твоя воля может пронзить любое Забвение. Иди. И покажи мне, куда приведёт эта дорога.",

        options: [
          {
            id: 0,

            text: "Что ждёт меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_final_creativity: {
        text: "(Вихрь Хаоса вокруг тебя начинает переливаться невообразимыми цветами и формами, отвечая на твой внутренний мир. Ты видишь в нём не только разрушение, но и бесконечный потенциал.) – Креативность… Ты не просто создаёшь, ты видишь невидимое, слышишь неслышимое. Твоё предназначение – быть Творцом Миров, тем, кто из пустоты рождает смысл, кто дарит Забвению новые имена. Твоё воображение может переписать реальность. Иди. И покажи мне, что ты сотворишь.",

        options: [
          {
            id: 0,

            text: "Что ждёт меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_final_empathy: {
        text: "(Вихрь Хаоса обволакивает тебя мягким, тёплым потоком, словно отвечая на твоё сострадание. Ты чувствуешь его боль, но также и его одиночество, его желание быть понятым.) – Эмпатия… Ты не просто чувствуешь, ты связываешь. Твоё предназначение – быть Мостом Между Мирами, тем, кто исцеляет разрывы, кто приносит гармонию в хаос. Твоё сочувствие может примирить даже небытие с бытием. Иди. И покажи мне, что ты соединишь.",

        options: [
          {
            id: 0,

            text: "Что ждёт меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_final_logic: {
        text: "(Вихрь Хаоса замедляется, его движение становится упорядоченным, следуя невидимым законам, которые ты только что ощутил. Ты понимаешь его внутреннюю механику.) – Логика… Ты не просто анализируешь, ты проникаешь в суть. Твоё предназначение – быть Разумом Порядка, тем, кто находит смысл в абсурде, кто раскрывает тайны мироздания. Твой интеллект может просчитать даже непредсказуемое. Иди. И покажи мне, что ты разгадаешь.",

        options: [
          {
            id: 0,

            text: "Что ждёт меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_final_organization: {
        text: "(Вихрь Хаоса начинает выстраиваться вокруг тебя в удивительные, но понятные структуры, словно отвечая на твоё стремление к порядку. Ты видишь его потенциал для создания систем.) – Организация… Ты не просто упорядочиваешь, ты строишь. Твоё предназначение – быть Архитектором Бытия, тем, кто из разрозненных частей возводит целое, кто превращает потенциал в реальность. Твоя воля может придать форму самому Хаосу. Иди. И покажи мне, что ты соберёшь.",

        options: [
          {
            id: 0,

            text: "Что ждёт меня дальше?",

            next: "chaos_universal_ending",
          },
        ],
      },

      chaos_universal_ending: {
        text: '(Хаос отступает, растворяясь в мерцающем тумане, оставляя тебя на краю нового, необъятного пространства. Ты чувствуешь, что он признал твою силу, твою уникальность. Мир вокруг начинает приобретать новые, яркие краски, которые никогда раньше не видел. Небо над головой искрится мириадами звезд, каждая из которых — это чьё-то пробуждённое предназначение. Ты не одинок.) \n\n Хаос: "Теперь ты знаешь, кто ты. И помни: в этом бескрайнем полотне бытия… каждая Искра, каждая нить, каждый цвет имеет значение. И каждый, кто найдёт своё место, делает этот мир ярче. Идите. Создавайте. Соединяйте. Всякий путь ведет к великой цели, если ты идешь по нему с открытым сердцем и верным Призванием. Вместе, вы можете восстановить всё."',

        options: [
          { id: 0, text: "Продолжить путь в пробужденном мире", next: null },
        ],
      },

      chaos_empathy_bravery: {
        text: "Так твоя смелость питается состраданием? Интересно. Это не просто храбрость, это отвага, ведущая к соединению. Ты готов идти, чтобы другие обрели свой путь, даже в пустоте. Это то, что я хотел увидеть.",

        options: [{ id: 0, text: "Далее", next: "chaos_final_bravery" }],
      },

      chaos_empathy_creativity: {
        text: "Твои творения обретают смысл через чувства других… Значит, твоя креативность — это мост. Ты создаёшь то, что затрагивает сердца, что дарит смысл. Это новое измерение, которого не было в моём Забвении.",

        options: [{ id: 0, text: "Далее", next: "chaos_final_creativity" }],
      },

      chaos_organization_empathy: {
        text: "Восстановление связей через порядок… Ты стремишься к гармонии и целостности, даже если это болезненно. Твоя способность упорядочивать хаос направлена на исцеление. Это мощно.",

        options: [{ id: 0, text: "Далее", next: "chaos_final_empathy" }],
      },

      chaos_organization_logic: {
        text: "Ты стремишься систематизировать сами изменения, находя в них структуру. Твой порядок — это гибкость, а не застывшая форма. Это открывает новые перспективы даже для меня.",

        options: [{ id: 0, text: "Далее", next: "chaos_final_organization" }],
      },

      chaos_empathy_organization_alt: {
        text: "Упорядочить циклы возрождения через сочувствие... Значит, твой порядок не бесчувственен. Он вдохновлён желанием понять и помочь. Это придает моей природе новый, более мягкий оттенок.",

        options: [{ id: 0, text: "Далее", next: "chaos_final_organization" }],
      },

      chaos_creativity_bravery: {
        text: "Новый путь, найденный за пределами страха… Твоя креативность — это вызов. Ты не просто создаёшь, ты переосмысливаешь само понятие угрозы, превращая её в возможность. Это вдохновляет.",

        options: [{ id: 0, text: "Далее", next: "chaos_final_bravery" }],
      },

      chaos_logic_creativity: {
        text: "Понять суть, чтобы дать новое имя… Твоя логика питает творчество. Ты не просто анализируешь, ты видишь потенциал для создания новых концепций. Это заставляет меня задуматься.",

        options: [{ id: 0, text: "Далее", next: "chaos_final_logic" }],
      },

      chaos_empathy_logic: {
        text: "Ты стремишься понять мои импульсы через их влияние на мир. Твоя логика пропитана сочувствием. Это позволяет увидеть целое, а не только части. Ты глубоко заглядываешь в суть.",

        options: [{ id: 0, text: "Далее", next: "chaos_final_empathy" }],
      },
    },
  };

  const tiles = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
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
      const key = keyMap[e.key];
      if (key) {
        if (keyTimeout.current) clearTimeout(keyTimeout.current);
        setActiveKey(key);
        if (key === "up") move(0, -1);
        if (key === "down") move(0, 1);
        if (key === "left") move(-1, 0);
        if (key === "right") move(1, 0);
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
      setTimeout(async () => {
        setSaving(true);
        if (user) {
          await saveProgress({ scene: 2, stats });
        }
        setSaving(false);
        navigate("/app/scene3");
      }, 500);
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
