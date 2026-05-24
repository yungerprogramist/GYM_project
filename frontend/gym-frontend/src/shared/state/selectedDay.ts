import { format, parseISO } from 'date-fns';
import { create } from 'zustand';

interface DateState {
  // selectedDate и selectedDateISO синхронизированны 
  readonly selectedDate: Date;
  readonly selectedDateISO: string;
  // методы одикаковые за исключением входных данных
  setSelectedDate: (date: Date) => void;
  setSelectedDateISO: (date: string) => void;
}

const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const useDateStore = create<DateState>((set) => {
  const now = new Date();

  return {
    selectedDate: now,
    selectedDateISO: formatDate(now),

    // Принимаем Date -> вычисляем строку
    setSelectedDate: (date: Date) => set({
      selectedDate: date,
      selectedDateISO: formatDate(date),
    }),

    // Принимаем строку -> парсим в Date
    setSelectedDateISO: (dateStr: string) => {
      const parsedDate = parseISO(dateStr);
      set({
        selectedDate: parsedDate,
        selectedDateISO: dateStr,
      });
    },
  };
});
