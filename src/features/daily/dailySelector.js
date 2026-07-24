import grade7 from '../../content/math/grade-7.json';
import grade8 from '../../content/math/grade-8.json';
import grade9 from '../../content/math/grade-9.json';
import grade10 from '../../content/math/grade-10.json';
import grade11 from '../../content/math/grade-11.json';

export const LAUNCH_DATE = '2026-07-23';

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

// Get sequential daily math problem based on days since LAUNCH_DATE
export function getDailyMathProblem(grade = 9, dateStr = getTodayDateString()) {
  const problems = MATH_BY_GRADE[grade] || MATH_BY_GRADE[9];
  if (!problems || problems.length === 0) return null;

  const [lY, lM, lD] = LAUNCH_DATE.split('-').map(Number);
  const launchDateObj = new Date(lY, lM - 1, lD);
  const [cY, cM, cD] = dateStr.split('-').map(Number);
  const currentDateObj = new Date(cY, cM - 1, cD);
  
  const diffTime = currentDateObj - launchDateObj;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Capped at 0 to prevent negative indices if someone accesses a pre-launch date
  const index = Math.max(0, diffDays) % problems.length;
  
  return problems[index];
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
    updateStreak(dateStr);
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
    let currentStreak = raw ? parseInt(raw, 10) : 1;
    
    const lastStreakDate = localStorage.getItem('desafiodiario_last_streak');
    if (lastStreakDate) {
      const today = getTodayDateString();
      const [lY, lM, lD] = lastStreakDate.split('-').map(Number);
      const lastObj = new Date(lY, lM - 1, lD);
      const [tY, tM, tD] = today.split('-').map(Number);
      const todayObj = new Date(tY, tM - 1, tD);
      
      const diffTime = todayObj - lastObj;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If it's been more than 1 day since last streak update, reset to 1
      if (diffDays > 1) {
        currentStreak = 1;
        localStorage.setItem(STORAGE_STREAK_KEY, '1');
      }
    }
    return currentStreak;
  } catch (e) {
    return 1;
  }
}

function updateStreak(dateStr) {
  try {
    const today = getTodayDateString();
    // Enforce: Streak only increases if they solve TODAY's problem
    if (dateStr !== today) return;

    const lastStreakDate = localStorage.getItem('desafiodiario_last_streak');
    // Enforce: Only one streak point per day
    if (lastStreakDate === today) return;

    let streak = getStreak();
    // If it's the very first time completing, streak might be 1, but we want it to be 1 now, not 2.
    // Wait, getStreak defaults to 1. If we complete day 1, streak should be 1. Day 2 -> 2.
    // Let's check if they never had a lastStreakDate.
    if (!lastStreakDate) {
      localStorage.setItem(STORAGE_STREAK_KEY, '1');
    } else {
      localStorage.setItem(STORAGE_STREAK_KEY, (streak + 1).toString());
    }
    localStorage.setItem('desafiodiario_last_streak', today);
  } catch (e) {}
}
