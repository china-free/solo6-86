import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const getWeekKey = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return format(weekStart, "yyyy-'W'ww", { locale: zhCN });
};

export const getWeekDates = (date: Date): Date[] => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
};

export const getWeekRangeText = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const startStr = format(weekStart, 'M月d日', { locale: zhCN });
  const endStr = format(weekEnd, 'M月d日', { locale: zhCN });
  return `${startStr} - ${endStr}`;
};

export const formatDateKey = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const parseDateKey = (dateStr: string): Date => {
  return parseISO(dateStr);
};

export const formatDateDisplay = (date: Date): string => {
  return format(date, 'M月d日', { locale: zhCN });
};

export const formatWeekday = (date: Date): string => {
  return format(date, 'EEEE', { locale: zhCN });
};

export const formatWeekdayShort = (date: Date): string => {
  return format(date, 'EEE', { locale: zhCN });
};

export const nextWeek = (date: Date): Date => {
  return addWeeks(date, 1);
};

export const prevWeek = (date: Date): Date => {
  return subWeeks(date, 1);
};

export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
