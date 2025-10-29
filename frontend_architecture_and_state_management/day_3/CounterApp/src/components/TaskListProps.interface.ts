import { Task } from "src/types/task.type";

export type TaskListProps = {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    onTaskPress?: (taskId: string) => void;
};
