export interface Exercise {
  id: string;
  name: string;
}

const STORAGE_KEY = 'my_account_exercises';

export function getMyAccountExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: Exercise[] = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function addExerciseToMyAccount(exercise: Exercise): void {
  const current = getMyAccountExercises();
  const exists = current.some((x) => x.id === exercise.id);
  if (exists) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, exercise]));
}

