import { User } from "src/types/user.type";

export type UserListProps = {
    users: User[];
    loading: boolean;
    error: string | null;
    onUserPress?: (userId: number) => void;
};