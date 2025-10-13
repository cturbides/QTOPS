import { Task } from 'src/types/task.entity';

export const getInitialTasks = (): Task[] => ([
    { id: '1', title: 'Aprender React Native', completed: false },
    { id: '2', title: 'Configurar entorno', completed: true },
    { id: '3', title: 'Crear primera app', completed: false },
    { id: '4', title: 'Implementar navegación', completed: false },
    { id: '5', title: 'Agregar persistencia', completed: false },
]);
