import { Test, TestingModule } from '@nestjs/testing'; // Nestjs giả lập
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Portfolio } from './entities/portfolio.entity';
import { Transaction } from './entities/transaction.entity';
import { BadRequestException } from '@nestjs/common';
import { MarketService } from '../market/market.service';

// 1. Định nghĩa Type cho Mock Repository
// Nó bảo rằng: "Biến này sẽ có các hàm findOne, save... và chúng là Jest Mock"
type MockRepository = {
  findOne: jest.Mock;
  save: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
};

// Repository giả
const mockRepository = (): MockRepository => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
});

const mockMarketService = () => ({
  getCurrentPrices: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;

  // 2. Khai báo biến với Type chuẩn
  let userRepository: MockRepository;
  let transactionRepository: MockRepository;

  // Tạo môi trường giả
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockRepository },
        { provide: getRepositoryToken(Portfolio), useFactory: mockRepository },
        {
          provide: getRepositoryToken(Transaction),
          useFactory: mockRepository,
        },
        { provide: MarketService, useFactory: mockMarketService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // 3. Lấy Mock ra và ép kiểu về MockRepository để TypeScript hiểu
    userRepository = module.get(getRepositoryToken(User));
    transactionRepository = module.get(getRepositoryToken(Transaction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('withdraw', () => {
    // Test case 1: Rút thành công
    it('should withdraw money successfully', async () => {
      // Cbi dl
      const userId = 1;
      const amountToWithdraw = 50000;
      const mockUser = { id: 1, balance: 100000 };

      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, balance: 50000 });

      // Act
      const result = await service.withdraw(userId, amountToWithdraw);

      // Assert
      expect(mockUser.balance).toEqual(50000);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Rút tiền thành công',
        newBalance: 50000,
      });
    });

    // Test case 2: Không đủ tiền
    it('should throw error if balance is insufficient', async () => {
      const mockUser = { id: 1, balance: 10000 };
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.withdraw(1, 50000)).rejects.toThrow(
        BadRequestException,
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    // Test case 3: Số tiền âm
    it('should throw error if amount <= 0', async () => {
      await expect(service.withdraw(1, -100)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deposit', () => {
    // Test case 1: Nạp thành công (Happy Path)
    it('should deposit money successfully', async () => {
      // 1. Cbi dl
      const userId = 1;
      const amountToDeposit = 100000;
      const mockUser = { id: 1, balance: 50000, username: 'Test User' };

      // Kịch bản dựng trước
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({ ...mockUser, balance: 150000 });
      transactionRepository.save.mockResolvedValue({}); // Giả lập lưu lịch sử thành công

      // 2. Chạy hàm (Act)
      const result = await service.deposit(userId, amountToDeposit);

      // 3. Kiểm tra kết quả (Assert)

      // Kiểm tra logic cộng tiền: 50k gốc + 100k nạp = 150k
      expect(mockUser.balance).toEqual(150000);

      // Kiểm tra dl lưu
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          balance: 150000,
        }),
      );

      // Logic đúng: phải gọi save lưu db
      expect(userRepository.save).toHaveBeenCalled();

      // Kiểm tra xem có lưu lịch sử giao dịch (Transaction) không
      expect(transactionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DEPOSIT',
          symbol: 'VND',
          total: amountToDeposit,
        }),
      );

      // Kiểm tra giá trị trả về của hàm
      expect(result).toEqual({
        message: 'Nạp tiền thành công',
        newBalance: 150000, // Expected result
      });
    });

    // Test case 2: Lỗi nạp số tiền âm hoặc bằng 0
    it('should throw error if deposit amount is <= 0', async () => {
      // Kịch bản: Số tiền nạp không hợp lệ => ném lỗi
      const invalidAmount = -50000;

      await expect(service.deposit(1, invalidAmount)).rejects.toThrow(
        BadRequestException,
      );

      // Logic sai: ko được gọi save lưu db
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    // Test case 3: Lỗi không tìm thấy User
    it('should throw error if user not found during deposit', async () => {
      // Kịch bản: Tìm user nhưng trả về null => ném lỗi
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.deposit(999, 100000)).rejects.toThrow(
        BadRequestException,
      );

      // Logic sai: ko được gọi save lưu db
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
