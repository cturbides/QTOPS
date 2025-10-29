import { create } from 'zustand';
import { Task } from 'src/types/task.type';
import { TaskStore } from 'src/types/task-store.type';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,

      // Actions
      addTask: (title: string, userId: number = 1) =>
        set((state) => {
          const newTask: Task = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title,
            completed: false,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            tasks: [...state.tasks, newTask],
            error: null,
          };
        }),

      toggleTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
          error: null,
        })),

      removeTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          error: null,
        })),

      updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
          error: null,
        })),

      clearAllTasks: () =>
        set(() => ({
          tasks: [],
          error: null,
        })),

      getTaskById: (id: string) => {
        return get().tasks.find((task) => task.id === id);
      },

      getCompletedTasks: () => {
        return get().tasks.filter((task) => task.completed);
      },

      getPendingTasks: () => {
        return get().tasks.filter((task) => !task.completed);
      },

      getTaskStats: () => {
        const tasks = get().tasks;
        const completed = tasks.filter((task) => task.completed).length;
        return {
          total: tasks.length,
          completed,
          pending: tasks.length - completed,
        };
      },
    }),
    {
      name: 'task-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);
