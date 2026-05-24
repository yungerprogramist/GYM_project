import { create } from 'zustand';

export const calendarDateStore = create((set) => ({
  selectedDate: new Date(),
  setSelectedDate: (newDate: Date) => set({ selectedDate: newDate }),
}));