import { authClient } from '../authClient';

interface BackendProgramItem {
  id: number;
  name: string;
  difficulty: string;
  description?: string;       
  days_count: number;        
}

export interface Program {
  id: string;
  name: string;
  difficulty: 'Начинающий' | 'Средний' | 'Продвинутый';
  image: string;
  description?: string;      
  daysCount?: number;       
}

export type GetProgramsResponse =
  | { status: 200; data: Program[] }
  | { status: 401; data: { error: string } }
  | { status: 500; data: { message: string } };

const mapDifficulty = (diff: string): Program['difficulty'] => {
  const map: Record<string, Program['difficulty']> = {
    beginner: 'Начинающий',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
  };
  return map[diff] || 'Начинающий';
};

const mapBackendToProgram = (backend: BackendProgramItem): Program => ({
  id: String(backend.id),
  name: backend.name,
  difficulty: mapDifficulty(backend.difficulty),
  image: '', // Бэкенд не отдаёт картинку в списке
  description: backend.description, 
  daysCount: backend.days_count,   
});

export async function getPrograms(): Promise<GetProgramsResponse> {
  try {
    const response = await authClient.get<any>('programs/', {  //Использование authclient
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