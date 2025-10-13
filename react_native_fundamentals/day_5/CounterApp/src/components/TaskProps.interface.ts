import { Task } from "src/types/task.entity";

export type TaskProps = {
    task: Task;
    onPress: (id: string) => void;
};