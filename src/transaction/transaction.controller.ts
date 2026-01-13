import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionRes } from './dto/response-transaction.dto';
import { plainToInstance } from 'class-transformer';
import { Transaction } from './transaction.entity';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<TransactionRes> {
    const transaction = await this.transactionService.create(createTransactionDto);
    return plainToInstance(TransactionRes, transaction, { excludeExtraneousValues: true });
  }

  @Get()
  async findAll(): Promise<TransactionRes[]> {
    const transactions = await this.transactionService.findAll();
    return transactions.map(transaction => 
      plainToInstance(TransactionRes, transaction, { excludeExtraneousValues: true })
    );
  }

  @Get('paginated')
  async findPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ data: TransactionRes[]; currentPage: number; totalPages: number; totalRecords: number }> {
    const result = await this.transactionService.findPaginated(page, limit);
    return {
      data: result.data.map(transaction => 
        plainToInstance(TransactionRes, transaction, { excludeExtraneousValues: true })
      ),
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalRecords: result.totalRecords
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TransactionRes> {
    return await this.transactionService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionRes> {
    return await this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.transactionService.remove(id);
  }
}