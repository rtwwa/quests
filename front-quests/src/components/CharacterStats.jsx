export default function CharacterStats({ stats }) {
  return (
    <div className="fixed top-24 left-4 bg-black bg-opacity-80 text-white rounded-lg border-2 border-white p-4 font-pixel z-50 min-w-[200px]">
      <div className="text-lg font-bold mb-2">Характеристики</div>
      <div className="flex flex-col gap-1">
        <div>Креатив: {stats.creativity}</div>
        <div>Эмпатия: {stats.empathy}</div>
        <div>Отвага: {stats.bravery}</div>
        <div>Логика: {stats.logic}</div>
        <div>Организация: {stats.organization}</div>
      </div>
    </div>
  );
}
