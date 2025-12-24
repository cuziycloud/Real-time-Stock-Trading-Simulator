import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { ChatDto } from './dto/chat.dto';

@UseGuards(AuthGuard('jwt')) // Đăng nhập mới được chat
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() dto: ChatDto, @GetUser('id') userId: number) {
    return this.aiService.askAssistant(userId, dto.question);
  }
}
