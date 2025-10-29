export interface UserViewModel {
    id: string;
    name: string;
    email: string;
    displayName: string; // Nombre formateado para UI
}

export interface UserListViewModel {
    users: UserViewModel[];
    total: number;
    isEmpty: boolean;
}

export interface ErrorViewModel {
    code?: string;
    message: string;
    type: 'validation' | 'notFound' | 'server' | 'unknown';
}
