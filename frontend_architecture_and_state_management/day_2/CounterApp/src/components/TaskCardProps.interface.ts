import { Task } from "src/types/task.type";

export type TaskCardProps = {
    task: Task;
    onPress?: () => void;
};
