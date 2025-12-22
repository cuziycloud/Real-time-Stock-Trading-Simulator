import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import { TradeStockDto } from './dto/trade-stock.dto';
import { Transaction } from './entities/transaction.entity';
import { MarketService } from 'src/market/market.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private marketService: MarketService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  async seedAdminUser() {
    const adminEmail = 'cloudz@stock.com';
    const adminExists = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const admin = this.userRepository.create({
        username: 'Cloudz Admin',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        balance: 9999999999,
        isActive: true,
        isBot: false,
      });

      // Lưu vào DB
      await this.userRepository.save(admin);
    }
  }

  async createMockUser() {
    const user = this.userRepository.create({
      username: 'Tran My Van',
      balance: 0,
    });
    return this.userRepository.save(user);
  }

  async buyStock(userId: number, dto: TradeStockDto) {
    const { symbol, quantity, price } = dto;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['portfolio'],
    });
    if (!user) throw new BadRequestException('User khong ton tai');

    const totalCost = quantity * price;

    if (user.balance < totalCost) {
      throw new BadRequestException(
        `Khong du so du! Can ${totalCost}, dang co ${user.balance}`,
      );
    }

    user.balance = Number(user.balance) - totalCost;
    await this.userRepository.save(user);
    let portfolioItem = await this.portfolioRepository.findOne({
      where: { user: { id: userId }, symbol: symbol },
    });

    if (portfolioItem) {
      portfolioItem.quantity += quantity;
    } else {
      portfolioItem = this.portfolioRepository.create({
        user: user,
        symbol: symbol,
        quantity: quantity,
        avgPrice: price,
      });
    }
    await this.portfolioRepository.save(portfolioItem);

    await this.transactionRepository.save({
      user: user,
      symbol: symbol,
      type: 'BUY',
      quantity: quantity,
      price: price,
      total: quantity * price,
      timestamp: new Date(), //Gan tay
    });

    return {
      status: 'Success',
      message: `Da mua ${quantity} co phieu ${symbol}`,
      currentBalance: user.balance,
      portfolio: portfolioItem,
    };
  }

  async findOne(id: number) {
    //tra ve balance + por hien co
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['portfolio'],
    });
    if (!user) throw new BadRequestException('User không tồn tại');

    return user;
  }

  async findUserEntity(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id },
    });
    if (!user) throw new BadRequestException('User khong ton tai');
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async sellStock(userId: number, dto: TradeStockDto) {
    const { symbol, quantity, price } = dto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['portfolio'],
    });

    if (!user) throw new BadRequestException('User khong ton tai');

    const portfolioItem = await this.portfolioRepository.findOne({
      where: {
        user: { id: userId },
        symbol: symbol,
      },
    });

    if (!portfolioItem)
      throw new BadRequestException(`Ban chua so huu ma ${symbol}`);

    if (portfolioItem.quantity < quantity)
      throw new BadRequestException(
        `So luong khong du. Ban co ${portfolioItem.quantity}, muon ban ${quantity}`,
      );

    const revenue = quantity * price;
    //
    const profitOrLoss = (price - Number(portfolioItem.avgPrice)) * quantity;
    console.log(`Gia trung binh: ${Number(portfolioItem.avgPrice)}`);
    console.log(`Giao dich nay ban lai/ lo: ${profitOrLoss}`);
    user.balance = Number(user.balance) + revenue;
    await this.userRepository.save(user);

    const remainingQuantity = portfolioItem.quantity - quantity;

    if (remainingQuantity === 0) {
      await this.portfolioRepository.remove(portfolioItem);
    } else {
      portfolioItem.quantity = remainingQuantity;
      await this.portfolioRepository.save(portfolioItem);
    }

    await this.transactionRepository.save({
      user: user,
      symbol: symbol,
      type: 'SELL',
      quantity: quantity,
      price: price,
      total: quantity * price,
      timestamp: new Date(),
    });

    return {
      status: 'SUCCESS',
      message: `Da ban thanh cong ${quantity} co phieu ${symbol}`,
      revenue: revenue,
      profit: profitOrLoss,
      currentBalance: user.balance,
      remainingStock: remainingQuantity,
    };
  }

  async getTradeHistory(userId: number) {
    return this.transactionRepository.find({
      where: {
        user: { id: userId },
      },
      order: { createdAt: 'DESC' }, //Latest
    });
  }

  async deposit(userId: number, amount: number) {
    if (amount <= 0)
      throw new BadRequestException('Số tiền nạp phải lớn hơn 0');

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new BadRequestException('Không tìm thấy user');

    // Cộng tiền
    user.balance = Number(user.balance) + amount;
    await this.userRepository.save(user);

    // Lưu lịch sử
    await this.transactionRepository.save({
      user: user,
      symbol: 'VND',
      type: 'DEPOSIT',
      price: amount,
      total: amount,
    });

    return { message: 'Nạp tiền thành công', newBalance: user.balance };
  }

  async withdraw(userId: number, amount: number) {
    if (amount <= 0)
      throw new BadRequestException('Số tiền rút phải lớn hơn 0');

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new BadRequestException('Không tìm thấy người dùng');

    if (Number(user.balance) < amount)
      throw new BadRequestException('Số dư không đủ');
    // Trừ tiền
    user.balance = Number(user.balance) - amount;
    await this.userRepository.save(user);

    // Lưu lịch sử
    await this.transactionRepository.save({
      user: user,
      symbol: 'VND',
      type: 'WITHDRAW',
      price: amount,
      total: amount,
    });

    return { message: 'Rút tiền thành công', newBalance: user.balance };
  }

  async getLeaderboard() {
    const users = await this.userRepository.find({ relations: ['portfolio'] });

    const currentPrices = this.marketService.getCurrentStocks();

    const leaderboard = users.map((user) => {
      let stockValue = 0;

      user.portfolio.forEach((item) => {
        const stock = currentPrices.find((s) => s.symbol === item.symbol);
        if (stock) {
          stockValue += Number(item.quantity) * stock.price;
        }
      });

      const totalNetWorth = Number(user.balance) + stockValue;

      return {
        id: user.id,
        username: this.maskUsername(user.username),
        totalNetWorth: totalNetWorth, // Tổng tài sản
      };
    });

    return leaderboard.sort((a, b) => b.totalNetWorth - a.totalNetWorth);
  }

  private maskUsername(username: string): string {
    if (username.length <= 3) return username;
    return username.substring(0, 2) + '***' + username.slice(-2);
  }

  async register(registerDto: RegisterDto) {
    const newUser = this.userRepository.create(registerDto);
    return this.userRepository.save(newUser);
  }

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email này đã tồn tại');
    }

    // 2. Mã hóa mật khẩu (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 3. Tạo User mới với mật khẩu đã băm
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return await this.userRepository.save(newUser);
  }

  async createBot(username: string) {
    const newBot = this.userRepository.create({
      username: username,
      email: `${username.toLowerCase()}@bot.com`,
      password: 'bot_pwd',
      isBot: true,
      balance: 0,
    });
    return this.userRepository.save(newBot);
  }

  // Tạo mã lk Tele
  async generateTelegramLinkCode(userId: number) {
    const code = Math.floor(10000 + Math.random() * 90000).toString();

    await this.userRepository.update(userId, { telegramLinkCode: code });

    return {
      link: `https://t.me/Cloudz_support_bot?start=${code}`, //deep linking
      code: code,
    };
  }

  // Hàm xử lý bot nhận được mã
  async linkTelegramAccount(linkCode: string, chatId: string) {
    const user = await this.userRepository.findOne({
      where: { telegramLinkCode: linkCode },
    });

    if (!user) return null; // Mã sai/ hết hạn

    user.telegramChatId = chatId;
    user.telegramLinkCode = '';
    return await this.userRepository.save(user);
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username: username },
    });
    if (!user) return null; // Không có us/ bot tên như vậy

    return user;
  }

  async findAllUsers() {
    return await this.userRepository.find({
      select: [
        'id',
        'username',
        'email',
        'balance',
        'isBot',
        'role',
        'createdAt',
        'isActive',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, isActive: boolean) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new BadRequestException('User không tồn tại');
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Không thể khóa tài khoản Admin');
    }
    await this.userRepository.update(id, { isActive });
    return { message: `User ${id} is now ${isActive ? 'Active' : 'Banned'}` };
  }

  async getSystemStats() {
    const totalUsers = await this.userRepository.count({
      where: {
        role: UserRole.USER,
        isBot: false,
      },
    });

    const totalBots = await this.userRepository.count({
      where: { isBot: true },
    });
    //console.log(totalUser);

    const result = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.USER })
      .andWhere('user.isBot = :isBot', { isBot: false })
      .select('SUM(user.balance)', 'totalMoney')
      .getRawOne<{ totalMoney: string }>();

    const rawTotalMoney = result ? result.totalMoney : '0';

    return {
      totalUsers,
      totalBots,
      totalMoney: Number(rawTotalMoney),
    };
  }
}
