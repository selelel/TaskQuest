import { create } from 'zustand';
import { Todo } from './TodoItem';
import { GameMilestone, GAME_MILESTONES } from './ProgressBar';

interface DialogState {
  deleteDialog: {
    isOpen: boolean;
    type: 'todo' | 'subtodo';
    todoId: string;
    subTodoId?: string;
    title: string;
  } | null;
  gameDialog: {
    isOpen: boolean;
    milestone: GameMilestone;
    timeRemaining: number;
  } | null;
  timerDialog: {
    isOpen: boolean;
    todoId: string;
    minutes: string;
  } | null;
  timeUpDialog: {
    isOpen: boolean;
    message: string;
  } | null;
}

interface TodoState {
  todos: Todo[];
  newTodo: string;
  newSubTodo: string;
  selectedTodoId: string | null;
  milestones: GameMilestone[];
  dialogs: DialogState;
}

interface TodoActions {
  addTodo: () => void;
  setNewTodo: (text: string) => void;
  addSubTodo: (todoId: string) => void;
  setNewSubTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  toggleSubTodo: (todoId: string, subTodoId: string) => void;
  toggleTodoExpansion: (todoId: string) => void;
  setSelectedTodoId: (id: string | null) => void;
  deleteTodo: () => void;
  setDeleteDialog: (dialog: DialogState['deleteDialog']) => void;
  setGameDialog: (dialog: DialogState['gameDialog'] | ((prev: DialogState['gameDialog']) => DialogState['gameDialog'] | null)) => void;
  setTimerDialog: (dialog: DialogState['timerDialog'] | ((prev: DialogState['timerDialog']) => DialogState['timerDialog'] | null)) => void;
  setTimeUpDialog: (dialog: DialogState['timeUpDialog']) => void;
  updateMilestones: (milestonePercentage: number) => void;
  setTaskTimer: (todoId: string, minutes: number) => void;
  toggleTaskTimer: (todoId: string) => void;
  updateTaskTimer: (todoId: string) => void;
  getTodoProgress: (todo: Todo) => number;
}

type Store = TodoState & TodoActions;

const useStore = create<Store>((set, get) => ({
  todos: [],
  newTodo: '',
  newSubTodo: '',
  selectedTodoId: null,
  milestones: GAME_MILESTONES,
  dialogs: {
    deleteDialog: null,
    gameDialog: null,
    timerDialog: null,
    timeUpDialog: null,
  },

  addTodo: () => {
    const { newTodo, todos } = get();
    if (newTodo.trim() !== '') {
      set({
        todos: [...todos, {
          id: Date.now().toString(),
          text: newTodo,
          completed: false,
          subTodos: [],
          isExpanded: false,
          timer: {
            isRunning: false,
            totalSeconds: 0,
            initialSeconds: 0
          }
        }],
        newTodo: ''
      });
    }
  },

  setNewTodo: (text: string) => set({ newTodo: text }),

  addSubTodo: (todoId: string) => {
    const { newSubTodo, todos } = get();
    if (newSubTodo.trim() !== '') {
      set({
        todos: todos.map(todo =>
          todo.id === todoId
            ? {
                ...todo,
                subTodos: [...todo.subTodos, {
                  id: Date.now().toString(),
                  text: newSubTodo,
                  completed: false
                }]
              }
            : todo
        ),
        newSubTodo: ''
      });
    }
  },

  setNewSubTodo: (text: string) => set({ newSubTodo: text }),

  toggleTodo: (id: string) => set(state => ({
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  })),

  toggleSubTodo: (todoId: string, subTodoId: string) => set(state => ({
    todos: state.todos.map(todo =>
      todo.id === todoId
        ? {
            ...todo,
            subTodos: todo.subTodos.map(sub =>
              sub.id === subTodoId ? { ...sub, completed: !sub.completed } : sub
            )
          }
        : todo
    )
  })),

  toggleTodoExpansion: (todoId: string) => set(state => ({
    todos: state.todos.map(todo =>
      todo.id === todoId ? { ...todo, isExpanded: !todo.isExpanded } : todo
    )
  })),

  setSelectedTodoId: (id: string | null) => set({ selectedTodoId: id }),

  deleteTodo: () => {
    const { dialogs, todos } = get();
    if (!dialogs.deleteDialog) return;

    set(state => ({
      todos: state.todos.filter(todo => todo.id !== dialogs.deleteDialog?.todoId),
      dialogs: { ...state.dialogs, deleteDialog: null }
    }));
  },

  setDeleteDialog: (dialog: DialogState['deleteDialog']) => set(state => ({
    dialogs: { ...state.dialogs, deleteDialog: dialog }
  })),

  setGameDialog: (dialog: DialogState['gameDialog'] | ((prev: DialogState['gameDialog']) => DialogState['gameDialog'] | null)) => 
    set(state => ({
      dialogs: {
        ...state.dialogs,
        gameDialog: typeof dialog === 'function' ? dialog(state.dialogs.gameDialog) : dialog
      }
    })),

  setTimerDialog: (dialog: DialogState['timerDialog'] | ((prev: DialogState['timerDialog']) => DialogState['timerDialog'] | null)) => 
    set(state => ({
      dialogs: {
        ...state.dialogs,
        timerDialog: typeof dialog === 'function' ? dialog(state.dialogs.timerDialog) : dialog
      }
    })),

  setTimeUpDialog: (dialog: DialogState['timeUpDialog']) => set(state => ({
    dialogs: { ...state.dialogs, timeUpDialog: dialog }
  })),

  updateMilestones: (milestonePercentage: number) => set(state => ({
    milestones: state.milestones.map(m =>
      m.percentage === milestonePercentage ? { ...m, game: { ...m.game, used: true } } : m
    )
  })),

  setTaskTimer: (todoId: string, minutes: number) => set(state => ({
    todos: state.todos.map(todo =>
      todo.id === todoId
        ? {
            ...todo,
            timer: {
              isRunning: false,
              totalSeconds: minutes * 60,
              initialSeconds: minutes * 60
            }
          }
        : todo
    ),
    dialogs: { ...state.dialogs, timerDialog: null }
  })),

  toggleTaskTimer: (todoId: string) => set(state => ({
    todos: state.todos.map(todo =>
      todo.id === todoId
        ? {
            ...todo,
            timer: {
              ...todo.timer,
              isRunning: !todo.timer.isRunning
            }
          }
        : todo
    )
  })),

  updateTaskTimer: (todoId: string) => set(state => ({
    todos: state.todos.map(todo =>
      todo.id === todoId && todo.timer.isRunning && todo.timer.totalSeconds > 0
        ? {
            ...todo,
            timer: {
              ...todo.timer,
              totalSeconds: todo.timer.totalSeconds - 1
            }
          }
        : todo
    )
  })),

  getTodoProgress: (todo: Todo) => {
    if (todo.subTodos.length === 0) return todo.completed ? 100 : 0;
    return (todo.subTodos.filter(sub => sub.completed).length / todo.subTodos.length) * 100;
  }
}));

export default useStore; 