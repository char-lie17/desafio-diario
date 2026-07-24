import grade7 from '../../content/math/grade-7.json';
import grade8 from '../../content/math/grade-8.json';
import grade9 from '../../content/math/grade-9.json';
import grade10 from '../../content/math/grade-10.json';
import grade11 from '../../content/math/grade-11.json';
import chessPuzzles from '../../content/chess/puzzles.json';

const MATH_BY_GRADE = {
  7: grade7,
  8: grade8,
  9: grade9,
  10: grade10,
  11: grade11,
};

// Deterministic string hashing function (DJB2 variant)
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

// Get current date string in YYYY-MM-DD
export function getTodayDateString(customDate = null) {
  const d = customDate ? new Date(customDate) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for visual display: "Jueves, 23 de julio de 2026"
export function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formatted = d.toLocaleDateString('es-ES', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Get deterministic daily math problem based on Date + Grade
export function getDailyMathProblem(grade = 9, dateStr = getTodayDateString()) {
  const problems = MATH_BY_GRADE[grade] || MATH_BY_GRADE[9];
  if (!problems || problems.length === 0) return null;

  const seedKey = `${dateStr}-math-grade-${grade}`;
  const index = hashString(seedKey) % problems.length;
  return problems[index];
}

// Get deterministic daily chess puzzle based on Date
export function getDailyChessPuzzle(dateStr = getTodayDateString()) {
  if (!chessPuzzles || chessPuzzles.length === 0) return null;

  const seedKey = `${dateStr}-chess-puzzle`;
  const index = hashString(seedKey) % chessPuzzles.length;
  return chessPuzzles[index];
}

// Storage keys
const STORAGE_GRADE_KEY = 'desafiodiario_grade';
const STORAGE_COMPLETED_KEY = 'desafiodiario_completed';
const STORAGE_STREAK_KEY = 'desafiodiario_streak';

export function getSavedGrade() {
  const saved = localStorage.getItem(STORAGE_GRADE_KEY);
  return saved ? parseInt(saved, 10) : 9; // Default to 9th grade
}

export function saveGrade(grade) {
  localStorage.setItem(STORAGE_GRADE_KEY, grade.toString());
}

export function getCompletedStatus(dateStr = getTodayDateString(), grade = null) {
  try {
    const raw = localStorage.getItem(STORAGE_COMPLETED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const dayData = data[dateStr] || { math: {}, chess: false };
    // Migrate legacy boolean math format to per-grade object
    if (typeof dayData.math === 'boolean') {
      dayData.math = {};
    }
    const mathDone = grade !== null ? (dayData.math[grade] || false) : false;
    return { math: mathDone, chess: dayData.chess || false };
  } catch (e) {
    return { math: false, chess: false };
  }
}

export function markChallengeCompleted(type, dateStr = getTodayDateString(), grade = null) {
  try {
    const raw = localStorage.getItem(STORAGE_COMPLETED_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const dayData = data[dateStr] || { math: {}, chess: false };
    // Migrate legacy boolean math format
    if (typeof dayData.math === 'boolean') {
      dayData.math = {};
    }
    if (type === 'math' && grade !== null) {
      dayData.math[grade] = true;
    } else if (type === 'chess') {
      dayData.chess = true;
    }
    data[dateStr] = dayData;
    localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(data));
    updateStreak();
    // Return the resolved status for this specific grade
    const mathDone = grade !== null ? (dayData.math[grade] || false) : false;
    return { math: mathDone, chess: dayData.chess || false };
  } catch (e) {
    return { math: false, chess: false };
  }
}

export function getStreak() {
  try {
    const raw = localStorage.getItem(STORAGE_STREAK_KEY);
    return raw ? parseInt(raw, 10) : 1;
  } catch (e) {
    return 1;
  }
}

function updateStreak() {
  try {
    const today = getTodayDateString();
    const status = getCompletedStatus(today);
    // If both math and chess completed today, increment or set streak
    if (status.math && status.chess) {
      let streak = getStreak();
      localStorage.setItem(STORAGE_STREAK_KEY, (streak + 1).toString());
    }
  } catch (e) {}
}
