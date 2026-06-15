import { client } from '../client';

interface BackendProgramItem {
  id: number;
  name: string;         
  difficulty: string;    
  description?: string;
  days_count: number;
}

// Тип для UI
export interface Program {
  id: string;
  name: string;
  difficulty: 'Начинающий' | 'Средний' | 'Продвинутый';
  image: string;
  daysCount?: number;
}

export type GetProgramsResponse =
  | { status: 200; data: Program[] }
  | { status: 401; data: { error: string } }
  | { status: 500; data: { message: string } };

// Интеграция сложностей
const mapDifficulty = (diff: string): Program['difficulty'] => {
  const map: Record<string, Program['difficulty']> = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
  };
  return map[diff] || 'Начинающий';
};

// Маппинг объекта
const mapBackendToProgram = (backend: BackendProgramItem): Program => ({
  id: String(backend.id),
  name: backend.name,
  difficulty: mapDifficulty(backend.difficulty),
  image: '', // бэк не отдаёт картинку в списке, компонент использует fallback
  daysCount: backend.days_count,
});

// Основная функция
export async function getPrograms(): Promise<GetProgramsResponse> {
  try {
    const response = await client.get<any>('programs/', {
     validateStatus: (status: number) => status === 200 || status === 401,
    });

    const items = response.data?.results ?? response.data;
    const programs = Array.isArray(items) ? items.map(mapBackendToProgram) : [];

    return {
      status: response.status as 200 | 401,
      data: programs,
    } as GetProgramsResponse;
  } catch (error) {
    console.error('Ошибка загрузки программ:', error);
    return {
      status: 500,
      data: { message: 'Ошибка сети или сервера' },
    };
  }
}