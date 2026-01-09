export type Member = {
  id: string;
  name: string;
  vacation: boolean;
};

export function poolForToday(members: Member[], lastWinnerId: string | null) {
  return members.filter((m) => {
    // Исключаем участников в отпуске
    if (m.vacation) return false;
    // Если нет прошлого победителя, включаем всех не в отпуске
    if (!lastWinnerId) return true;
    // Исключаем прошлого победителя
    return m.id !== lastWinnerId;
  });
}

export function pickRandom<T>(items: T[]): T | null {
  if (!items.length) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
}

