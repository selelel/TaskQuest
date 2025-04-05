import { create } from 'zustand';
import { CalendarTodo, CalendarState } from './types';

interface CalendarActions {
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setView: (view: 'month' | 'week' | 'day') => void;
  addTodo: (todo: Omit<CalendarTodo, 'id'>) => void;
  updateTodo: (id: string, todo: Partial<CalendarTodo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodoComplete: (id: string) => void;
  addSubTodo: (todoId: string, title: string) => void;
  toggleSubTodoComplete: (todoId: string, subTodoId: string) => void;
}

const useCalendarStore = create<CalendarState & CalendarActions>((set) => ({
  currentDate: new Date(),
  selectedDate: null,
  todos: [],
  view: 'month',

  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setView: (view) => set({ view }),

  addTodo: (todo) => set((state) => ({
    todos: [...state.todos, { ...todo, id: crypto.randomUUID() }]
  })),

  updateTodo: (id, todo) => set((state) => ({
    todos: state.todos.map((t) => 
      t.id === id ? { ...t, ...todo } : t
    )
  })),

  deleteTodo: (id) => set((state) => ({
    todos: state.todos.filter((t) => t.id !== id)
  })),

  toggleTodoComplete: (id) => set((state) => ({
    todos: state.todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    )
  })),

  addSubTodo: (todoId, title) => set((state) => ({
    todos: state.todos.map((t) =>
      t.id === todoId
        ? {
            ...t,
            subtodos: [
              ...(t.subtodos || []),
              { id: crypto.randomUUID(), title, completed: false }
            ]
          }
        : t
    )
  })),

  toggleSubTodoComplete: (todoId, subTodoId) => set((state) => ({
    todos: state.todos.map((t) =>
      t.id === todoId
        ? {
            ...t,
            subtodos: t.subtodos?.map((st) =>
              st.id === subTodoId
                ? { ...st, completed: !st.completed }
                : st
            )
          }
        : t
    )
  }))
}));

export default useCalendarStore; 