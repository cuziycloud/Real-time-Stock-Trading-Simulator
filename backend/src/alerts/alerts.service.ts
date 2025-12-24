import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlertCondition, PriceAlert } from './entities/price-alert.entity';
import { Repository } from 'typeorm';
import { TelegramService } from 'src/telegram/telegram.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UsersService } from 'src/users/users.service';
import { StockPriceDto } from 'src/orders/dto/market-update.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(PriceAlert)
    private alertRepo: Repository<PriceAlert>,
    private userService: UsersService,
    private telegramService: TelegramService, // Inject để dùng hàm gửi tin chủ động
  ) {}

  // Hàm tạo cảnh báo
  async createAlert(userId: number, dto: CreateAlertDto) {
    const user = await this.userService.findUserEntity(userId);
    if (!user) throw new NotFoundException('User không tồn tại');

    const newAlert = this.alertRepo.create({
      ...dto,
      user: user,
      isActive: true,
    });
    return await this.alertRepo.save(newAlert);
  }

  // Hàm lấy ds cảnh báo
  async getMyAlerts(userId: number) {
    return await this.alertRepo.find({
      where: { user: { id: userId }, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  // Hàm xóa cảnh báo
  async deleteAlert(userId: number, id: number) {
    return await this.alertRepo.delete({ id, user: { id: userId } });
  }

  // Hàm check cảnh báo
  async checkAlerts(marketData: StockPriceDto[]) {
    const activeAlerts = await this.alertRepo.find({
      where: { isActive: true },
      relations: ['user'], // để lấy telegramChatId
    });

    if (activeAlerts.length === 0) return;

    for (const alert of activeAlerts) {
      const stock = marketData.find((s) => s.symbol === alert.symbol);
      if (!stock) continue;

      let isTriggered = false;
      const currentPrice = stock.price; // Gtt
      const target = Number(alert.targetPrice); // Giá mong muốn

      if (alert.condition === AlertCondition.ABOVE && currentPrice >= target) {
        isTriggered = true; // Giá vượt ngưỡng
      } else if (
        alert.condition === AlertCondition.BELOW &&
        currentPrice <= target
      ) {
        isTriggered = true; // Giá chạm đáy
      }

      if (isTriggered) {
        // a. Gửi tin nhắn (ĐK: đã lk tele bot)
        if (alert.user.telegramChatId) {
          const icon = alert.condition === AlertCondition.ABOVE ? '📈' : '📉';
          const msg =
            `${icon} CẢNH BÁO GIÁ: ${alert.symbol}\n` +
            `Giá hiện tại: ${currentPrice}\n` +
            `Đã chạm ngưỡng ${alert.condition === AlertCondition.ABOVE ? 'tăng vượt' : 'giảm mạnh'} ${target}\n` +
            `Vào sàn ngay`;
          await this.telegramService.sendMsg(alert.user.telegramChatId, msg);
          console.log(
            `Đã gửi cảnh báo về ${alert.symbol} cho trader ${alert.user.id}`,
          );
        }

        // b. Tắt cảnh báo (ko là spam liên tục mỗi lần stock cập nhật)
        alert.isActive = false;
        await this.alertRepo.save(alert);
      }
    }
  }
}
