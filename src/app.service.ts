import { Injectable } from "@nestjs/common";
import { TransactionService } from "./transaction/transaction.service";

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

  async getMonthlySummaryReport(year: number, month: number): Promise<any> {
    return await this.transactionService.getMonthlySummary(year, month);
  }
}