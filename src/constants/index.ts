// Wheel constants
export const WHEEL_ANIMATION_DURATION = 4000; // milliseconds
export const WHEEL_ANIMATION_DELAY = 500; // milliseconds before showing winner
export const WHEEL_MIN_ROTATIONS = 5;
export const WHEEL_MAX_ROTATIONS = 8;
export const WHEEL_POINTER_ANGLE = 90; // degrees (right side)
export const WHEEL_RADIUS = 256; // pixels
export const WHEEL_TEXT_RADIUS_RATIO = 0.65; // 65% of wheel radius
export const WHEEL_MAX_NAME_LENGTH = 20;
export const WHEEL_NAME_TRUNCATE_LENGTH = 18;

// Wheel colors
export const WHEEL_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#06b6d4",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
  "#f97316",
];

// Winner animation constants
export const WINNER_ANIMATION_DURATION = 2000; // milliseconds
export const WINNER_ANIMATION_FADE_OUT_DELAY = 1700; // milliseconds
export const WINNER_EMOJIS = ["🫵", "🎉", "👀", "😎", "🎈", "🏆", "🧨", "🐳"];
export const WINNER_EMOJI_COUNT_MIN = 20;
export const WINNER_EMOJI_COUNT_MAX = 30;
export const WINNER_EMOJI_SIZE_MIN = 40; // pixels
export const WINNER_EMOJI_SIZE_MAX = 100; // pixels
export const WINNER_EMOJI_DELAY_MAX = 0.5; // seconds
export const WINNER_TEXT_ZONE_WIDTH = 50; // % of screen width
export const WINNER_TEXT_ZONE_HEIGHT = 25; // % of screen height
export const WINNER_EMOJI_MARGIN = 7; // % additional margin for emoji size

// Error messages
export const ERROR_MESSAGES = {
  TEAM_NOT_FOUND: "Команда не найдена. Создайте новую на главной.",
  FAILED_TO_CREATE_TEAM: "Не удалось создать команду. Попробуйте ещё раз.",
  FAILED_TO_LOAD_MEMBERS: "Не удалось загрузить участников",
  FAILED_TO_ADD_MEMBER: "Не удалось добавить участника",
  FAILED_TO_UPDATE_VACATION: "Не удалось обновить отпуск",
  FAILED_TO_DELETE_MEMBER: "Не удалось удалить участника",
  FAILED_TO_SAVE_NAME: "Не удалось сохранить название",
  FAILED_TO_SAVE_RESULT: "Не удалось сохранить результат",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ADD_MEMBERS: "Добавьте участников",
  WINNER: (name: string) => `Тебе повезло, ${name}! 🎉`,
} as const;
