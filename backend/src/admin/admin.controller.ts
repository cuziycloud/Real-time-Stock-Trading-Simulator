import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@UseGuards(AuthGuard('jwt'), RolesGuard) // Đăng nhập + đúng role
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  // 1. Xem all user (- admin)
  @Get('users')
  async getAllUsers() {
    return await this.usersService.findAllUsers();
  }

  // 2. Ban/ Unban user
  @Patch('users/:id/ban')
  async banUser(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return await this.usersService.updateStatus(+id, isActive);
  }
}
