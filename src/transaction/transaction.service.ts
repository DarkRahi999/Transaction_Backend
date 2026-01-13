import { Injectable } from '@nestjs/common';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionRes } from './dto/response-transaction.dto';
import { TransactionType } from '../utils/enums';
import { plainToInstance } from 'class-transformer';
import { SummaryResponseDto } from './dto/summary-response.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: EntityRepository<Transaction>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(createTransactionDto: CreateTransactionDto): Promise<TransactionRes> {
    const transaction = new Transaction();
    transaction.amount = createTransactionDto.amount;
    transaction.type = createTransactionDto.type;
    transaction.category = createTransactionDto.category;
    transaction.description = createTransactionDto.description;
    transaction.transactionDate = createTransactionDto.transactionDate 
      ? new Date(createTransactionDto.transactionDate) 
      : new Date();
    
    // Calculate balance based on previous transactions
    const balance = await this.calculateBalance();
    transaction.balance = createTransactionDto.type === TransactionType.INCOME 
      ? balance + transaction.amount 
      : balance - transaction.amount;

    this.entityManager.persist(transaction);
    await this.entityManager.flush();
    
    // Convert to response DTO
    return plainToInstance(TransactionRes, transaction, { excludeExtraneousValues: true });
  }

  async findAll(): Promise<TransactionRes[]> {
    const transactions = await this.transactionRepository.findAll({
      orderBy: { transactionDate: 'DESC' },
      limit: 50
    });
    
    // Convert to response DTOs
    return transactions.map(transaction => 
      plainToInstance(TransactionRes, transaction, { excludeExtraneousValues: true })
    );
  }

  async findOne(id: number): Promise<TransactionRes> {
    const transaction = await this.transactionRepository.findOneOrFail({ id });
    
    // Convert to response DTO
    return plainToInstance(TransactionRes, transaction, { excludeExtraneousValues: true });
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<TransactionRes> {
    const transaction = await this.transactionRepository.findOneOrFail({ id });
    
    // Manually assign properties
    if (updateTransactionDto.amount !== undefined) {
      transaction.amount = updateTransactionDto.amount;
    }
    
    if (updateTransactionDto.type !== undefined) {
      transaction.type = updateTransactionDto.type;
    }
    
    if (updateTransactionDto.category !== undefined) {
      transaction.category = updateTransactionDto.category;
    }
    
    if (updateTransactionDto.description !== undefined) {
      transaction.description = updateTransactionDto.description;
    }
    
    if (updateTransactionDto.transactionDate !== undefined) {
      transaction.transactionDate = new Date(updateTransactionDto.transactionDate);
    }
    
    // Recalculate balance for all transactions after this date
    await this.recalculateBalances(transaction.transactionDate);
    
    await this.entityManager.flush();
    
    // Convert to response DTO
    return plainToInstance(TransactionRes, transaction, { excludeExtraneousValues: true });
  }

  async remove(id: number): Promise<void> {
    const transaction = await this.transactionRepository.findOneOrFail({ id });
    this.entityManager.remove(transaction);
    await this.entityManager.flush();
    // Recalculate balances after deletion
    await this.recalculateBalances(transaction.transactionDate);
  }

  private async calculateBalance(): Promise<number> {
    const latestTransaction = await this.transactionRepository.find(
      {},
      {
        orderBy: { transactionDate: 'DESC' },
        limit: 1,
      },
    );
    
    return latestTransaction.length > 0 ? latestTransaction[0].balance || 0 : 0;
  }

  private async recalculateBalances(fromDate?: Date): Promise<void> {
    // Get all transactions ordered by date
    const allTransactions = await this.transactionRepository.findAll({
      orderBy: { transactionDate: 'ASC' },
    });
    
    let runningBalance = 0;
    
    // Recalculate balance for each transaction
    for (const transaction of allTransactions) {
      runningBalance = transaction.type === TransactionType.INCOME 
        ? runningBalance + transaction.amount 
        : runningBalance - transaction.amount;
      transaction.balance = runningBalance;
    }
    
    // Persist all changes
    await this.entityManager.flush();
  }

  async findPaginated(page: number = 1, limit: number = 10): Promise<{ 
    data: Transaction[]; 
    currentPage: number; 
    totalPages: number; 
    totalRecords: number 
  }> {
    // Ensure limit is between 1 and 100
    limit = Math.min(Math.max(limit, 1), 100);
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Get total count
    const totalRecords = await this.transactionRepository.count({});
    
    // Get paginated data
    const data = await this.transactionRepository.find(
      {},
      {
        orderBy: { transactionDate: 'DESC' },
        limit,
        offset,
      },
    );
    
    // Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);
    
    return {
      data,
      currentPage: page,
      totalPages,
      totalRecords,
    };
  }

  async getMonthlySummary(): Promise<SummaryResponseDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthlyTransactions = await this.transactionRepository.find({
      transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
    });
    
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    
    for (const transaction of monthlyTransactions) {
      if (transaction.type === TransactionType.INCOME) {
        monthlyIncome += transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        monthlyExpense += transaction.amount;
      }
    }
    
    // Get current balance from the last transaction
    const currentBalance = await this.calculateBalance();
    
    return {
      monthlyIncome,
      monthlyExpense,
      currentBalance,
    };
  }

  async getYearlySummary(): Promise<SummaryResponseDto> {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    
    const yearlyTransactions = await this.transactionRepository.find({
      transactionDate: { $gte: startOfYear, $lte: endOfYear },
    });
    
    let yearlyIncome = 0;
    let yearlyExpense = 0;
    
    for (const transaction of yearlyTransactions) {
      if (transaction.type === TransactionType.INCOME) {
        yearlyIncome += transaction.amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        yearlyExpense += transaction.amount;
      }
    }
    
    // Get current balance from the last transaction
    const currentBalance = await this.calculateBalance();
    
    return {
      yearlyIncome,
      yearlyExpense,
      currentBalance,
    };
  }
}