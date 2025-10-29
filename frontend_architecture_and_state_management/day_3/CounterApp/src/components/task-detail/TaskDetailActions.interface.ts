import { Task } from 'src/types/task.type';

export interface TaskDetailActionsProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}
