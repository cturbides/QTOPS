export interface CreateUserRequest {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}
