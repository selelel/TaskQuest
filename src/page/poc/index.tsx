import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyboardEvent, ChangeEvent, useEffect, useRef } from "react";
import TodoItem from "./_components/TodoItem";
import { ProgressBar } from "./_components/ProgressBar";
import { Dialogs } from "./_components/Dialogs";
import { WakeLock } from "./_components/WakeLock";
import { Notifications, showNotification } from "./_components/Notifications";
import useStore from "./_components/store";
import { Todo } from "./_components/TodoItem";
import { GameMilestone } from "./_components/ProgressBar";
import { GameTimer, GAME_SESSION_TIME } from './_components/GameTimer';

// Constants for game timer
const WARNING_TIME = 5 * 60; // 5 minutes warning

interface TimerDialog {
  isOpen: boolean;
  todoId: string;
  minutes: string;
}

function IndexPage() {
  const {
    todos,
    newTodo,
    newSubTodo,
    selectedTodoId,
    milestones,
    dialogs,
    addTodo,
    setNewTodo,
    addSubTodo,
    setNewSubTodo,
    toggleTodo,
    toggleSubTodo,
    toggleTodoExpansion,
    setSelectedTodoId,
    deleteTodo,
    setDeleteDialog,
    setGameDialog,
    setTimerDialog,
    setTimeUpDialog,
    updateMilestones,
    setTaskTimer,
    toggleTaskTimer,
    updateTaskTimer,
    getTodoProgress
  } = useStore();

  // Add timer interval ref
  const timerRef = useRef<number | undefined>(undefined);

  // Format time function
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Handle game timer with notifications
  useEffect(() => {
    if (dialogs.gameDialog?.timeRemaining === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      showNotification(
        "Time's Up!",
        { body: "Your gaming break has ended. Time to get back to work!" }
      );
      updateMilestones(dialogs.gameDialog.milestone.percentage);
      setGameDialog(null);
      return;
    }

    if (dialogs.gameDialog) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = window.setInterval(() => {
        setGameDialog((prev) => {
          if (!prev) return null;
          const newTime = prev.timeRemaining - 1;
          
          if (newTime === WARNING_TIME) {
            showNotification(
              "5 Minutes Remaining",
              { body: "Your gaming break will end in 5 minutes!" }
            );
          }
          
          return {
            ...prev,
            timeRemaining: newTime
          };
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [dialogs.gameDialog?.timeRemaining]);

  const handlePlayGame = (milestone: GameMilestone) => {
    const completionPercentage = todos.length === 0 
      ? 0 
      : todos.reduce((acc: number, todo: Todo) => acc + getTodoProgress(todo), 0) / todos.length;
      
    if (completionPercentage < milestone.percentage || milestone.game.used) return;
    
    setGameDialog({
      isOpen: true,
      milestone,
      timeRemaining: GAME_SESSION_TIME
    });
  };

  const handleGameEnd = () => {
    setTimeUpDialog({
      isOpen: true,
      message: "Time's up! Your gaming break has ended."
    });
  };

  const completionPercentage = todos.length === 0 
    ? 0 
    : todos.reduce((acc: number, todo: Todo) => acc + getTodoProgress(todo), 0) / todos.length;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Todo List</h1>
        
        {/* Progress Bar with Game Milestones */}
        <ProgressBar
          completionPercentage={completionPercentage}
          milestones={milestones}
          onPlayGame={handlePlayGame}
        />

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
          {todos.map((todo: Todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onToggleSubTodo={toggleSubTodo}
              onToggleExpansion={toggleTodoExpansion}
              onDelete={(type, todoId, subTodoId, title) => setDeleteDialog({
                isOpen: true,
                type,
                todoId,
                subTodoId,
                title: title || todo.text
              })}
              onAddSubTodo={addSubTodo}
              selectedTodoId={selectedTodoId}
              setSelectedTodoId={setSelectedTodoId}
              newSubTodo={newSubTodo}
              setNewSubTodo={setNewSubTodo}
              onSetTimer={(todoId) => setTimerDialog({ isOpen: true, todoId, minutes: '' })}
              onToggleTimer={toggleTaskTimer}
              onUpdateTimer={updateTaskTimer}
              isSelected={selectedTodoId === todo.id}
              onSelect={() => setSelectedTodoId(todo.id)}
              onTimerStart={() => setTimerDialog({ isOpen: true, todoId: todo.id, minutes: '' })}
            />
          ))}
          {todos.length === 0 && (
            <p className="text-center text-gray-500">No todos yet. Add one above!</p>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialogs
        deleteDialog={dialogs.deleteDialog}
        gameDialog={dialogs.gameDialog}
        timerDialog={dialogs.timerDialog}
        timeUpDialog={dialogs.timeUpDialog}
        onCloseDelete={() => setDeleteDialog(null)}
        onDelete={deleteTodo}
        onCloseGame={() => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          if (dialogs.gameDialog) {
            updateMilestones(dialogs.gameDialog.milestone.percentage);
          }
          setGameDialog(null);
        }}
        onEndGameEarly={() => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          if (dialogs.gameDialog) {
            updateMilestones(dialogs.gameDialog.milestone.percentage);
          }
          setGameDialog(null);
        }}
        onCloseTimer={() => setTimerDialog(null)}
        onSetTimer={setTaskTimer}
        onCloseTimeUp={() => setTimeUpDialog(null)}
        onTimerMinutesChange={(minutes) => setTimerDialog((prev: TimerDialog | null) => 
          prev ? { ...prev, minutes } : null
        )}
        formatTime={formatTime}
        WARNING_TIME={WARNING_TIME}
      />

      {/* Wake Lock */}
      <WakeLock
        isActive={!!dialogs.gameDialog}
        onWakeLockError={(error) => console.error('Wake Lock error:', error)}
      />

      {/* Notifications */}
      <Notifications
        onPermissionChange={(permission) => {
          if (permission !== 'granted') {
            console.warn('Notification permission not granted');
          }
        }}
      />

      <GameTimer gameDialog={dialogs.gameDialog} onGameEnd={handleGameEnd} />
    </main>
  );
}

export default IndexPage;