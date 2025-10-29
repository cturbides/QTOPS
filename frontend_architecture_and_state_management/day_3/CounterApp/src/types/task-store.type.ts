import { Task } from "./task.type";

export interface TaskStore {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;

    addTask: (title: string, userId?: number) => void;
    toggleTask: (id: string) => void;
    removeTask: (id: string) => void;
    updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
    clearAllTasks: () => void;

    getTaskById: (id: string) => Task | undefined;
    getCompletedTasks: () => Task[];
    getPendingTasks: () => Task[];
    getTaskStats: () => { total: number; completed: number; pending: number };
}