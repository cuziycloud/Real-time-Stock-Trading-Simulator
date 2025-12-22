import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order, OrderStatus, OrderType } from './entities/order.entity';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { BadRequestException } from '@nestjs/common';

// 1. Định nghĩa Type cho Mock
// Type cho Od Repository giả
type MockOrderRepository = {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
};

// Type cho UsersService giả
type MockUsersService = {
  findOne: jest.Mock;
  buyStock: jest.Mock;
  sellStock: jest.Mock;
};

// 2. Factory tạo Mock
const mockOrderRepo = (): MockOrderRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

const mockUsersService = (): MockUsersService => ({
  findOne: jest.fn(),
  buyStock: jest.fn(),
  sellStock: jest.fn(),
});

describe('OrdersService', () => {
  let service: OrdersService;

  // 3. Khai báo biến với Type chuẩn
  let orderRepository: MockOrderRepository;
  let usersService: MockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useFactory: mockOrderRepo },
        { provide: UsersService, useFactory: mockUsersService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);

    // Lấy ra và ép kiểu về Mock Type
    orderRepository = module.get(getRepositoryToken(Order));
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('placeOrder', () => {
    it('should throw error if user not found', async () => {
      // TypeScript hiểu mockResolvedValue vì type là MockUsersService
      usersService.findOne.mockResolvedValue(null);

      const dto: CreateOrderDto = {
        symbol: 'FPT',
        direction: OrderType.BUY,
        quantity: 10,
        targetPrice: 100,
      };

      await expect(service.placeOrder(99, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create PENDING order if user exists', async () => {
      const mockUser = { id: 1, username: 'TestUser' };
      usersService.findOne.mockResolvedValue(mockUser);

      const dto: CreateOrderDto = {
        symbol: 'VIC',
        direction: OrderType.SELL,
        quantity: 100,
        targetPrice: 50,
      };

      const createdOrder = {
        ...dto,
        id: 1,
        status: OrderStatus.PENDING,
        user: mockUser,
      };

      orderRepository.create.mockReturnValue(createdOrder); // sync
      orderRepository.save.mockResolvedValue(createdOrder); // async

      // Act
      const result = await service.placeOrder(1, dto);

      // Check
      expect(result.status).toEqual(OrderStatus.PENDING);
      expect(orderRepository.save).toHaveBeenCalled();
    });
  });

  describe('matchOrders', () => {
    it('should match BUY order when market price <= target price', async () => {
      const pendingOrder = {
        id: 1,
        symbol: 'VIC',
        direction: OrderType.BUY,
        quantity: 100,
        targetPrice: 20,
        status: OrderStatus.PENDING,
        user: { id: 1 },
      };

      orderRepository.find.mockResolvedValue([pendingOrder]);

      const marketData = [{ symbol: 'VIC', price: 19 }];

      // Act
      await service.matchOrders(marketData);

      // Check
      expect(usersService.buyStock).toHaveBeenCalledWith(1, {
        symbol: 'VIC',
        quantity: 100,
        price: 19,
      });

      expect(pendingOrder.status).toEqual(OrderStatus.MATCHED);
      expect(orderRepository.save).toHaveBeenCalledWith(pendingOrder);
    });

    it('should NOT match if price conditions are not met', async () => {
      const pendingOrder = {
        id: 1,
        symbol: 'VIC',
        direction: OrderType.SELL,
        targetPrice: 20,
        status: OrderStatus.PENDING,
        user: { id: 1 },
      };
      orderRepository.find.mockResolvedValue([pendingOrder]);

      const marketData = [{ symbol: 'VIC', price: 15 }]; // Giá thấp hơn -> ko bán

      await service.matchOrders(marketData);

      expect(usersService.sellStock).not.toHaveBeenCalled();
      expect(orderRepository.save).not.toHaveBeenCalled();
    });
  });
});
