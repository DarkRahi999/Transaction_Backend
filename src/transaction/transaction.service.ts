import { Injectable } from '@nestjs/common';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionRes } from './dto/response-transaction.dto';
import { TransactionType } from '../utils/enums';
import { wrap } from '@mikro-orm/core';
import { plainToInstance } from 'class-transformer';

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

  async getSummary(): Promise<any> {
    const transactions = await this.findAll();
    
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    const currentBalance = transactions.length > 0 
      ? transactions[0].balance || 0 
      : 0;
      
    return {
      totalIncome,
      totalExpense,
      currentBalance,
      netBalance: totalIncome - totalExpense,
    };
  }

  async getDailySummary(date: string): Promise<any> {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const transactions = await this.transactionRepository.find({
      transactionDate: {
        $gte: targetDate,
        $lt: nextDay,
      },
    });
    
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      date,
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description,
      })),
    };
  }

  async getMonthlySummary(year: number, month: number): Promise<any> {
    // Create start date (first day of the month)
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS Date
    
    // Create end date (first day of next month)
    const endDate = new Date(year, month, 1);
    
    const transactions = await this.transactionRepository.find({
      transactionDate: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    // Get month name for display
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return {
      month: monthNames[month - 1],
      year,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
  }

  async getYearlySummary(year: number): Promise<any> {
    // Create start date (January 1st of the year)
    const startDate = new Date(year, 0, 1);
    
    // Create end date (January 1st of next year)
    const endDate = new Date(year + 1, 0, 1);
    
    const transactions = await this.transactionRepository.find({
      transactionDate: {
        $gte: startDate,
        $lt: endDate,
      },
    });
    
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      year,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
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
}