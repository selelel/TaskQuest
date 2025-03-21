import { Button } from "@/components/ui/button"
import { useState, KeyboardEvent, ChangeEvent, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown, ChevronUp, Trophy, Gamepad2, Sword, Star, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubTodo {
  id: string;
  text: string;
  completed: boolean;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  subTodos: SubTodo[];
  isExpanded: boolean;
}

interface GameMilestone {
  percentage: number;
  label: string;
  icon: React.ReactNode;
  description: string;
  game: {
    name: string;
    locked: boolean;
    used: boolean;
  };
}

const GAME_MILESTONES: GameMilestone[] = [
  {
    percentage: 25,
    label: "Novice",
    icon: <Trophy className="h-4 w-4" />,
    description: "First milestone unlocked! Time for a quick gaming session.",
    game: {
      name: "Gaming Break - Level 1",
      locked: true,
      used: false
    }
  },
  {
    percentage: 50,
    label: "Explorer",
    icon: <Gamepad2 className="h-4 w-4" />,
    description: "Halfway champion! Reward yourself with some gaming time.",
    game: {
      name: "Gaming Break - Level 2",
      locked: true,
      used: false
    }
  },
  {
    percentage: 75,
    label: "Warrior",
    icon: <Sword className="h-4 w-4" />,
    description: "Almost at the finish line! Take a well-deserved break.",
    game: {
      name: "Gaming Break - Level 3",
      locked: true,
      used: false
    }
  },
  {
    percentage: 100,
    label: "Champion",
    icon: <Star className="h-4 w-4" />,
    description: "You're a legend! Celebrate with a final gaming session!",
    game: {
      name: "Gaming Break - Level 4",
      locked: true,
      used: false
    }
  }
];

function IndexPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newSubTodo, setNewSubTodo] = useState("");
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'todo' | 'subtodo';
    todoId: string;
    subTodoId?: string;
    title: string;
  } | null>(null);
  const [gameDialog, setGameDialog] = useState<{
    isOpen: boolean;
    milestone: GameMilestone;
    timeRemaining: number;
  } | null>(null);
  const [milestones, setMilestones] = useState<GameMilestone[]>(GAME_MILESTONES);

  // Constants for game timer
  const GAME_SESSION_TIME = 30 * 60; // 30 minutes in seconds
  const WARNING_TIME = 5 * 60; // 5 minutes warning
  // Add timer interval ref with number type for Node.js
  const timerRef = useRef<number | undefined>(undefined);

  // Add audio ref for timer sound
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Add wake lock ref
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Create audio element for timer warning
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  // Request necessary permissions and setup wake lock
  useEffect(() => {
    const setupPermissions = async () => {
      try {
        // Request notification permission
        const notificationPermission = await Notification.requestPermission();
        if (notificationPermission !== 'granted') {
          console.warn('Notification permission not granted');
        }

        // Request wake lock
        if ('wakeLock' in navigator) {
          try {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
            wakeLockRef.current.addEventListener('release', () => {
              console.log('Wake Lock released');
            });
          } catch (err) {
            console.warn('Wake Lock request failed:', err);
          }
        }
      } catch (error) {
        console.error('Error setting up permissions:', error);
      }
    };

    setupPermissions();

    // Cleanup wake lock
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
      }
    };
  }, []);

  // Function to show desktop notification
  const showNotification = (title: string, body: string) => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico", // Make sure you have a favicon
        silent: false
      });
    }
  };

  // Handle game timer with notifications
  useEffect(() => {
    if (gameDialog?.timeRemaining === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Play sound when timer ends
      if (audioRef.current) {
        audioRef.current.play();
      }
      // Show notification when timer ends
      showNotification(
        "Time's Up!",
        "Your gaming break has ended. Time to get back to work!"
      );
      // Mark the milestone as used
      setMilestones(prev => prev.map(m => 
        m.percentage === gameDialog.milestone.percentage
          ? { ...m, game: { ...m.game, used: true } }
          : m
      ));
      setGameDialog(null);
      return;
    }

    if (gameDialog) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = window.setInterval(() => {
        setGameDialog(prev => {
          if (!prev) return null;
          const newTime = prev.timeRemaining - 1;
          
          // Show warning and play sound when 5 minutes remaining
          if (newTime === WARNING_TIME) {
            if (audioRef.current) {
              audioRef.current.play();
            }
            showNotification(
              "5 Minutes Remaining",
              "Your gaming break will end in 5 minutes!"
            );
          }
          
          return {
            ...prev,
            timeRemaining: newTime
          };
        });
      }, 1000);

      // Reacquire wake lock if needed
      const reacquireWakeLock = async () => {
        if (!wakeLockRef.current && 'wakeLock' in navigator) {
          try {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          } catch (err) {
            console.warn('Failed to reacquire wake lock:', err);
          }
        }
      };

      // Listen for visibility change to reacquire wake lock
      document.addEventListener('visibilitychange', reacquireWakeLock);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        document.removeEventListener('visibilitychange', reacquireWakeLock);
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameDialog?.timeRemaining]);

  const handlePlayGame = (milestone: GameMilestone) => {
    if (completionPercentage < milestone.percentage || milestone.game.used) return;
    
    setGameDialog({
      isOpen: true,
      milestone,
      timeRemaining: GAME_SESSION_TIME
    });
  };

  // Format time function
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      setTodos([...todos, { 
        id: Date.now().toString(), 
        text: newTodo, 
        completed: false,
        subTodos: [],
        isExpanded: false
      }]);
      setNewTodo("");
    }
  };

  const addSubTodo = (todoId: string) => {
    if (newSubTodo.trim() !== "") {
      setTodos(todos.map(todo => 
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
      ));
      setNewSubTodo("");
      setSelectedTodoId(null);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id 
        ? { 
            ...todo, 
            completed: !todo.completed,
            subTodos: todo.subTodos.map(sub => ({ ...sub, completed: !todo.completed }))
          } 
        : todo
    ));
  };

  const toggleSubTodo = (todoId: string, subTodoId: string) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? {
            ...todo,
            subTodos: todo.subTodos.map(sub =>
              sub.id === subTodoId
                ? { ...sub, completed: !sub.completed }
                : sub
            ),
            completed: false // Reset parent completion when sub-todos change
          }
        : todo
    ));
  };

  const toggleTodoExpansion = (todoId: string) => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? { ...todo, isExpanded: !todo.isExpanded } : todo
    ));
  };

  const getTodoProgress = (todo: Todo) => {
    if (todo.subTodos.length === 0) return todo.completed ? 100 : 0;
    return (todo.subTodos.filter(sub => sub.completed).length / todo.subTodos.length) * 100;
  };

  const completionPercentage = todos.length === 0 
    ? 0 
    : todos.reduce((acc, todo) => acc + getTodoProgress(todo), 0) / todos.length;

  const renderProgressBar = () => {
    return (
      <div className="mb-10 mt-2">
        <div className="relative pt-8 pb-4">
          {/* Progress bar background with milestone dividers */}
          <div className="h-3 w-full bg-gray-200 rounded-full relative">
            {GAME_MILESTONES.map((milestone, index) => (
              index < GAME_MILESTONES.length - 1 && (
                <div
                  key={milestone.percentage}
                  className="absolute top-0 bottom-0 w-0.5 bg-white"
                  style={{ left: `${milestone.percentage}%` }}
                />
              )
            ))}
            {/* Progress bar fill */}
            <Progress value={completionPercentage} className="h-3" />
          </div>

          {/* Milestone markers */}
          <div className="absolute top-0 left-0 w-full">
            {GAME_MILESTONES.map(milestone => (
              <div
                key={milestone.label}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${milestone.percentage}%` }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-gray-600 whitespace-nowrap mb-1">
                    {milestone.label}
                  </span>
                  <div 
                    className={`p-1 rounded-full transition-all duration-300 ${
                      completionPercentage >= milestone.percentage 
                        ? 'bg-yellow-100 text-yellow-600 scale-110 transform' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {milestone.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current progress label */}
          <div 
            className="absolute -bottom-6 transform -translate-x-1/2 transition-all duration-300"
            style={{ left: `${Math.min(Math.max(completionPercentage, 2), 98)}%` }}
          >
            <span className="text-sm font-medium text-blue-600 bg-white px-2 py-1 rounded-full shadow-sm border">
              {completionPercentage.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Game milestones list */}
        <div className="mt-8 space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-800">Progress Milestones</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {milestones.map(milestone => (
              <div
                key={milestone.label}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  milestone.game.used
                    ? 'bg-gray-100 border-gray-200 opacity-75'
                    : completionPercentage >= milestone.percentage
                      ? 'bg-yellow-50 border-yellow-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`${
                    milestone.game.used
                      ? 'text-gray-400'
                      : completionPercentage >= milestone.percentage 
                        ? 'text-yellow-500' 
                        : 'text-gray-400'
                    }`}
                  >
                    {milestone.icon}
                  </div>
                  <div className={`text-sm font-medium ${
                    milestone.game.used ? 'text-gray-500' : 'text-gray-900'
                  }`}>
                    {milestone.label}
                  </div>
                  <div className={`ml-auto text-xs font-medium ${
                    milestone.game.used
                      ? 'text-gray-400'
                      : completionPercentage >= milestone.percentage
                        ? 'text-yellow-600'
                        : 'text-gray-500'
                  }`}>
                    {milestone.percentage}%
                  </div>
                </div>
                <p className={`text-xs mb-3 ${
                  milestone.game.used ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  {milestone.game.used ? "Break already used - Come back tomorrow!" : milestone.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${
                      milestone.game.used ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {milestone.game.name}
                    </span>
                    <span className={`text-xs ${
                      milestone.game.used ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      30 min break
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full relative"
                    variant={
                      milestone.game.used
                        ? "secondary"
                        : completionPercentage >= milestone.percentage 
                          ? "default" 
                          : "secondary"
                    }
                    disabled={milestone.game.used || completionPercentage < milestone.percentage}
                    onClick={() => handlePlayGame(milestone)}
                  >
                    {milestone.game.used ? (
                      <>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-gray-500">Used</span>
                      </>
                    ) : (
                      <>
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        {completionPercentage >= milestone.percentage ? "Start Break" : "Locked"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleDelete = () => {
    if (!deleteDialog) return;

    if (deleteDialog.type === 'todo') {
      setTodos(todos.filter(todo => todo.id !== deleteDialog.todoId));
    } else {
      setTodos(todos.map(todo =>
        todo.id === deleteDialog.todoId
          ? {
              ...todo,
              subTodos: todo.subTodos.filter(sub => sub.id !== deleteDialog.subTodoId)
            }
          : todo
      ));
    }
    setDeleteDialog(null);
  };

  const openDeleteDialog = (type: 'todo' | 'subtodo', todoId: string, subTodoId?: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const title = type === 'todo' 
      ? `Delete "${todo.text}"`
      : `Delete "${todo.subTodos.find(s => s.id === subTodoId)?.text}"`;

    setDeleteDialog({
      isOpen: true,
      type,
      todoId,
      subTodoId,
      title
    });
  };

  const renderTodoItem = (todo: Todo) => (
    <div key={todo.id} className="border rounded-lg p-3 group">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
        />
        <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
          {todo.text}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {getTodoProgress(todo).toFixed(0)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleTodoExpansion(todo.id)}
          >
            {todo.isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteDialog('todo', todo.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {todo.isExpanded && (
        <div className="mt-3 pl-6 space-y-2">
          {todo.subTodos.map(subTodo => (
            <div key={subTodo.id} className="flex items-center gap-3 group">
              <Checkbox
                checked={subTodo.completed}
                onCheckedChange={() => toggleSubTodo(todo.id, subTodo.id)}
              />
              <span className={`flex-1 ${subTodo.completed ? 'line-through text-gray-400' : ''}`}>
                {subTodo.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openDeleteDialog('subtodo', todo.id, subTodo.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          
          {selectedTodoId === todo.id ? (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a sub-task"
                value={newSubTodo}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSubTodo(e.target.value)}
                onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addSubTodo(todo.id)}
                className="flex-1"
              />
              <Button onClick={() => addSubTodo(todo.id)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() => setSelectedTodoId(todo.id)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Sub-task
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Todo List</h1>
        
        {/* Progress Bar with Game Milestones */}
        {renderProgressBar()}

        {/* Add Todo Form */}
        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Add a new todo"
            value={newTodo}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTodo(e.target.value)}
            onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addTodo()}
            className="flex-1"
          />
          <Button onClick={addTodo}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Todo List */}
        <div className="space-y-4">
          {todos.map(todo => renderTodoItem(todo))}
          {todos.length === 0 && (
            <p className="text-center text-gray-500">No todos yet. Add one above!</p>
          )}
        </div>
      </div>

      <Dialog open={deleteDialog?.isOpen} onOpenChange={(open: boolean) => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteDialog?.title}</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              {deleteDialog?.type === 'todo' ? ' task and all its sub-tasks' : ' sub-task'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Dialog */}
      <Dialog 
        open={gameDialog?.isOpen} 
        onOpenChange={(open: boolean) => {
          if (!open) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            // Mark milestone as used when closing dialog
            if (gameDialog) {
              setMilestones(prev => prev.map(m => 
                m.percentage === gameDialog.milestone.percentage
                  ? { ...m, game: { ...m.game, used: true } }
                  : m
              ));
            }
            setGameDialog(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Gamepad2 className="h-6 w-6" />
              {gameDialog?.milestone.game.name}
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-[400px] flex flex-col items-center justify-center p-6 space-y-8">
            {/* Large Timer Display */}
            <div className="text-center space-y-6">
              <div className={`text-7xl font-bold font-mono tracking-wider ${
                (gameDialog?.timeRemaining ?? 0) <= WARNING_TIME ? 'text-red-500' : 'text-blue-600'
              }`}>
                {formatTime(gameDialog?.timeRemaining ?? 0)}
              </div>
              <div className="h-3 w-full max-w-md bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000"
                  style={{ 
                    width: `${((gameDialog?.timeRemaining ?? 0) / GAME_SESSION_TIME) * 100}%`,
                    backgroundColor: (gameDialog?.timeRemaining ?? 0) <= WARNING_TIME ? '#ef4444' : '#3b82f6'
                  }}
                />
              </div>
            </div>

            {/* Game Info */}
            <div className="text-center space-y-3 max-w-sm">
              <div className="flex items-center justify-center gap-2 text-2xl font-medium text-gray-700">
                <Trophy className="h-6 w-6 text-yellow-500" />
                {gameDialog?.milestone.label}
              </div>
              <p className="text-gray-600 text-lg">
                Time to play your favorite game!
              </p>
              {(gameDialog?.timeRemaining ?? 0) <= WARNING_TIME && (
                <p className="text-red-500 font-medium animate-pulse">
                  Almost time to get back to work!
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="sm:justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                (gameDialog?.timeRemaining ?? 0) <= WARNING_TIME 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-blue-500'
              }`} />
              <span className={`text-sm font-medium ${
                (gameDialog?.timeRemaining ?? 0) <= WARNING_TIME 
                  ? 'text-red-500' 
                  : 'text-blue-600'
              }`}>
                Session {(gameDialog?.timeRemaining ?? 0) <= WARNING_TIME ? 'ending soon' : 'in progress'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                // Mark milestone as used when ending early
                if (gameDialog) {
                  setMilestones(prev => prev.map(m => 
                    m.percentage === gameDialog.milestone.percentage
                      ? { ...m, game: { ...m.game, used: true } }
                      : m
                  ));
                }
                setGameDialog(null);
              }}
            >
              End Session Early
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default IndexPage