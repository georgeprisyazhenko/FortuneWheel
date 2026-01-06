export type Member = {
  id: string;
  name: string;
  vacation: boolean;
};

export function poolForToday(members: Member[], lastWinnerId: string | null) {
  return members.filter(
    (m) => !m.vacation && (!lastWinnerId || m.id !== lastWinnerId),
  );
}

export function pickRandom<T>(items: T[]): T | null {
  if (!items.length) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
}

