import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AdminDashboardStats,
  AdminJobItem,
  AdminService,
  AdminStorageStats,
  AdminUserItem,
} from './admin.service';
import { AdminJobsQueryDto } from './dto/admin-jobs-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';

/** Seluruh endpoint admin wajib login + role ADMIN (docs/07 — Admin). */
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard(): Promise<AdminDashboardStats> {
    return this.adminService.getDashboard();
  }

  @Get('jobs')
  getJobs(@Query() query: AdminJobsQueryDto): Promise<AdminJobItem[]> {
    return this.adminService.getJobs(query);
  }

  @Get('storage')
  getStorage(): Promise<AdminStorageStats> {
    return this.adminService.getStorage();
  }

  @Get('users')
  getUsers(@Query() query: AdminUsersQueryDto): Promise<AdminUserItem[]> {
    return this.adminService.getUsers(query);
  }
}
