import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PriceAlert, AlertCondition } from './entities/price-alert.entity';
import { TelegramService } from '../telegram/telegram.service';
import { UsersService } from '../users/users.service';
import { NotFoundException } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';

// 1. ĐỊNH NGHĨA TYPE CHO MOCK
type MockRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  delete: jest.Mock;
};

// TelegramService
type MockTelegramService = {
  sendMsg: jest.Mock;
};

// UserService
type MockUsersService = {
  findUserEntity: jest.Mock;
};

// 2. FACTORY TẠO MOCK OBJECT
const mockAlertRepo = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
});

const mockTelegramService = (): MockTelegramService => ({
  sendMsg: jest.fn(),
});

const mockUsersService = (): MockUsersService => ({
  findUserEntity: jest.fn(),
});

describe('AlertsService', () => {
  let service: AlertsService;
  let alertRepository: MockRepository;
  let telegramService: MockTelegramService;
  let usersService: MockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        // Inject các Mock
        { provide: getRepositoryToken(PriceAlert), useFactory: mockAlertRepo },
        { provide: TelegramService, useFactory: mockTelegramService },
        { provide: UsersService, useFactory: mockUsersService },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    alertRepository = module.get(getRepositoryToken(PriceAlert));
    telegramService = module.get(TelegramService);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAlert', () => {
    it('should create alert if user exists', async () => {
      // 1. Arrange
      const userId = 1;
      const dto: CreateAlertDto = {
        symbol: 'FPT',
        targetPrice: 100,
        condition: AlertCondition.ABOVE,
      };

      const mockUser = { id: 1, username: 'TestUser' };
      // Giả lập tìm user
      usersService.findUserEntity.mockResolvedValue(mockUser);

      const createdAlert = { ...dto, id: 1, isActive: true, user: mockUser };
      alertRepository.create.mockReturnValue(createdAlert);
      alertRepository.save.mockResolvedValue(createdAlert);

      // 2. Act
      const result = await service.createAlert(userId, dto);

      // 3. Assert
      expect(usersService.findUserEntity).toHaveBeenCalledWith(userId);
      expect(alertRepository.save).toHaveBeenCalled();
      expect(result).toEqual(createdAlert);
    });

    it('should throw error if user not found', async () => {
      // Giả lập tìm user bị lỗi NotFound
      usersService.findUserEntity.mockRejectedValue(new NotFoundException());

      const dto: CreateAlertDto = {
        symbol: 'A',
        targetPrice: 1,
        condition: AlertCondition.ABOVE,
      };

      await expect(service.createAlert(99, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkAlerts', () => {
    it('should send telegram message when price matches condition (ABOVE)', async () => {
      // 1. ARRANGE
      // Giả lập trong DB có 1 cảnh báo đang chờ: VIC >= 50
      const activeAlert = {
        id: 1,
        symbol: 'VIC',
        targetPrice: 50,
        condition: AlertCondition.ABOVE,
        isActive: true,
        user: { id: 1, telegramChatId: '123456' }, // User đã kết nối Tele
      };

      alertRepository.find.mockResolvedValue([activeAlert]);

      // Giả lập thị trường: VIC giá 51 (Đã vượt 50 -> Kích hoạt)
      const marketData = [{ symbol: 'VIC', price: 51 }];

      // 2. ACT
      await service.checkAlerts(marketData);

      // 3. ASSERT
      // A. Kiểm tra xem Bot có được gọi để gửi tin ko?
      expect(telegramService.sendMsg).toHaveBeenCalledWith(
        '123456', // chatId
        expect.stringContaining('CẢNH BÁO GIÁ: VIC'), // Nd tn phải chứa tên mã
      );

      // B. Kiểm tra xem Alert có bị tắt (isActive = false) và lưu lại không?
      expect(activeAlert.isActive).toBe(false); // Biến gốc bị thay đổi
      expect(alertRepository.save).toHaveBeenCalledWith(activeAlert);
    });

    it('should NOT send message if price condition not met', async () => {
      // 1. Vẫn cảnh báo VIC >= 50
      const activeAlert = {
        id: 1,
        symbol: 'VIC',
        targetPrice: 50,
        condition: AlertCondition.ABOVE,
        isActive: true,
        user: { telegramChatId: '123' },
      };
      alertRepository.find.mockResolvedValue([activeAlert]);

      // 2. Nhưng gtt mới 40 (Chưa tới)
      const marketData = [{ symbol: 'VIC', price: 40 }];

      // 3. Act
      await service.checkAlerts(marketData);

      // 4. Assert
      expect(telegramService.sendMsg).not.toHaveBeenCalled(); // Không được gửi tin
      expect(alertRepository.save).not.toHaveBeenCalled(); // Không được update DB
    });
  });
});
