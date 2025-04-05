import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarTodo, RecurrenceType } from './types';
import useCalendarStore from './store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { Plus, Trash2, Calendar as CalendarIcon, Clock, Repeat } from "lucide-react";

export default function CalendarScheduler() {
  const {
    currentDate,
    selectedDate,
    todos,
    view,
    setCurrentDate,
    setSelectedDate,
    setView,
    addTodo,
    toggleTodoComplete,
    deleteTodo
  } = useCalendarStore();

  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    recurrenceType: 'custom' as RecurrenceType,
    daysOfWeek: [] as number[]
  });

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getTodosForDate = (date: Date) => {
    return todos.filter(todo => {
      if (isSameDay(todo.date, date)) return true;
      if (todo.recurrenceType === 'daily') return true;
      if (todo.recurrenceType === 'weekly' && todo.recurrencePattern?.daysOfWeek?.includes(date.getDay())) return true;
      if (todo.recurrenceType === 'custom' && todo.recurrencePattern?.customDays?.includes(date.getDate())) return true;
      return false;
    });
  };

  const handleAddTodo = () => {
    if (!newTodo.title || !selectedDate) return;

    addTodo({
      title: newTodo.title,
      description: newTodo.description,
      date: selectedDate,
      recurrenceType: newTodo.recurrenceType,
      recurrencePattern: {
        daysOfWeek: newTodo.recurrenceType === 'weekly' ? newTodo.daysOfWeek : undefined,
        customDays: newTodo.recurrenceType === 'custom' ? [selectedDate.getDate()] : undefined
      },
      completed: false
    });

    setNewTodo({
      title: '',
      description: '',
      recurrenceType: 'custom',
      daysOfWeek: []
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar Scheduler</h1>
          <div className="flex gap-2">
            <Select value={view} onValueChange={(value: 'month' | 'week' | 'day') => setView(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg border p-4">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md"
            />
          </div>

          <div className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Todo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Todo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Todo title"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    className="border-gray-300"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    className="border-gray-300"
                  />
                  <Select
                    value={newTodo.recurrenceType}
                    onValueChange={(value: RecurrenceType) => setNewTodo({ ...newTodo, recurrenceType: value })}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>

                  {newTodo.recurrenceType === 'weekly' && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Select days of the week:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                              id={day}
                              checked={newTodo.daysOfWeek.includes(index)}
                              onCheckedChange={(checked) => {
                                const newDays = checked
                                  ? [...newTodo.daysOfWeek, index]
                                  : newTodo.daysOfWeek.filter(d => d !== index);
                                setNewTodo({ ...newTodo, daysOfWeek: newDays });
                              }}
                            />
                            <label htmlFor={day} className="text-sm">{day}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleAddTodo} className="w-full bg-blue-600 hover:bg-blue-700">
                    Add Todo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
              </h2>
              <div className="space-y-2">
                {selectedDate && getTodosForDate(selectedDate).map(todo => (
                  <div key={todo.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={() => toggleTodoComplete(todo.id)}
                        className="h-5 w-5"
                      />
                      <div>
                        <span className={`block ${todo.completed ? 'line-through text-gray-500' : 'font-medium'}`}>
                          {todo.title}
                        </span>
                        {todo.description && (
                          <span className="text-sm text-gray-500 block mt-1">{todo.description}</span>
                        )}
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Repeat className="h-3 w-3 mr-1" />
                          <span className="capitalize">{todo.recurrenceType}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {selectedDate && getTodosForDate(selectedDate).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No todos for this date
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
