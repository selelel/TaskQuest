export type RecurrenceType = 'custom' | 'daily' | 'weekly';

export interface CalendarTodo {
  id: string;
  title: string;
  description?: string;
  date: Date;
  recurrenceType: RecurrenceType;
  recurrencePattern?: {
    daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
    customDays?: number[]; // For custom recurrence
  };
  completed: boolean;
  subtodos?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface CalendarDay {
  date: Date;
  todos: CalendarTodo[];
}

export interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  todos: CalendarTodo[];
  view: 'month' | 'week' | 'day';
} 