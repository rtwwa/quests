import React, { useState, useEffect, useCallback, useRef } from "react";
import DialogSystem from "../components/DialogSystem";
import CharacterStats from "../components/CharacterStats";
import { useNavigate } from "react-router-dom";
import { saveProgress } from "../api";
import { useUser } from "../pages/AppLayout";

const GRID_SIZE = 15;
const CELL_SIZE = 40;
const SPRITE = "/sprites/mainCharacterModel.png";
const FIRE_SPRITE = "/sprites/tiles/fire.png";

const keySprites = {
  up: "/sprites/keys/k-up.png",
  left: "/sprites/keys/k-left.png",
  right: "/sprites/keys/k-right.png",
  down: "/sprites/keys/k-down.png",
};

const FIRE_POS = { x: 7, y: 7 };

const npcs = [
  { id: 1, x: 7, y: 5, name: "Старая Архивариус" },
  { id: 2, x: 5, y: 7, name: "Молчун с кубом в руках" },
  { id: 3, x: 9, y: 7, name: "Весёлая Плотница" },
  { id: 4, x: 7, y: 9, name: "Немой Страж" },
  { id: 5, x: 7, y: 11, name: "Ребёнок с пустой книгой" },
];

const dialogTrees = {
  1: {
    npc: {
      name: "Старая Архивариус",
      portrait: "/sprites/npc-archivarius.jpg",
    },
    nodes: {
      start: {
        text: "Ты тоже ищешь своё имя в этом пепле? У нас остались лишь клочки памяти, да призраки старых форм.",
        options: [
          {
            id: 1,
            text: "Что ты хранишь в своей сумке? Она кажется очень старой.",
            next: "arch_bag_intro",
            stat: "creativity",
          },
          {
            id: 2,
            text: "Расскажи мне, что было до катастрофы, если хоть что-то помнишь.",
            next: "arch_before_intro",
            stat: "empathy",
          },
          {
            id: 3,
            text: "Нам нужно не жалеть себя, а действовать. Что мы можем сделать?",
            next: "arch_action_intro",
            stat: "bravery",
          },
        ],
      },
      arch_bag_intro: {
        text: "Моя сумка… она полна теней. Обрывки знаний, что не имеют формы. Видишь это? (Она протягивает нечто, похожее на скомканный лист.) Это была карта. Но куда она вела?",
        options: [
          {
            id: 10,
            text: "Я попробую представить, что это за места. (Касаешься листа.)",
            next: "arch_bag_creative_reply",
            stat: "creativity",
          },
          {
            id: 11,
            text: "Может, если собрать больше таких обрывков, смысл появится?",
            next: "arch_bag_logic_reply",
            stat: "logic",
          },
        ],
      },
      arch_bag_creative_reply: {
        text: "Твои глаза… они видят то, что мои забыли. Я чувствую, как сквозь этот пепел пробивается цвет. Наверное, такие, как ты, рисуют будущее, когда прошлое размыто.",
        options: [{ id: 0, text: "Дальше", next: "arch_farewell" }],
      },
      arch_bag_logic_reply: {
        text: "Ты прав. Память — это не хаос. Это узор. Возможно, нам не хватает лишь нескольких звеньев цепи. Твой подход... он будто проясняет черты.",
        options: [{ id: 0, text: "Дальше", next: "arch_farewell" }],
      },
      arch_before_intro: {
        text: "До… до Дремоты… Мир был наполнен Звуком. Не только слова, но и шепот листьев, гул машин, смех. Теперь лишь тишина, нарушаемая ветром в пустых стенах. Ты чувствуешь эту тишину?",
        options: [
          {
            id: 20,
            text: "Да, это гнетущая тишина. Она давит.",
            next: "arch_before_empathy_reply",
            stat: "empathy",
          },
          {
            id: 21,
            text: "Если был звук, значит, он где-то остался. Может, можно его найти?",
            next: "arch_before_logic_reply",
            stat: "logic",
          },
        ],
      },
      arch_before_empathy_reply: {
        text: "Значит, ты помнишь, что такое боль от потери. Это важно. Многие забыли даже чувства. Твоя способность к состраданию — это маяк в темноте.",
        options: [{ id: 0, text: "Дальше", next: "arch_farewell" }],
      },
      arch_before_logic_reply: {
        text: "Ты ищешь истоки. Это верно. Ничто не исчезает бесследно, лишь меняет форму. Если был Звук, то его отголоски должны быть где-то записаны. Ты мыслишь как настоящий исследователь.",
        options: [{ id: 0, text: "Дальше", next: "arch_farewell" }],
      },
      arch_action_intro: {
        text: "Действовать? Ты говоришь о движении? Но куда? Мы как потерянные корабли в безбрежном океане, не зная, где берег. У тебя есть цель?",
        options: [
          {
            id: 30,
            text: "Цель — найти себя. Это уже достаточно.",
            next: "arch_action_bravery_reply",
            stat: "bravery",
          },
          {
            id: 31,
            text: "Мы можем собрать то, что осталось, и начать с нуля.",
            next: "arch_action_organization_reply",
            stat: "organization",
          },
        ],
      },
      arch_action_bravery_reply: {
        text: "Не поспоришь. В таком мире найти себя — это уже подвиг. Ты обладаешь силой, которой мне не хватает. Возможно, твое пламя сможет осветить наш путь.",
        options: [{ id: 0, text: "Дальше", next: "arch_farewell" }],
      },
      arch_action_organization_reply: {
        text: "Начать с нуля… это смело. Но без чертежей, без плана… Это будет трудно. Но ты видишь порядок там, где я вижу лишь хаос. Это удивительно.",
        options: [{ id: 0, text: "Дальше", next: "arch_farewell" }],
      },
      arch_farewell: {
        text: "Я чувствую… старые истории возвращаются. Твой свет — он как чернила для этих пустых страниц. Иди, Пробужденный. Продолжай искать. Ты даешь мне надежду.",
        options: [{ id: 0, text: "Завершить разговор", next: null }],
      },
    },
  },
  2: {
    npc: {
      name: "Молчун с кубом в руках",
      portrait: "/sprites/npc-molcun.jpg",
    },
    nodes: {
      start: {
        text: "(Он смотрит на тебя, его глаза пусты, но в руках он крепко сжимает странный куб. От куба исходит едва слышный гул.)",
        options: [
          {
            id: 1,
            text: "Что это за куб? Могу я посмотреть поближе?",
            next: "mol_logic_intro",
            stat: "logic",
          },
          {
            id: 2,
            text: "Он кажется сломанным. Может, его можно как-то починить или изменить?",
            next: "mol_creative_intro",
            stat: "creativity",
          },
          {
            id: 3,
            text: "Почему ты молчишь? Ты не доверяешь мне?",
            next: "mol_empathy_intro",
            stat: "empathy",
          },
        ],
      },
      mol_logic_intro: {
        text: "(Он медленно протягивает куб. Он тяжелый и холодный. На его гранях видны выемки и едва заметные символы. Чувствуешь, как куб реагирует на твое прикосновение?)",
        options: [
          {
            id: 10,
            text: "Я попробую понять его механизм. (Пытаешься сдвинуть грани.)",
            next: "mol_logic_success",
            stat: "logic",
          },
          {
            id: 11,
            text: "Этот куб что-то означает... может, он ключ?",
            next: "mol_logic_insight",
            stat: "creativity",
          },
        ],
      },
      mol_logic_success: {
        text: "(Одна из граней куба издает щелчок и слегка сдвигается, открывая крошечное отверстие. Молчун кивает.) — ...",
        options: [{ id: 0, text: "Дальше", next: "mol_farewell" }],
      },
      mol_logic_insight: {
        text: "(Молчун пристально смотрит на тебя. Куб в твоих руках вибрирует, словно ты нащупал его истинное предназначение.) — ! (Он чуть приоткрывает рот, но слова не выходят.)",
        options: [{ id: 0, text: "Дальше", next: "mol_farewell" }],
      },
      mol_creative_intro: {
        text: "(Он смотрит на тебя с сомнением, но позволяет взять куб. Ты чувствуешь его шероховатую поверхность, кажется, здесь что-то можно изменить.)",
        options: [
          {
            id: 20,
            text: "А что, если он не сломан, а просто незавершен? (Пытаешься добавить ему форму.)",
            next: "mol_creative_success",
            stat: "creativity",
          },
          {
            id: 21,
            text: "Я попробую придать ему новую форму, чтобы он снова заработал.",
            next: "mol_creative_remake",
            stat: "creativity",
          },
        ],
      },
      mol_creative_success: {
        text: "(Ты прикасаешься к кубу, и он загорается мягким светом, проявляя новые, ранее невидимые узоры. Молчун издает тихий вздох.) — …! (Он кивает.)",
        options: [{ id: 0, text: "Дальше", next: "mol_farewell" }],
      },
      mol_creative_remake: {
        text: "(Когда твои пальцы касаются куба, ты чувствуешь его податливость. Он словно просит тебя завершить его. Молчун сжимает кулак, но не останавливает тебя.)",
        options: [{ id: 0, text: "Дальше", next: "mol_farewell" }],
      },
      mol_empathy_intro: {
        text: "(Молчун смотрит в сторону. Ты чувствуешь его настороженность.)",
        options: [
          {
            id: 30,
            text: "Твоё молчание... оно говорит о многом. О боли, о страхе.",
            next: "mol_empathy_reveal",
            stat: "empathy",
          },
          {
            id: 31,
            text: "Я здесь, чтобы слушать, если ты захочешь заговорить. Тебе не нужно бояться.",
            next: "mol_empathy_trust",
            stat: "empathy",
          },
        ],
      },
      mol_empathy_reveal: {
        text: "(Он чуть наклоняет голову. Сжимает кулак. Его плечи опускаются, словно он сбрасывает невидимый груз. Говорит впервые:) — Не всем можно верить. Но… тебе — да. Спасибо.",
        options: [{ id: 0, text: "Дальше", next: "mol_farewell" }],
      },
      mol_empathy_trust: {
        text: "(Он пристально смотрит тебе в глаза. Куб в его руках чуть вибрирует, словно он сомневается, но затем его взгляд теплеет.) — Я… (Голос хриплый, давно не используемый.) Я… верил. Теперь… верю.",
        options: [{ id: 0, text: "Дальше", next: "mol_farewell" }],
      },
      mol_farewell: {
        text: "(Молчун опускает куб. Ты видишь, что он чуть изменился, стал более завершенным. Он кивает тебе.) — Загадки… обретают ответы. Иди. Теперь ты… понимаешь. Спасибо.",
        options: [{ id: 0, text: "Завершить разговор", next: null }],
      },
    },
  },
  3: {
    npc: { name: "Весёлая Плотница", portrait: "/sprites/npc-plotnica.jpg" },
    nodes: {
      start: {
        text: "(Она улыбается и машет тебе рукой, стоя возле груды непонятных обломков. Из них торчат доски и исковерканный металл.) Привет, Пробужденный! Забвение не повод грустить, верно?",
        options: [
          {
            id: 1,
            text: "Что ты пытаешься построить из этих обломков?",
            next: "plot_build_intro",
            stat: "organization",
          },
          {
            id: 2,
            text: "Ты так легко смеешься в этом мире? Почему?",
            next: "plot_smile_intro",
            stat: "empathy",
          },
          {
            id: 3,
            text: "Можно я дам тебе идею, что из этого может получиться?",
            next: "plot_idea_intro",
            stat: "creativity",
          },
        ],
      },
      plot_build_intro: {
        text: "Ох, это просто… просто куча всего. Я собираю, пилю, стучу, а что выйдет — сама не знаю! (Она пожимает плечами.) Как будто потеряла инструкцию. У тебя есть план?",
        options: [
          {
            id: 10,
            text: "Давай рассортируем всё по типу. Тогда будет понятнее.",
            next: "plot_build_organization_reply",
            stat: "organization",
          },
          {
            id: 11,
            text: "А что, если это не обломки, а части чего-то большего, просто разрозненные?",
            next: "plot_build_logic_reply",
            stat: "logic",
          },
        ],
      },
      plot_build_organization_reply: {
        text: "Ого! Ты видишь порядок там, где я видела лишь хаос! Это… это меняет дело! Если мы всё разложим, возможно, смысл проявится сам. Ты точно знаешь, как привести всё в систему.",
        options: [{ id: 0, text: "Дальше", next: "plot_farewell" }],
      },
      plot_build_logic_reply: {
        text: "Хм. Ты мыслишь масштабно. Значит, это не просто хлам, а части единого целого, которое мы забыли? Интересная мысль. Твой взгляд… он как будто ищет целое в разрозненном.",
        options: [{ id: 0, text: "Дальше", next: "plot_farewell" }],
      },
      plot_smile_intro: {
        text: "А кто-то же должен, верно? Слезами дерево не распилишь, а вот добрым словом — можно и мир починить. Я верю, что даже в этой черноте можно найти крупицы света. Ты так не думаешь?",
        options: [
          {
            id: 20,
            text: "Возможно. Твоя вера очень сильна.",
            next: "plot_smile_empathy_reply",
            stat: "empathy",
          },
          {
            id: 21,
            text: "Да, смех — это тоже способ сопротивления Забвению.",
            next: "plot_smile_bravery_reply",
            stat: "bravery",
          },
        ],
      },
      plot_smile_empathy_reply: {
        text: "Верно! Если мы будем держаться вместе, делясь даже малой улыбкой, мы сможем победить Дремоту. Твоя способность к сопереживанию — это настоящее сокровище в этом мире.",
        options: [{ id: 0, text: "Дальше", next: "plot_farewell" }],
      },
      plot_smile_bravery_reply: {
        text: "Именно! Смех — это бунт против Забвения. Если мы не сломимся духом, то сможем найти путь. Твоя смелость — это заразительно!",
        options: [{ id: 0, text: "Дальше", next: "plot_farewell" }],
      },
      plot_idea_intro: {
        text: "Идея? (Её глаза загораются.) Ох, это редкость! Я всё чиню по инерции, но настоящих идей, что придают смысл… их не хватает. Что у тебя на уме?",
        options: [
          {
            id: 30,
            text: "А если из этих обломков сделать лодку, чтобы плыть по Забвению?",
            next: "plot_idea_creative_reply",
            stat: "creativity",
          },
          {
            id: 31,
            text: "Может, это детали для большой машины, которая вернет свет?",
            next: "plot_idea_tech_reply",
            stat: "logic",
          },
        ],
      },
      plot_idea_creative_reply: {
        text: "Ха! Ты первый, кто видит здесь лодку! Мне нравится, как ты думаешь. Это не просто починка, это создание нового! Твое воображение — бесценно.",
        options: [{ id: 0, text: "Дальше", next: "plot_farewell" }],
      },
      plot_idea_tech_reply: {
        text: "Большая машина? (Она смотрит на обломки с задумчивостью.) Это амбициозно, но кто знает! Возможно, ты прав, и нам нужно мыслить о чем-то большем, чем просто ремонт. Ты видишь скрытые связи.",
        options: [{ id: 0, text: "Дальше", next: "plot_farewell" }],
      },
      plot_farewell: {
        text: "Я чувствую… как будто строительные леса вновь обретают смысл, а инструменты — цель. Твои идеи — как чертежи для нового мира. Мы что-то построим. Что-то настоящее!",
        options: [{ id: 0, text: "Завершить разговор", next: null }],
      },
    },
  },
  4: {
    npc: { name: "Немой Страж", portrait: "/sprites/npc-strazh.jpg" },
    nodes: {
      start: {
        text: "(Страж стоит неподвижно, его взгляд устремлен куда-то вдаль, за пределы Костра. На его броне видны древние, стершиеся руны.)",
        options: [
          {
            id: 1,
            text: "Ты охраняешь этот Костер? От кого?",
            next: "strazh_guard_intro",
            stat: "bravery",
          },
          {
            id: 2,
            text: "Ты не говоришь. Может, тебе некого или нечего защищать?",
            next: "strazh_silence_intro",
            stat: "empathy",
          },
          {
            id: 3,
            text: "Кто ты? И почему ты стоишь здесь?",
            next: "strazh_identity_intro",
            stat: "logic",
          },
        ],
      },
      strazh_guard_intro: {
        text: "(Страж поворачивает голову и смотрит прямо на тебя. В его пустых глазницах вспыхивают две крошечные искорки.)",
        options: [
          {
            id: 10,
            text: "Я не боюсь. (Стоишь прямо, не отступая.)",
            next: "strazh_guard_bravery_reply",
            stat: "bravery",
          },
          {
            id: 11,
            text: "Даже если это опасно, я готов узнать.",
            next: "strazh_guard_logic_reply",
            stat: "bravery",
          },
        ],
      },
      strazh_guard_bravery_reply: {
        text: "(Он отходит в сторону, открывая проход, которого, казалось, не было. Ты почувствовал, что прошёл невидимую проверку. Его защита теперь распространяется и на тебя.)",
        options: [{ id: 0, text: "Дальше", next: "strazh_farewell" }],
      },
      strazh_guard_logic_reply: {
        text: "(Страж опускает руку. Ты замечаешь, как руны на его броне на мгновение вспыхивают. Он как будто признал твою готовность к знанию, даже если оно опасно.)",
        options: [{ id: 0, text: "Дальше", next: "strazh_farewell" }],
      },
      strazh_silence_intro: {
        text: "(Он медленно наклоняет голову, как будто прислушиваясь. Ты чувствуешь глубокую тоску в этом жесте.)",
        options: [
          {
            id: 20,
            text: "Молчание — это тоже форма защиты.",
            next: "strazh_silence_empathy_reply",
            stat: "empathy",
          },
          {
            id: 21,
            text: "Я понимаю, что не все слова нужны. Некоторые вещи чувствуются без них.",
            next: "strazh_silence_creativity_reply",
            stat: "empathy",
          },
        ],
      },
      strazh_silence_empathy_reply: {
        text: "(Костяные пальцы Стража касаются твоего плеча. Ты слышишь голос в голове, чистый, но печальный: 'Спасибо. Иногда… молчание — единственная крепость. Ты видишь это.')",
        options: [{ id: 0, text: "Дальше", next: "strazh_farewell" }],
      },
      strazh_silence_creativity_reply: {
        text: "(В его пустых глазницах вспыхивает нечто, похожее на понимание. Он кивает. В воздухе вокруг вас на мгновение проступает невидимый барьер, а затем исчезает. Он признал твою интуицию.)",
        options: [{ id: 0, text: "Дальше", next: "strazh_farewell" }],
      },
      strazh_identity_intro: {
        text: "(Страж поднимает руку и указывает на одну из рун на своей броне. Она вспыхивает ярче.)",
        options: [
          {
            id: 30,
            text: "Что это за руна? Она что-то означает?",
            next: "strazh_identity_logic_reply",
            stat: "logic",
          },
          {
            id: 31,
            text: "Эта руна… она кажется очень древней. Что она защищала?",
            next: "strazh_identity_organization_reply",
            stat: "organization",
          },
        ],
      },
      strazh_identity_logic_reply: {
        text: "(Ты замечаешь, что руна складывается в слово 'ОХРАНА' на давно забытом языке. 'Значит, он... профессионал прошлого?' Ты чувствуешь, как кусочек головоломки встал на место. 'Я… Страж', - шепчет голос в твоей голове.)",
        options: [{ id: 0, text: "Дальше", next: "strazh_farewell" }],
      },
      strazh_identity_organization_reply: {
        text: "(Руна сияет, и ты видишь отголоски огромной, сложной сети невидимых барьеров и защитных систем. Страж не просто охранял, он был частью великой системы защиты. Он признал твою способность видеть целое.)",
        options: [{ id: 0, text: "Дальше", next: "strazh_farewell" }],
      },
      strazh_farewell: {
        text: "(Страж медленно кивает. Его глаза, казалось, обретают ясность. Он теперь знает, что и зачем защищает.) — Путь… открыт. Для тех, кто помнит. Иди. Забвение… будет отступать.",
        options: [{ id: 0, text: "Завершить разговор", next: null }],
      },
    },
  },
  5: {
    npc: {
      name: "Ребёнок с пустой книгой",
      portrait: "/sprites/npc-child.jpg",
    },
    nodes: {
      start: {
        text: "Я… я не помню, кто я. И не знаю, кем я могу быть. (Он прижимает к груди пустую, обгоревшую книгу.) Поможешь мне написать мою историю?",
        options: [
          {
            id: 1,
            text: "Твоя история может быть какой угодно. Начни с того, что ты сам захочешь.",
            next: "child_creative_intro",
            stat: "creativity",
          },
          {
            id: 2,
            text: "Ты можешь учиться у других. Смотри и слушай, что они делают.",
            next: "child_organization_intro",
            stat: "organization",
          },
          {
            id: 3,
            text: "Мир тебя испытает. Будь сильным, чтобы встретить трудности.",
            next: "child_bravery_intro",
            stat: "bravery",
          },
          {
            id: 4,
            text: "Давай попробуем понять, что именно ты хочешь узнать.",
            next: "child_logic_intro",
            stat: "logic",
          },
          {
            id: 5,
            text: "Я понимаю, как ты себя чувствуешь. Я помогу тебе.",
            next: "child_empathy_intro",
            stat: "empathy",
          },
        ],
      },
      child_creative_intro: {
        text: "Правда? (В глазах ребёнка загорается искра. Он улыбается и смотрит на чистые страницы книги.) Тогда я нарисую то, что вижу! Хочешь, я нарисую и тебя?",
        options: [{ id: 0, text: "Дальше", next: "child_farewell" }],
      },
      child_organization_intro: {
        text: "(Он кивает и делает пометку в пустой книге.) Значит, мне нужно наблюдать? И записывать? Я понял! Спасибо! Это как план для моей книги.",
        options: [{ id: 0, text: "Дальше", next: "child_farewell" }],
      },
      child_bravery_intro: {
        text: "(Он сжимает кулачок и смотрит на костёр с решимостью.) Я буду сильным! Я не дам Забвению стереть меня. Я запишу, что я такой! Спасибо тебе!",
        options: [{ id: 0, text: "Дальше", next: "child_farewell" }],
      },
      child_logic_intro: {
        text: "Что я хочу узнать? (Он задумывается, и в его глазах проскальзывает что-то осмысленное.) Я хочу понять, почему мир такой. Я хочу найти ответы в этой книге! Как это сделать?",
        options: [{ id: 0, text: "Дальше", next: "child_farewell" }],
      },
      child_empathy_intro: {
        text: "Ты понимаешь? (Он подходит ближе и берет тебя за руку. Его прикосновение теплое.) Это так… хорошо. Спасибо. Я чувствую, что не один.",
        options: [{ id: 0, text: "Дальше", next: "child_farewell" }],
      },
      child_farewell: {
        text: "(Ребенок поднимает свою книгу. На ней теперь видна едва заметная, но четкая линия, первые штрихи его истории. Его лицо светится осознанием.) — Я знаю… кем я могу стать. Теперь знаю. Ты помог мне написать первую страницу. Спасибо, Пробужденный!",
        options: [{ id: 0, text: "Завершить разговор", next: null }],
      },
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

const keyMap = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

function isAdjacent(a, b) {
  return (
    (Math.abs(a.x - b.x) === 1 && a.y === b.y) ||
    (Math.abs(a.y - b.y) === 1 && a.x === b.x)
  );
}

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

export default function Scene1({ stats, updateStats }) {
  const [pos, setPos] = useState({ x: 7, y: 13 });
  const [activeKey, setActiveKey] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentNpcId, setCurrentNpcId] = useState(null);
  const [dialogNodeKey, setDialogNodeKey] = useState("start");
  const [completedNpcs, setCompletedNpcs] = useState([]);
  const [showFinal, setShowFinal] = useState(false);
  const keyTimeout = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [saving, setSaving] = useState(false);

  const tiles = Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => {
      if (x === 0 || y === 0 || y === 1 || x === 1) return null;
      if (x === GRID_SIZE - 1 || x === GRID_SIZE - 2 || y === GRID_SIZE - 1)
        return null;
      if (y === GRID_SIZE - 2 && x !== 7 && x !== 8 && x !== 6) return null;
      if (y === GRID_SIZE - 3 && x !== 7 && x !== 8 && x !== 6) return null;
      if (y === GRID_SIZE - 4 && x !== 7 && x !== 8 && x !== 6) return null;
      if (y === GRID_SIZE - 5 && x !== 7 && x !== 8 && x !== 6) return null;
      return "grass.png";
    })
  );

  const canMove = (x, y) => {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    if (!tiles[y][x]) return false;
    if (npcs.some((n) => n.x === x && n.y === y)) return false;
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
    if (showFinal) return;
    if (showDialog) return;
    const npc = npcs.find(
      (n) => isAdjacent(pos, n) && !completedNpcs.includes(n.id)
    );
    if (npc) {
      setCurrentNpcId(npc.id);
      setShowDialog(true);
      setDialogNodeKey("start");
    }
  }, [pos, completedNpcs, showFinal, showDialog]);

  const handleDialogSelect = (option) => {
    if (option.stat) {
      updateStats({ [option.stat]: 1 });
    }
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

  useEffect(() => {
    if (completedNpcs.length === npcs.length && !showFinal) {
      setTimeout(() => setShowFinal(true), 1200);
    }
  }, [completedNpcs, showFinal]);

  const renderTile = (x, y) => {
    const isPlayer = pos.x === x && pos.y === y;
    const isFire = FIRE_POS.x === x && FIRE_POS.y === y;
    const npcHere = npcs.find((n) => n.x === x && n.y === y);
    const tile = tiles[y][x];
    return (
      <div
        key={y + "," + x}
        className=" flex items-center justify-center relative"
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
        {isFire && (
          <img
            src={FIRE_SPRITE}
            alt="fire"
            className="w-10 h-10 z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ imageRendering: "pixelated" }}
          />
        )}
        {npcHere && (
          <img
            src={`/sprites/npc.png`}
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

  const FinalWindow = ({ stats }) => {
    const prof = getProfession(stats);
    const handleNext = async () => {
      setSaving(true);
      if (user) {
        await saveProgress({ scene: 1, stats });
      }
      setSaving(false);
      navigate("/app/scene2");
    };
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
        <div className="bg-white text-black rounded-lg shadow-lg p-10 min-w-[400px] max-w-2xl font-pixel border-2 border-black flex flex-col items-center gap-8">
          <img
            src={FIRE_SPRITE}
            alt="fire"
            className="w-24 h-24 object-contain"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="text-2xl mb-2">
            В костре начинает вспыхивать первая Искра…
          </div>
          <img
            src={prof.icon}
            alt={prof.name}
            className="w-20 h-20 object-contain"
            style={{ imageRendering: "pixelated" }}
          />
          <div className="text-2xl text-center">
            Ты вспоминаешь, что значит быть…
            <br />
            <span className="font-bold">{prof.name}</span>
            <br />
            …Но это только начало.
          </div>
          <button
            className="mt-6 bg-black text-white border-2 border-black rounded px-8 py-3 font-pixel hover:bg-white hover:text-black transition text-lg"
            onClick={handleNext}
            disabled={saving}
          >
            {saving ? "Сохранение..." : "Дальше"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
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
              src={keySprites[c.key]}
              alt={c.key}
              className="w-8 h-8"
              style={{ imageRendering: "pixelated" }}
            />
          </button>
        ))}
      </div>
      <CharacterStats stats={stats} />
      {showDialog && currentNpcId && (
        <DialogSystem
          npc={dialogTrees[currentNpcId].npc}
          node={dialogTrees[currentNpcId].nodes[dialogNodeKey]}
          options={dialogTrees[currentNpcId].nodes[dialogNodeKey].options}
          onSelect={handleDialogSelect}
          stats={stats}
        />
      )}
      {showFinal && <FinalWindow stats={stats} />}
    </div>
  );
}
