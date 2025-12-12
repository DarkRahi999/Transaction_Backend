import { Controller, Get, Query } from "@nestjs/common";
import { AppService, PaginatedMonthlySummaries, PaginatedYearlySummaries } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('summary-report')
  getTotalSummaryReport(): Promise<any> {
    return this.appService.getTotalSummaryReport();
  }

  @Get('weekly-summary')
  getWeeklySummaryReport(@Query('startDate') startDate: string): Promise<any> {
    return this.appService.getWeeklySummaryReport(startDate);
  }

  @Get('monthly-summary')
  getMonthlySummaryReport(@Query('year') year: number, @Query('month') month: number): Promise<any> {
    return this.appService.getMonthlySummaryReport(year, month);
  }

  @Get('current-month-summary')
  getCurrentMonthSummary() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    return this.appService.getMonthlySummaryReport(currentYear, currentMonth);
  }

  @Get('paginated-monthly-summaries')
  getPaginatedMonthlySummaries(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5
  ): Promise<PaginatedMonthlySummaries> {
    return this.appService.getPaginatedMonthlySummaries(page, limit);
  }

  @Get('paginated-yearly-summaries')
  getPaginatedYearlySummaries(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5
  ): Promise<PaginatedYearlySummaries> {
    return this.appService.getPaginatedYearlySummaries(page, limit);
  }

  @Get('yearly-summary')
  getYearlySummaryReport(@Query('year') year: number): Promise<any> {
    return this.appService.getYearlySummaryReport(year);
  }
}