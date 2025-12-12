import { Injectable } from "@nestjs/common";
import { TransactionService } from "./transaction/transaction.service";
import { TransactionType } from "./utils/enums";

interface MonthInfo {
  year: number;
  month: number;
  monthName: string;
}

interface MonthlySummaryWithMetadata {
  month: string;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  monthName: string;
}

interface YearlySummaryWithMetadata {
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
}

export interface PaginatedMonthlySummaries {
  data: MonthlySummaryWithMetadata[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedYearlySummaries {
  data: YearlySummaryWithMetadata[];
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
@Injectable()
export class AppService {
  constructor(private readonly transactionService: TransactionService) {}

  getHello(): string {
    return "Welcome to Daily Transaction Tracker API!";
  }

  async getTotalSummaryReport(): Promise<any> {
    return await this.transactionService.getSummary();
  }

  async getWeeklySummaryReport(weekStart: string): Promise<any> {
    // Calculate the end of the week (7 days from start)
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const transactions = await this.transactionService.findAll();
    
    // Filter transactions for the week
    const weeklyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.transactionDate);
      return transactionDate >= startDate && transactionDate < endDate;
    });

    const totalIncome = weeklyTransactions
      .filter(t => t.type === TransactionType.INCOME.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = weeklyTransactions
      .filter(t => t.type === TransactionType.EXPENSE.toString())
      .reduce((sum, t) => sum + t.amount, 0);
      
    return {
      period: 'weekly',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: weeklyTransactions.length,
    };
  }

  async getMonthlySummaryReport(year: number, month: number): Promise<any> {
    return await this.transactionService.getMonthlySummary(year, month);
  }

  async getPaginatedMonthlySummaries(page: number = 1, limit: number = 5): Promise<PaginatedMonthlySummaries> {
    // Generate last 12 months
    const months: MonthInfo[] = [];
    const now = new Date();
    
    // Generate last 12 months with data
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1, // JavaScript months are 0-indexed
        monthName: date.toLocaleString('default', { month: 'long' })
      });
    }
    
    // Fetch summaries for each month
    const summaries: MonthlySummaryWithMetadata[] = [];
    for (const monthInfo of months) {
      try {
        const summary = await this.transactionService.getMonthlySummary(
          monthInfo.year, 
          monthInfo.month
        );
        
        // Only include months with transactions
        if (summary.transactionCount > 0) {
          summaries.push({
            ...summary,
            monthName: monthInfo.monthName
          });
        }
      } catch (error) {
        // Skip months with no data
        console.log(`No data for ${monthInfo.monthName} ${monthInfo.year}`);
      }
    }
    
    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSummaries = summaries.slice(startIndex, endIndex);
    
    return {
      data: paginatedSummaries,
      currentPage: page,
      totalPages: Math.ceil(summaries.length / limit),
      totalRecords: summaries.length,
      hasNext: endIndex < summaries.length,
      hasPrevious: startIndex > 0
    };
  }

  async getYearlySummaryReport(year: number): Promise<any> {
    return await this.transactionService.getYearlySummary(year);
  }

  async getPaginatedYearlySummaries(page: number = 1, limit: number = 5): Promise<PaginatedYearlySummaries> {
    // Generate last 4 years
    const years: number[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Generate last 4 years with data
    for (let i = 0; i < 4; i++) {
      years.push(currentYear - i);
    }
    
    // Fetch summaries for each year
    const summaries: YearlySummaryWithMetadata[] = [];
    for (const year of years) {
      try {
        const summary = await this.transactionService.getYearlySummary(year);
        
        // Only include years with transactions
        if (summary.transactionCount > 0) {
          summaries.push({
            ...summary
          });
        }
      } catch (error) {
        // Skip years with no data
        console.log(`No data for year ${year}`);
      }
    }
    
    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSummaries = summaries.slice(startIndex, endIndex);
    
    return {
      data: paginatedSummaries,
      currentPage: page,
      totalPages: Math.ceil(summaries.length / limit),
      totalRecords: summaries.length,
      hasNext: endIndex < summaries.length,
      hasPrevious: startIndex > 0
    };
  }
}