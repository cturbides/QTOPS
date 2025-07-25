import { Request, Response } from 'express';
import { UserApplicationService, CreateUserRequest } from '@application/index';

export class UserController {
    constructor(private readonly userService: UserApplicationService) { }

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            console.log('Creating user with data:', req.body, 'and trace ID:', req.correlationId);

            const dto: CreateUserRequest = req.body;
            const user = await this.userService.createUser(dto);
            res.success(user, 'User created successfully');
        } catch (error) {
            res.error('Failed to create user', 500, error);
        }
    }

    async getUser(req: Request, res: Response): Promise<void> {
        try {
            console.log('Getting user with ID:', req.params.id, 'and trace ID:', req.correlationId);

            const id = req.params.id;
            const user = await this.userService.getUserById(id);

            if (!user) {
                res.error('User not found', 404);
                return;
            }

            res.success(user, 'User retrieved successfully');
        } catch (error) {
            res.error('Error retrieving user', 500, error);
        }
    }
}
