"use client";

import { useMemo } from "react";
import type { Member } from "@/types";
import {
  WHEEL_COLORS,
  WHEEL_RADIUS,
  WHEEL_TEXT_RADIUS_RATIO,
  WHEEL_MAX_NAME_LENGTH,
  WHEEL_NAME_TRUNCATE_LENGTH,
} from "@/constants";

interface FortuneWheelProps {
  members: Member[];
  spinning: boolean;
  winnerId: string | null;
  poolLength: number;
  rotation: number;
}

export function FortuneWheel({
  members,
  spinning,
  poolLength,
  rotation,
}: FortuneWheelProps) {
  const gradient = useMemo(() => {
    if (!members.length) {
      return "conic-gradient(#e2e8f0 0deg 360deg)";
    }

    const slice = 360 / members.length;
    const colorIndices: number[] = [];

    // Гарантируем, что соседние сектора всегда имеют разные цвета
    members.forEach((m, idx) => {
      let colorIdx;
      if (idx === 0) {
        colorIdx = 0;
      } else {
        const prevColorIdx = colorIndices[idx - 1];
        colorIdx = (prevColorIdx + 1) % WHEEL_COLORS.length;
      }
      colorIndices.push(colorIdx);
    });

    // Проверяем последний и первый сектора - они тоже соседние!
    if (members.length > 1 && colorIndices[0] === colorIndices[colorIndices.length - 1]) {
      colorIndices[0] = (colorIndices[0] + 1) % WHEEL_COLORS.length;
      // Проверяем, что первый не совпадает со вторым
      if (members.length > 1 && colorIndices[0] === colorIndices[1]) {
        colorIndices[0] = (colorIndices[0] + 1) % WHEEL_COLORS.length;
      }
    }

    const parts = members.map((m, idx) => {
      const start = idx * slice;
      const end = (idx + 1) * slice;
      const color = WHEEL_COLORS[colorIndices[idx]];
      return `${color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${parts.join(",")})`;
  }, [members]);

  return (
    <div className="relative flex flex-col items-center w-full">
      <div className="relative w-full max-w-[512px] aspect-square rounded-full border-4 border-white shadow-inner"
        style={{
          backgroundImage: gradient,
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? "transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
            : "none",
        }}
      >
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        {members.map((m, idx) => {
          const n = members.length;
          const slice = 360 / n;

          // Угол биссектрисы сектора (в CSS: 0° = top, по часовой стрелке)
          const bisectorAngle = idx * slice + slice / 2;

          // Радиус размещения текста (в процентах от размера контейнера)
          // WHEEL_TEXT_RADIUS_RATIO = 0.65, значит текст на 65% от центра к краю
          // Это примерно 32.5% от центра контейнера (50% * 0.65)
          const radiusPercent = 50 * WHEEL_TEXT_RADIUS_RATIO;

          // Переводим угол из CSS системы (0° = top) в математическую (0° = right)
          const mathAngleRad = ((bisectorAngle - 90) * Math.PI) / 180;

          // Координаты точки на биссектрисе (в процентах от размера контейнера)
          // Используем проценты для адаптивности
          const xPercent = Math.cos(mathAngleRad) * radiusPercent;
          const yPercent = Math.sin(mathAngleRad) * radiusPercent;

          // Угол поворота текста для радиального расположения
          const textRotation = bisectorAngle - 90;

          // Обрезаем имя только если больше максимальной длины
          const displayName =
            m.name.length > WHEEL_MAX_NAME_LENGTH
              ? m.name.slice(0, WHEEL_NAME_TRUNCATE_LENGTH) + "…"
              : m.name;

          return (
            <div
              key={m.id}
              className="absolute text-xs sm:text-sm font-semibold text-white drop-shadow-lg pointer-events-none"
              style={{
                left: `calc(50% + ${xPercent}%)`,
                top: `calc(50% + ${yPercent}%)`,
                transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
                textAlign: "center",
                whiteSpace: "nowrap",
              }}
              title={m.name}
            >
              {displayName}
            </div>
          );
        })}
      </div>
      <div
        className="absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2"
        style={{
          width: 0,
          height: 0,
          borderTop: "12px solid transparent",
          borderBottom: "12px solid transparent",
          borderRight: "30px solid #5c5b5b",
        }}
      />
      <p className="mt-3 text-sm text-slate-600">
        {poolLength
          ? `В пуле: ${poolLength}`
          : "Добавьте участников, чтобы крутить колесо"}
      </p>
    </div>
  );
}
