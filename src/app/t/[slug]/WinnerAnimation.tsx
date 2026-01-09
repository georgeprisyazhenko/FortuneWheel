"use client";

import { useEffect, useState } from "react";

const EMOJIS = ["👉", "🎉", "🎊", "😎"];

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
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setSelectedEmoji(emoji);

    // Создаем 20-30 эмоджи сразу с разными задержками для плавного появления
    // Эмоджи не должны появляться в зоне текста (центр экрана)
    const count = 20 + Math.floor(Math.random() * 11); // 20-30 штук
    const centerX = 50; // Центр по X (50%)
    const centerY = 50; // Центр по Y (50%)
    
    // Запрещенная зона для текста: примерно 50% ширины и 25% высоты вокруг центра
    // Это учитывает длину текста "Тебе повезло, [имя]!" и его размер
    const textZoneWidth = 50; // % ширины экрана
    const textZoneHeight = 25; // % высоты экрана
    
    const newEmojis: Array<{ id: number; x: number; y: number; size: number; delay: number }> = [];
    let attempts = 0;
    const maxAttempts = count * 30; // Максимум попыток для генерации
    
    while (newEmojis.length < count && attempts < maxAttempts) {
      attempts++;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      // Проверяем, не попадает ли эмоджи в запрещенную зону текста
      const distanceX = Math.abs(x - centerX);
      const distanceY = Math.abs(y - centerY);
      
      // Также учитываем размер самого эмоджи (максимум 100px)
      // На среднем экране 100px ≈ 5-7% ширины/высоты
      const emojiMargin = 7; // Дополнительный отступ для размера эмоджи
      
      const isInTextZone = 
        distanceX < (textZoneWidth / 2 + emojiMargin) &&
        distanceY < (textZoneHeight / 2 + emojiMargin);
      
      // Если эмоджи не в запрещенной зоне, добавляем его
      if (!isInTextZone) {
        newEmojis.push({
          id: newEmojis.length,
          x,
          y,
          size: 40 + Math.random() * 60, // Размер от 40 до 100px
          delay: Math.random() * 0.5, // Задержка от 0 до 0.5 секунды для плавного появления
        });
      }
    }

    setEmojis(newEmojis);

    // Начинаем плавное исчезновение за 0.3 секунды до конца
    const fadeOutTimeout = setTimeout(() => {
      setIsFadingOut(true);
    }, 1700); // 2000 - 300 = 1700

    // Завершаем анимацию через 2 секунды
    const completeTimeout = setTimeout(() => {
      onComplete();
    }, 2000);

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
