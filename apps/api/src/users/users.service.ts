import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { GoogleProfile, UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  upsertGoogleUser(profile: GoogleProfile): Promise<User> {
    return this.usersRepository.upsertGoogleUser(profile);
  }
}
