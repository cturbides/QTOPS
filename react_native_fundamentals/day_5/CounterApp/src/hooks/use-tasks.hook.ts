import { Task } from 'src/types/task.entity';
import { useCallback, useMemo, useState } from 'react';
import { getInitialTasks } from 'src/helpers/get-initial-tasks.helper';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>(() => getInitialTasks());

    const toggle = useCallback((id: string) => {
        setTasks(prev =>
            prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
        );
    }, []);

    const data = useMemo(() => tasks, [tasks]);

    const keyExtractor = useCallback((item: Task) => item.id, []);

    return { data, toggle, keyExtractor };
}
