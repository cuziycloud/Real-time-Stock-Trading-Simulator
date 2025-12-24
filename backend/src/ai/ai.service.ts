import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Groq } from 'groq-sdk';
import { UsersService } from 'src/users/users.service';
import { StocksService } from 'src/stocks/stocks.service';
import { User } from 'src/users/entities/user.entity';
import { Stock } from 'src/stocks/entities/stock.entity';
import {
  mapUserForAI,
  mapMarketForAI,
  EnrichedStockData,
} from './utils/ai-data.mapper';
import { SYSTEM_PROMPT_TEMPLATE } from './prompts/financial-advisor.prompt';

@Injectable()
export class AiService {
  private groq: Groq;
  private modelName: string;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private stocksService: StocksService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.getOrThrow<string>('GROQ_API_KEY'),
    });
    this.modelName =
      this.configService.get<string>('GROQ_MODEL') || 'llama3-70b-8192';
  }

  async askAssistant(userId: number, question: string) {
    // 1. Dl thô
    const userRaw: User = await this.usersService.findOne(userId); // Th tin user
    const stocks: Stock[] = this.stocksService.getRealtimePrices(); // Th tin các cổ phiếu hiện tại
    const enrichedMarketData: EnrichedStockData[] = await Promise.all(
      stocks.map(async (stock) => {
        const candles = await this.stocksService.getRecentCandles(
          stock.symbol,
          5,
        );

        // Trả về object khớp với interface EnrichedStockData
        return {
          stock: stock,
          candles: candles,
        };
      }),
    );

    // 2. Chuyển đổi dl (TypeScript sẽ tự check userRaw có khớp với User Entity ko)
    const cleanUserData = mapUserForAI(userRaw);
    const cleanMarketData = mapMarketForAI(enrichedMarketData);

    // 3. Ghép vào Prompt Template
    const finalSystemPrompt = SYSTEM_PROMPT_TEMPLATE.replace(
      '{MARKET_DATA}',
      JSON.stringify(cleanMarketData),
    ).replace('{USER_DATA}', JSON.stringify(cleanUserData));

    try {
      console.log(`User ${userId} hỏi AI...`);

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: finalSystemPrompt }, // kịch bản + dl
          { role: 'user', content: question },
        ],
        model: this.modelName,
        temperature: 0.7,
        max_tokens: 800,
      });

      const answer =
        chatCompletion.choices[0]?.message?.content || 'AI đang suy nghĩ...';

      return { answer };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log('Lỗi Groq AI:', errorMessage);
      return {
        answer: 'Thị trường đang quá biến động, tôi cần nghỉ ngơi 1 chút',
      };
    }
  }
}
