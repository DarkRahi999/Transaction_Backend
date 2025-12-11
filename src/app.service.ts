import { Injectable } from "@nestjs/common";
import { TransactionService } from "./transaction/transaction.service";
import { TransactionType } from "./utils/enums";

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

  async getYearlySummaryReport(year: number): Promise<any> {
    return await this.transactionService.getYearlySummary(year);
  }
}