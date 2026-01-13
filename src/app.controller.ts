import { Controller, Get, Query } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
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

}