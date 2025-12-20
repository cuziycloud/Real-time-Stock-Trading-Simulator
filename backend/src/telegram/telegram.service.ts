import { Injectable } from '@nestjs/common';
import { Ctx, Start, Update } from 'nestjs-telegraf';
import { UsersService } from 'src/users/users.service';
import { Context } from 'telegraf';

@Update() // Xử lý update từ tele
@Injectable()
export class TelegramService {
  constructor(private readonly usersService: UsersService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    // a. Ktra có tin nhắn và thuộc tính text trong tn ko
    if (!ctx.message || !('text' in ctx.message)) {
      return;
    }

    // b. Có text
    // 1. Lấy nd tin nhắn
    const text = ctx.message.text; /// start 123456
    const chatId = ctx.chat?.id.toString();
    const userName = ctx.from?.first_name || 'Người dùng';

    if (!chatId) return;

    console.log(`Bot đã nhận: ${text} từ chat: ${chatId}`);

    // 2. Tách lấy mã code (sau /start)
    const args = text.split(' ');
    const code = args[1];

    if (!code) {
      await ctx.reply(`Xin chào ${userName}, vui lòng kết nối từ website`);
      return;
    }

    const user = await this.usersService.linkTelegramAccount(code, chatId);

    if (user) {
      await ctx.reply(
        `Kết nối thành công. Xin chào ${userName} nhé. \nTừ giờ mình sẽ báo giá cho bạn`,
      );
    } else {
      await ctx.reply(`Mã kết nối không hợp lệ hoặc hết hạn`);
    }
  }
}
