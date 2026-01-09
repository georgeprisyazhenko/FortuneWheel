"use client";

import { useEffect, useState } from "react";
import {
  WINNER_EMOJIS,
  WINNER_ANIMATION_DURATION,
  WINNER_ANIMATION_FADE_OUT_DELAY,
  WINNER_EMOJI_COUNT_MIN,
  WINNER_EMOJI_COUNT_MAX,
  WINNER_EMOJI_SIZE_MIN,
  WINNER_EMOJI_SIZE_MAX,
  WINNER_EMOJI_DELAY_MAX,
  WINNER_TEXT_ZONE_WIDTH,
  WINNER_TEXT_ZONE_HEIGHT,
  WINNER_EMOJI_MARGIN,
} from "@/constants";

interface WinnerAnimationProps {
  winnerName: string;
  onComplete: () => void;
}

export function WinnerAnimation({ winnerName, onComplete }: WinnerAnimationProps) {
  const [emojis, setEmojis] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const [selectedEmoji, setSelectedEmoji] = useState<string>("");
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Выбираем один случайный эмоджи для всей анимации
    const emoji =
      WINNER_EMOJIS[Math.floor(Math.random() * WINNER_EMOJIS.length)];
    setSelectedEmoji(emoji);

    // Создаем эмоджи с разными задержками для плавного появления
    // Эмоджи не должны появляться в зоне текста (центр экрана)
    const count =
      WINNER_EMOJI_COUNT_MIN +
      Math.floor(Math.random() * (WINNER_EMOJI_COUNT_MAX - WINNER_EMOJI_COUNT_MIN + 1));
    const centerX = 50; // Центр по X (50%)
    const centerY = 50; // Центр по Y (50%)

    const newEmojis: Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      delay: number;
    }> = [];
    let attempts = 0;
    const maxAttempts = count * 30; // Максимум попыток для генерации

    while (newEmojis.length < count && attempts < maxAttempts) {
      attempts++;
      const x = Math.random() * 100;
      const y = Math.random() * 100;

      // Проверяем, не попадает ли эмоджи в запрещенную зону текста
      const distanceX = Math.abs(x - centerX);
      const distanceY = Math.abs(y - centerY);

      const isInTextZone =
        distanceX < WINNER_TEXT_ZONE_WIDTH / 2 + WINNER_EMOJI_MARGIN &&
        distanceY < WINNER_TEXT_ZONE_HEIGHT / 2 + WINNER_EMOJI_MARGIN;

      // Если эмоджи не в запрещенной зоне, добавляем его
      if (!isInTextZone) {
        newEmojis.push({
          id: newEmojis.length,
          x,
          y,
          size:
            WINNER_EMOJI_SIZE_MIN +
            Math.random() * (WINNER_EMOJI_SIZE_MAX - WINNER_EMOJI_SIZE_MIN),
          delay: Math.random() * WINNER_EMOJI_DELAY_MAX,
        });
      }
    }

    setEmojis(newEmojis);

    // Начинаем плавное исчезновение за 0.3 секунды до конца
    const fadeOutTimeout = setTimeout(() => {
      setIsFadingOut(true);
    }, WINNER_ANIMATION_FADE_OUT_DELAY);

    // Завершаем анимацию
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, WINNER_ANIMATION_DURATION);

    return () => {
      clearTimeout(fadeOutTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFadingOut ? 'overlay-fade-out' : 'overlay-fade-in'}`}>
      {/* Затемненный фон (темнее) */}
      <div className="absolute inset-0 bg-black/80 z-0" />
      
      {/* Эмоджи на заднем плане (за текстом, но поверх затемненного фона) */}
      <div className="absolute inset-0 pointer-events-none z-[5]">
        {emojis.map((emoji) => (
          <div
            key={emoji.id}
            className="emoji-float absolute"
            style={{
              left: `${emoji.x}%`,
              top: `${emoji.y}%`,
              fontSize: `${emoji.size}px`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${emoji.delay}s`,
            }}
          >
            {selectedEmoji}
          </div>
        ))}
      </div>
      
      {/* Большой текст поверх всего (чуть поменьше) */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-2xl">
          Тебе повезло, {winnerName}!
        </h1>
      </div>
    </div>
  );
}
