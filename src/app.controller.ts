import { Controller, Get, Query } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('summary-report')
  getTotalSummaryReport() {
    return this.appService.getTotalSummaryReport();
  }

  @Get('weekly-summary')
  getWeeklySummaryReport(@Query('startDate') startDate: string) {
    return this.appService.getWeeklySummaryReport(startDate);
  }

  @Get('monthly-summary')
  getMonthlySummaryReport(@Query('year') year: number, @Query('month') month: number) {
    return this.appService.getMonthlySummaryReport(year, month);
  }

  @Get('yearly-summary')
  getYearlySummaryReport(@Query('year') year: number) {
    return this.appService.getYearlySummaryReport(year);
  }
}