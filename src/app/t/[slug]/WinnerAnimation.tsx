"use client";

import { useEffect, useState } from "react";

const EMOJIS = ["👉", "🎉", "🎊", "😎"];

interface WinnerAnimationProps {
  winnerName: string;
  onComplete: () => void;
}

export function WinnerAnimation({ winnerName, onComplete }: WinnerAnimationProps) {
  const [emojis, setEmojis] = useState<Array<{ id: number; emoji: string; x: number; y: number; size: number }>>([]);

  useEffect(() => {
    // Создаем эмоджи, которые появляются и исчезают
    const interval = setInterval(() => {
      const newEmoji = {
        id: Date.now() + Math.random(),
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        x: Math.random() * 100, // Процент от ширины экрана
        y: Math.random() * 100, // Процент от высоты экрана
        size: 40 + Math.random() * 60, // Размер от 40 до 100px
      };
      
      setEmojis((prev) => [...prev, newEmoji]);
      
      // Удаляем эмоджи после анимации
      setTimeout(() => {
        setEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
      }, 800);
    }, 100); // Новый эмоджи каждые 100мс

    // Останавливаем создание новых эмоджи через 1 секунду
    const stopTimeout = setTimeout(() => {
      clearInterval(interval);
    }, 1000);

    // Завершаем анимацию через 1 секунду
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimeout);
      clearTimeout(completeTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Затемненный фон */}
      <div className="absolute inset-0 bg-black/50 z-0" />
      
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
            }}
          >
            {emoji.emoji}
          </div>
        ))}
      </div>
      
      {/* Большой текст поверх всего */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl">
          Тебе повезло, {winnerName}!
        </h1>
      </div>
    </div>
  );
}
