import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

export interface GoogleProfile {
  providerId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

const GOOGLE_PROVIDER = 'google';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  upsertGoogleUser(profile: GoogleProfile): Promise<User> {
    const { providerId, email, name, avatarUrl } = profile;

    return this.prisma.user.upsert({
      where: { providerId },
      update: { email, name, avatarUrl },
      create: {
        provider: GOOGLE_PROVIDER,
        providerId,
        email,
        name,
        avatarUrl,
      },
    });
  }
}
