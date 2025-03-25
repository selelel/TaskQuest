import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Plus, Trash2, Timer } from "lucide-react";
import { KeyboardEvent, ChangeEvent } from "react";

// Create audio element for alarm sound
const alarmSound = new Audio('/alarm.mp3');
alarmSound.loop = true;

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  subTodos: SubTodo[];
  isExpanded: boolean;
  timer: {
    isRunning: boolean;
    totalSeconds: number;
    initialSeconds: number;
  };
}

export interface SubTodo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onToggleSubTodo: (todoId: string, subTodoId: string) => void;
  onToggleExpansion: (todoId: string) => void;
  onDelete: (type: 'todo' | 'subtodo', todoId: string, subTodoId?: string, title?: string) => void;
  onAddSubTodo: (todoId: string) => void;
  selectedTodoId: string | null;
  setSelectedTodoId: (id: string | null) => void;
  newSubTodo: string;
  setNewSubTodo: (text: string) => void;
  onSetTimer: (todoId: string) => void;
  onToggleTimer: (todoId: string) => void;
  onUpdateTimer: (todoId: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  onTimerStart: () => void;
}

export default function TodoItem({
  todo,
  onToggle,
  onToggleSubTodo,
  onToggleExpansion,
  onDelete,
  onAddSubTodo,
  selectedTodoId,
  setSelectedTodoId,
  newSubTodo,
  setNewSubTodo,
  onSetTimer,
  onToggleTimer,
  onUpdateTimer,
  isSelected,
  onSelect,
  onTimerStart
}: TodoItemProps) {
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (todo.timer.isRunning && todo.timer.totalSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        onUpdateTimer(todo.id);
        // Check if timer just reached zero
        if (todo.timer.totalSeconds === 1) {
          alarmSound.play().catch(error => console.error('Error playing alarm:', error));
        }
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        alarmSound.pause();
        alarmSound.currentTime = 0;
      };
    } else if (!todo.timer.isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      alarmSound.pause();
      alarmSound.currentTime = 0;
    }
  }, [todo.timer.isRunning, todo.id]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className={`p-4 border rounded-lg ${isSelected ? 'border-blue-500' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="h-4 w-4"
        />
        <span
          className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}
          onClick={onSelect}
        >
          {todo.text}
        </span>
        <div className="flex items-center gap-2">
          {todo.timer.totalSeconds > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleTimer(todo.id)}
              className={todo.timer.isRunning ? 'text-red-500' : 'text-green-500'}
            >
              {formatTime(todo.timer.totalSeconds)}
              {todo.timer.isRunning ? ' ⏸' : ' ▶'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onTimerStart}
          >
            <Timer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete('todo', todo.id, undefined, todo.text)}
            className="text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {todo.isExpanded && (
        <div className="mt-3 pl-6 space-y-2">
          {todo.subTodos.map(subTodo => (
            <div key={subTodo.id} className="flex items-center gap-3 group">
              <Checkbox
                checked={subTodo.completed}
                onCheckedChange={() => onToggleSubTodo(todo.id, subTodo.id)}
              />
              <span className={`flex-1 ${subTodo.completed ? 'line-through text-gray-400' : ''}`}>
                {subTodo.text}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete('subtodo', todo.id, subTodo.id)}
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
                onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onAddSubTodo(todo.id)}
                className="flex-1"
              />
              <Button onClick={() => onAddSubTodo(todo.id)}>
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
} 