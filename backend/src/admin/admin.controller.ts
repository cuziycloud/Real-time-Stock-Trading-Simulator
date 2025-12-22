import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
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

  // 3. Xem thống kê
  @Get('stats')
  async getStats() {
    return await this.usersService.getSystemStats();
  }

  @Post('create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }
}
