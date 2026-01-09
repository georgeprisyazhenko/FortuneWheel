import { WHEEL_POINTER_ANGLE, WHEEL_MIN_ROTATIONS, WHEEL_MAX_ROTATIONS } from "@/constants";

/**
 * Вычисляет угол поворота колеса для остановки на указанном участнике
 * @param winnerIndex - индекс победителя в массиве участников на колесе
 * @param wheelMembersCount - количество участников на колесе
 * @param currentRotation - текущий угол поворота колеса в градусах
 * @returns новый угол поворота колеса в градусах
 */
export function calculateWheelRotation(
  winnerIndex: number,
  wheelMembersCount: number,
  currentRotation: number
): number {
  if (wheelMembersCount === 0) {
    return currentRotation;
  }

  const slice = 360 / wheelMembersCount;
  const bisectorAngleInWheel = winnerIndex * slice + slice / 2;
  
  // Нормализуем текущий поворот колеса к 0-360
  const currentRotationNormalized = ((currentRotation % 360) + 360) % 360;
  
  // Текущее положение биссектрисы сектора победителя (с учетом текущего поворота колеса)
  const currentBisectorPosition = (bisectorAngleInWheel + currentRotationNormalized) % 360;
  
  // Вычисляем, на какой угол нужно повернуть колесо, чтобы биссектриса оказалась справа
  let angleToTarget = WHEEL_POINTER_ANGLE - currentBisectorPosition;
  
  // Нормализуем угол к 0-360
  if (angleToTarget < 0) {
    angleToTarget += 360;
  }
  
  // Добавляем несколько полных оборотов для эффекта вращения
  const fullRotations = WHEEL_MIN_ROTATIONS + Math.floor(Math.random() * (WHEEL_MAX_ROTATIONS - WHEEL_MIN_ROTATIONS + 1));
  const targetRotation = currentRotation + fullRotations * 360 + angleToTarget;
  
  return targetRotation;
}
