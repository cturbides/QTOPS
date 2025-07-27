import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@users/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from '@users/dto/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async updateProfile(email: string, dto: UpdateProfileDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        if (dto.name) {
            user.name = dto.name;
        }

        if (dto.password) {
            user.password = await bcrypt.hash(dto.password, 10);
        }

        return this.userRepository.save(user);
    }
}
