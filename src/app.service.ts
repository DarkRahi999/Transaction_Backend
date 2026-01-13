import { Injectable } from "@nestjs/common";
import { TransactionService } from "./transaction/transaction.service";
import { SummaryResponseDto } from "./transaction/dto/summary-response.dto";

@Injectable()
export class AppService {
  constructor(private readonly transactionService: TransactionService) {}

  async getMonthlySummary(): Promise<SummaryResponseDto> {
    return await this.transactionService.getMonthlySummary();
  }

  async getYearlySummary(): Promise<SummaryResponseDto> {
    return await this.transactionService.getYearlySummary();
  }
}