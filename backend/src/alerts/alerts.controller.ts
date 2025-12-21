import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAlertDto } from './dto/create-alert.dto';
import { GetUser } from 'src/auth/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  create(@Body() dto: CreateAlertDto, @GetUser('id') userId: number) {
    return this.alertsService.createAlert(userId, dto);
  }

  @Get()
  findAll(@GetUser('id') userId: number) {
    return this.alertsService.getMyAlerts(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('id') userId: number) {
    return this.alertsService.deleteAlert(userId, +id);
  }
}
