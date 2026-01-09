import type { Member } from "@/types";

export type { Member };

export function poolForToday(members: Member[], lastWinnerId: string | null) {
  // Исключаем только участников в отпуске
  // Прошлый победитель НЕ исключается автоматически - только если стоит галочка vacation
  return members.filter((m) => !m.vacation);
}

export function pickRandom<T>(items: T[]): T | null {
  if (!items.length) return null;
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
}

