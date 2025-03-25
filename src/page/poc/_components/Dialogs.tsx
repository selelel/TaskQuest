import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Gamepad2, Trophy } from "lucide-react";
import { GameMilestone } from "./ProgressBar";

interface DialogsProps {
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
  onCloseDelete: () => void;
  onDelete: () => void;
  onCloseGame: () => void;
  onEndGameEarly: () => void;
  onCloseTimer: () => void;
  onSetTimer: (todoId: string, minutes: number) => void;
  onCloseTimeUp: () => void;
  onTimerMinutesChange: (minutes: string) => void;
  formatTime: (seconds: number) => string;
  WARNING_TIME: number;
}

export function Dialogs({
  deleteDialog,
  gameDialog,
  timerDialog,
  timeUpDialog,
  onCloseDelete,
  onDelete,
  onCloseGame,
  onEndGameEarly,
  onCloseTimer,
  onSetTimer,
  onCloseTimeUp,
  onTimerMinutesChange,
  formatTime,
  WARNING_TIME
}: DialogsProps) {
  return (
    <>
      {/* Delete Dialog */}
      <Dialog open={deleteDialog?.isOpen} onOpenChange={(open: boolean) => !open && onCloseDelete()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteDialog?.title}</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              {deleteDialog?.type === 'todo' ? ' task and all its sub-tasks' : ' sub-task'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Game Dialog */}
      <Dialog 
        open={gameDialog?.isOpen} 
        onOpenChange={(open: boolean) => !open && onCloseGame()}
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
                    width: `${((gameDialog?.timeRemaining ?? 0) / (30 * 60)) * 100}%`,
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
              onClick={onEndGameEarly}
            >
              End Session Early
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Timer Setting Dialog */}
      <Dialog 
        open={timerDialog?.isOpen} 
        onOpenChange={(open) => !open && onCloseTimer()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Task Timer</DialogTitle>
            <DialogDescription>
              Enter the number of minutes for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Minutes"
              value={timerDialog?.minutes}
              onChange={(e) => onTimerMinutesChange(e.target.value)}
              min="1"
              max="180"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseTimer}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (timerDialog && timerDialog.minutes) {
                  onSetTimer(timerDialog.todoId, parseInt(timerDialog.minutes));
                }
              }}
              disabled={!timerDialog?.minutes}
            >
              Set Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Up Dialog */}
      <Dialog 
        open={timeUpDialog?.isOpen} 
        onOpenChange={(open) => !open && onCloseTimeUp()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ⏰ Time's Up!
            </DialogTitle>
            <DialogDescription>
              The timer for task "{timeUpDialog?.message}" has finished.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onCloseTimeUp}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 